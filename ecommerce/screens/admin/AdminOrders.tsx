import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { dbService } from '../../database/DatabaseService';
import { formatVND, formatDate, getStatusText, getStatusColor } from '../../utils/formatters';
import { C } from '../../theme/colors';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const load = async () => setOrders(await dbService.getAllOrders());
  useEffect(() => { load(); }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const handleConfirm = async (order: any) => {
    const ok = await dbService.updateOrderStatus(order.id, 'Confirmed');
    if (ok) { await load(); Alert.alert('Thành công', 'Đã xác nhận đơn hàng'); }
    else Alert.alert('Lỗi', 'Không thể cập nhật');
  };

  const handleShip = async (order: any) => {
    const ok = await dbService.updateOrderStatus(order.id, 'Shipping');
    if (ok) { await load(); Alert.alert('Thành công', 'Đã chuyển sang đang giao'); }
    else Alert.alert('Lỗi', 'Không thể cập nhật');
  };

  const handleComplete = async (order: any) => {
    Alert.alert('Không thể', 'Chỉ người dùng mới có thể xác nhận hoàn thành sau khi nhận hàng');
  };

  const renderActions = (item: any) => {
    switch (item.status) {
      case 'Pending':
        return (
          <View style={s.actions}>
            <TouchableOpacity style={[s.actionBtn, { backgroundColor: C.primary }]} onPress={() => handleConfirm(item)}>
              <Text style={s.actionText}>Xác nhận</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.actionBtn, { backgroundColor: C.danger }]} onPress={() => Alert.alert('Xác nhận', 'Hủy đơn hàng này?', [
              { text: 'Hủy', style: 'cancel', onPress: () => Promise.resolve() },
              { text: 'Xóa', style: 'destructive', onPress: async () => { await dbService.updateOrderStatus(item.id, 'Cancelled'); await load(); }},
            ])}>
              <Text style={s.actionText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        );
      case 'Confirmed':
        return (
          <View style={s.actions}>
            <TouchableOpacity style={[s.actionBtn, { backgroundColor: C.primary }]} onPress={() => handleShip(item)}>
              <Text style={s.actionText}>Đang giao</Text>
            </TouchableOpacity>
          </View>
        );
      case 'Shipping':
        return (
          <View style={s.actions}>
            <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#cbd5e1' }]} onPress={() => handleComplete(item)}>
              <Text style={[s.actionText, { color: C.textSecondary }]}>Hoàn thành (chờ người dùng)</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: C.bg, padding: 12 }}
      data={filtered}
      keyExtractor={i => i.id.toString()}
      ListHeaderComponent={
        <View style={s.filterRow}>
          {['all', 'Pending', 'Confirmed', 'Shipping', 'Completed', 'Cancelled'].map(f => (
            <TouchableOpacity key={f} style={[s.filterBtn, filter === f && s.filterActive]} onPress={() => setFilter(f)}>
              <Text style={[s.filterText, filter === f && s.filterTextActive]}>{f === 'all' ? 'Tất cả' : getStatusText(f)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      }
      renderItem={({ item }) => (
        <View style={s.card}>
          <TouchableOpacity style={s.header} onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}>
            <View>
              <Text style={s.orderId}>ĐH #{item.id}</Text>
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
              <Text style={s.info}>Khách: {item.customerName || `User#${item.userId}`}{item.phone ? ` • 📞 ${item.phone}` : ''}</Text>
              {item.items?.map((oi: any, idx: number) => (
                <Text key={idx} style={s.item}>• {oi.productName} x{oi.quantity} - {formatVND(oi.unitPrice * oi.quantity)}</Text>
              ))}
              {renderActions(item)}
            </View>
          )}
        </View>
      )}
      ListEmptyComponent={<View style={{ alignItems: 'center', paddingTop: 60 }}><Text style={{ color: C.textLight }}>Không có đơn hàng nào</Text></View>}
    />
  );
}

const s = StyleSheet.create({
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  filterBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  filterActive: { backgroundColor: C.primary, borderColor: C.primary },
  filterText: { fontSize: 11, color: C.textSecondary, fontWeight: '600' },
  filterTextActive: { color: C.white },
  card: { backgroundColor: C.card, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 14 },
  orderId: { fontSize: 14, fontWeight: 'bold', color: C.text },
  date: { fontSize: 11, color: C.textSecondary, marginTop: 2 },
  total: { fontSize: 14, fontWeight: 'bold', color: C.primary },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  body: { borderTopWidth: 1, borderTopColor: C.border, padding: 14 },
  info: { fontSize: 12, color: C.textSecondary, marginBottom: 6 },
  item: { fontSize: 12, color: C.text, marginBottom: 3 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actionBtn: { flex: 1, height: 36, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  actionText: { color: C.white, fontWeight: 'bold', fontSize: 12 },
});
