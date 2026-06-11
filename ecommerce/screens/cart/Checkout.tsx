import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { dbService } from '../../database/DatabaseService';
import { formatVND } from '../../utils/formatters';
import { useToast } from '../../components/Toast';
import { C } from '../../theme/colors';

export default function Checkout({ navigation }: { navigation: any }) {
  const { show: showToast, ToastView } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useFocusEffect(useCallback(() => {
    const user = dbService.getCurrentUser();
    if (!user) { navigation.navigate('Login'); return; }
    if (user.phone) setPhone(user.phone);
    if (user.address) setAddress(user.address);
    (async () => {
      setItems(await dbService.getCart(user.id));
      setSuggestions(await dbService.getUserCoupons(user.id));
    })();
  }, []));

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = Math.max(0, subtotal - discount);

  const handleApplyCoupon = async (code?: string) => {
    const c = code || couponCode.trim();
    if (!c) return;
    const user = dbService.getCurrentUser();
    try {
      const result = await dbService.applyCoupon(c, subtotal, user?.id);
      setDiscount(result.discountAmount);
      setAppliedCode(result.code);
      setCouponCode('');
      showToast(`Giảm ${formatVND(result.discountAmount)}`);
    } catch (e: any) { Alert.alert('Lỗi', e.message); }
  };

  const handleCheckout = async () => {
    if (!phone.trim()) { Alert.alert('Lỗi', 'Nhập số điện thoại'); return; }
    if (!address.trim()) { Alert.alert('Lỗi', 'Nhập địa chỉ giao hàng'); return; }
    const user = dbService.getCurrentUser();
    if (!user) { navigation.navigate('Login'); return; }
    setLoading(true);
    try {
      await dbService.checkout(user.id, phone.trim(), address.trim(), note.trim(), discount);
      showToast('Đặt hàng thành công!');
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (e: any) { Alert.alert('Lỗi', e?.message || 'Không thể thanh toán'); }
    finally { setLoading(false); }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      {ToastView}
      <Text style={s.title}>Xác nhận đơn hàng</Text>
      <View style={s.card}>
        {items.map((item, i) => (
          <View key={i} style={s.itemRow}>
            <Text style={s.itemName}>{item.productName} x{item.quantity}</Text>
            <Text style={s.itemPrice}>{formatVND(item.price * item.quantity)}</Text>
          </View>
        ))}
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Tạm tính</Text>
          <Text style={s.totalPrice}>{formatVND(subtotal)}</Text>
        </View>
        {discount > 0 && (
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Giảm ({appliedCode})</Text>
            <Text style={[s.totalPrice, { color: C.success }]}>-{formatVND(discount)}</Text>
          </View>
        )}
        <View style={s.totalRow}>
          <Text style={[s.totalLabel, { fontSize: 18 }]}>Tổng cộng</Text>
          <Text style={[s.totalPrice, { fontSize: 18 }]}>{formatVND(total)}</Text>
        </View>
      </View>

      <View style={s.couponRow}>
        <TextInput style={[s.input, { flex: 1, marginBottom: 0, minHeight: 44 }]} placeholder="Nhập mã giảm giá" placeholderTextColor={C.textLight} value={couponCode} onChangeText={setCouponCode} autoCapitalize="characters" />
        <TouchableOpacity style={s.applyBtn} onPress={() => handleApplyCoupon()}><Text style={s.applyBtnText}>Áp dụng</Text></TouchableOpacity>
      </View>

      {suggestions.filter(s => !s.locked).length > 0 && (
        <View style={s.suggestWrap}>
          <Text style={s.suggestTitle}>🎫 Voucher của bạn</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {suggestions.filter(s => !s.locked).map((c, i) => (
              <TouchableOpacity key={i} style={s.suggestCard} onPress={() => handleApplyCoupon(c.code)}>
                <Text style={s.suggestCode}>{c.code}</Text>
                <Text style={s.suggestValue}>{c.type === 'percent' ? `Giảm ${c.discount}%` : `Giảm ${formatVND(c.discount)}`}</Text>
                {c.minOrder > 0 && <Text style={s.suggestNote}>Đơn từ {formatVND(c.minOrder)}</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <TextInput style={s.input} placeholder="Số điện thoại *" placeholderTextColor={C.textLight} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextInput style={s.input} placeholder="Địa chỉ giao hàng *" placeholderTextColor={C.textLight} value={address} onChangeText={setAddress} multiline />
      <TextInput style={s.input} placeholder="Ghi chú (không bắt buộc)" placeholderTextColor={C.textLight} value={note} onChangeText={setNote} multiline />
      <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={handleCheckout} disabled={loading}>
        <Text style={s.btnText}>{loading ? 'Đang xử lý...' : 'Đặt hàng'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  title: { fontSize: 20, fontWeight: 'bold', color: C.text, marginBottom: 16 },
  card: { backgroundColor: C.card, borderRadius: 8, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  itemName: { fontSize: 13, color: C.text, flex: 1 },
  itemPrice: { fontSize: 13, fontWeight: '600', color: C.primary },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8 },
  totalLabel: { fontSize: 14, fontWeight: '600', color: C.text },
  totalPrice: { fontSize: 14, fontWeight: 'bold', color: C.primary },
  couponRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  input: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 8, padding: 14, fontSize: 14, color: C.text, marginBottom: 12, minHeight: 48 },
  applyBtn: { backgroundColor: C.primary, height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  applyBtnText: { color: C.white, fontWeight: 'bold', fontSize: 13 },
  suggestWrap: { marginBottom: 12 },
  suggestTitle: { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 8 },
  suggestCard: { backgroundColor: '#fff3e0', borderRadius: 8, padding: 12, minWidth: 120, borderWidth: 1, borderColor: C.primary },
  suggestCode: { fontSize: 13, fontWeight: 'bold', color: C.primary },
  suggestValue: { fontSize: 11, color: C.text, marginTop: 2 },
  suggestNote: { fontSize: 9, color: C.textLight, marginTop: 2 },
  btn: { backgroundColor: C.primary, height: 48, borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  btnText: { color: C.white, fontWeight: 'bold', fontSize: 15 },
});
