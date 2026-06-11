import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { dbService } from '../../database/DatabaseService';
import { Order } from '../../database/types';
import { formatVND, formatDate, getStatusText, getStatusColor } from '../../utils/formatters';
import { C } from '../../theme/colors';

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = async () => {
    const user = dbService.getCurrentUser();
    if (user) setOrders(await dbService.getOrders(user.id));
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const handleConfirmReceived = (order: Order) => {
    Alert.alert('Xác nhận', 'Bạn đã nhận được hàng?', [
      { text: 'Chưa', style: 'cancel', onPress: () => Promise.resolve() },
      { text: 'Đã nhận', onPress: async () => {
        const ok = await dbService.updateOrderStatus(order.id, 'Completed');
        if (ok) { await load(); Alert.alert('🎉 Thành công', 'Cảm ơn bạn đã mua hàng!'); }
        else Alert.alert('Lỗi', 'Không thể cập nhật');
      }},
    ]);
  };

  return (
    <FlatList
      style={s.container}
      data={orders}
      keyExtractor={i => i.id.toString()}
      renderItem={({ item }) => (
        <View style={s.card}>
          <TouchableOpacity style={s.header} onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}>
            <View>
              <Text style={s.orderId}>Đơn hàng #{item.id}</Text>
              <Text style={s.date}>{formatDate(item.orderDate)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.total}>{formatVND(item.totalAmount)}</Text>
              <View style={[s.badge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <Text style={[s.badgeText, { color: getStatusColor(item.status) }]}>{getStatusText(item.status)}</Text>
              </View>
            </View>
          </TouchableOpacity>
          {expandedId === item.id && (
            <View style={s.body}>
              <Text style={s.info}>📞 {item.phone} • 📍 {item.address}</Text>
              {item.note ? <Text style={s.note}>Ghi chú: {item.note}</Text> : null}
              {(item.items || []).map((oi, idx) => (
                <Text key={idx} style={s.item}>• {oi.productName} x{oi.quantity} - {formatVND(oi.unitPrice * oi.quantity)}</Text>
              ))}
              {item.status === 'Shipping' && (
                <TouchableOpacity style={s.confirmBtn} onPress={() => handleConfirmReceived(item)}>
                  <Text style={s.confirmBtnText}>✓ Đã nhận hàng</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}
      ListEmptyComponent={<View style={{ alignItems: 'center', paddingTop: 60 }}><Text style={{ color: C.textSecondary }}>Chưa có đơn hàng</Text></View>}
    />
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, padding: 12 },
  card: { backgroundColor: C.card, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 14 },
  orderId: { fontSize: 14, fontWeight: 'bold', color: C.text },
  date: { fontSize: 11, color: C.textSecondary, marginTop: 2 },
  total: { fontSize: 14, fontWeight: 'bold', color: C.primary },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  body: { borderTopWidth: 1, borderTopColor: C.border, padding: 14 },
  info: { fontSize: 12, color: C.textSecondary, marginBottom: 6 },
  note: { fontSize: 12, color: C.textLight, fontStyle: 'italic', marginBottom: 6 },
  item: { fontSize: 12, color: C.text, marginBottom: 3, paddingLeft: 4 },
  confirmBtn: { backgroundColor: C.success, paddingVertical: 12, borderRadius: 4, alignItems: 'center', marginTop: 10 },
  confirmBtnText: { color: C.white, fontWeight: 'bold', fontSize: 14 },
});
