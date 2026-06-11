import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet, Switch } from 'react-native';
import { dbService } from '../../database/DatabaseService';
import { Coupon } from '../../database/types';
import { C } from '../../theme/colors';
import { formatVND } from '../../utils/formatters';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [type, setType] = useState<'percent' | 'fixed'>('percent');
  const [minOrder, setMinOrder] = useState('');
  const [condition, setCondition] = useState<'none' | 'new_user'>('none');

  const load = async () => setCoupons(await dbService.getCoupons());
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!code.trim() || !discount.trim()) { Alert.alert('Lỗi', 'Nhập mã và giá trị giảm'); return; }
    const d = parseFloat(discount);
    if (isNaN(d) || d <= 0) { Alert.alert('Lỗi', 'Giá trị không hợp lệ'); return; }
    if (type === 'percent' && d > 100) { Alert.alert('Lỗi', 'Giảm % không được > 100'); return; }
    const mo = parseFloat(minOrder) || 0;
    const exp = new Date(); exp.setFullYear(exp.getFullYear() + 1);
    try {
      await dbService.addCoupon(code.trim(), d, type, mo, exp.toISOString(), condition);
      setCode(''); setDiscount(''); setType('percent'); setMinOrder(''); setCondition('none');
      await load();
      Alert.alert('Thành công', 'Đã thêm mã giảm giá');
    } catch (e: any) { Alert.alert('Lỗi', e.message); }
  };

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: C.bg, padding: 12 }}
      data={coupons}
      keyExtractor={i => i.id.toString()}
      ListHeaderComponent={
        <View style={s.form}>
          <Text style={s.formTitle}>Thêm mã giảm giá</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
            <TextInput style={[s.input, { flex: 1 }]} placeholder="Mã code" value={code} onChangeText={setCode} autoCapitalize="characters" />
            <TextInput style={[s.input, { width: 100 }]} placeholder="Giá trị" value={discount} onChangeText={setDiscount} keyboardType="numeric" />
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
            <TouchableOpacity style={[s.typeBtn, type === 'percent' && s.typeActive]} onPress={() => setType('percent')}><Text style={[s.typeText, type === 'percent' && s.typeTextActive]}>%</Text></TouchableOpacity>
            <TouchableOpacity style={[s.typeBtn, type === 'fixed' && s.typeActive]} onPress={() => setType('fixed')}><Text style={[s.typeText, type === 'fixed' && s.typeTextActive]}>VNĐ</Text></TouchableOpacity>
            <TextInput style={[s.input, { flex: 1 }]} placeholder="Đơn tối thiểu" value={minOrder} onChangeText={setMinOrder} keyboardType="numeric" />
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
            <TouchableOpacity style={[s.typeBtn, condition === 'none' && s.typeActive]} onPress={() => setCondition('none')}><Text style={[s.typeText, condition === 'none' && s.typeTextActive]}>Không ĐK</Text></TouchableOpacity>
            <TouchableOpacity style={[s.typeBtn, condition === 'new_user' && s.typeActive]} onPress={() => setCondition('new_user')}><Text style={[s.typeText, condition === 'new_user' && s.typeTextActive]}>Người mới</Text></TouchableOpacity>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={handleAdd}><Text style={s.addBtnText}>Lưu</Text></TouchableOpacity>
        </View>
      }
      renderItem={({ item }) => (
        <View style={s.card}>
          <View style={{ flex: 1 }}>
            <Text style={s.code}>{item.code}</Text>
            <Text style={s.detail}>{item.type === 'percent' ? `${item.discount}%` : formatVND(item.discount)}{item.minOrder > 0 ? ` (tối thiểu ${formatVND(item.minOrder)})` : ''}{item.condition === 'new_user' ? ' • Người mới' : ''}</Text>
          </View>
          <Switch value={item.active} onValueChange={async () => { await dbService.toggleCoupon(item.id); await load(); }} />
          <TouchableOpacity style={s.delBtn} onPress={() => Alert.alert('Xác nhận', `Xóa "${item.code}"?`, [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Xóa', style: 'destructive', onPress: async () => { await dbService.deleteCoupon(item.id); await load(); }},
          ])}><Text style={s.delBtnText}>Xóa</Text></TouchableOpacity>
        </View>
      )}
      ListEmptyComponent={<View style={{ alignItems: 'center', paddingTop: 40 }}><Text style={{ color: C.textLight }}>Chưa có mã giảm giá</Text></View>}
    />
  );
}

const s = StyleSheet.create({
  form: { backgroundColor: C.card, borderRadius: 8, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  formTitle: { fontSize: 15, fontWeight: 'bold', color: C.text, marginBottom: 10 },
  input: { backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.border, borderRadius: 4, height: 40, paddingHorizontal: 10, fontSize: 13, color: C.text },
  typeBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 4, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, justifyContent: 'center' },
  typeActive: { backgroundColor: C.primary, borderColor: C.primary },
  typeText: { fontSize: 13, fontWeight: '600', color: C.textSecondary },
  typeTextActive: { color: C.white },
  addBtn: { backgroundColor: C.primary, height: 40, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: C.white, fontWeight: 'bold', fontSize: 13 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  code: { fontSize: 15, fontWeight: 'bold', color: C.text },
  detail: { fontSize: 11, color: C.textSecondary, marginTop: 2 },
  delBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4, backgroundColor: C.danger, marginLeft: 6 },
  delBtnText: { color: C.white, fontSize: 10, fontWeight: 'bold' },
});
