import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C } from '../../theme/colors';

const MENU = [
  { key: 'AdminUsers', label: 'Quản lý người dùng', icon: '👥', desc: 'Xem, cập nhật vai trò, xóa' },
  { key: 'AdminCategories', label: 'Quản lý loại sản phẩm', icon: '📂', desc: 'Xem, thêm, sửa, xóa loại' },
  { key: 'AdminProducts', label: 'Quản lý sản phẩm', icon: '📦', desc: 'Xem, thêm, sửa, xóa sản phẩm' },
  { key: 'AdminOrders', label: 'Quản lý đơn hàng', icon: '📋', desc: 'Xem, cập nhật trạng thái' },
  { key: 'AdminCoupons', label: 'Quản lý coupon', icon: '🎫', desc: 'Thêm, bật/tắt, xóa mã giảm giá' },
];

export default function AdminDashboard({ navigation }: { navigation: any }) {
  return (
    <View style={s.container}>
      <Text style={s.title}>Trang chủ quản trị</Text>
      <Text style={s.sub}>Chọn chức năng bên dưới</Text>
      <View style={s.grid}>
        {MENU.map((item) => (
          <TouchableOpacity key={item.key} style={s.card} onPress={() => navigation.navigate(item.key)}>
            <Text style={s.icon}>{item.icon}</Text>
            <Text style={s.label}>{item.label}</Text>
            <Text style={s.desc}>{item.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: C.text, marginBottom: 4 },
  sub: { fontSize: 13, color: C.textSecondary, marginBottom: 20 },
  grid: { gap: 12 },
  card: { backgroundColor: C.card, borderRadius: 8, padding: 16, borderWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 28, marginRight: 14 },
  label: { fontSize: 15, fontWeight: 'bold', color: C.text },
  desc: { fontSize: 11, color: C.textSecondary, marginTop: 2 },
});
