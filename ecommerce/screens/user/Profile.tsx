import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { dbService } from '../../database/DatabaseService';
import { User } from '../../database/types';
import { C } from '../../theme/colors';

export default function Profile({ navigation }: { navigation: any }) {
  const [user, setUser] = useState<User | null>(null);

  useFocusEffect(() => { setUser(dbService.getCurrentUser()); });

  const handleLogout = () => {
    dbService.logout();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  if (!user) {
    return (
      <View style={s.center}>
        <Text style={{ color: C.textSecondary, marginBottom: 16, fontSize: 15 }}>Vui lòng đăng nhập</Text>
        <TouchableOpacity style={s.loginBtn} onPress={() => navigation.navigate('Login')}><Text style={s.loginBtnText}>Đăng nhập</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={s.container}>
      <View style={s.headerBg}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{user.fullname.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={s.name}>{user.fullname}</Text>
        <Text style={s.email}>{user.email}</Text>
        {user.phone ? <Text style={s.email}>📞 {user.phone}</Text> : null}
        {user.address ? <Text style={s.email}>📍 {user.address}</Text> : null}
        <View style={s.roleBadge}><Text style={s.roleText}>{user.role}</Text></View>
      </View>
      <View style={s.menu}>
        <TouchableOpacity style={s.menuItem} onPress={() => navigation.navigate('EditProfile')}>
          <Text style={s.menuIcon}>✏️</Text>
          <Text style={s.menuText}>Chỉnh sửa hồ sơ</Text>
          <Text style={s.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.menuItem} onPress={() => navigation.navigate('UserCoupons')}>
          <Text style={s.menuIcon}>🎫</Text>
          <Text style={s.menuText}>Voucher của tôi</Text>
          <Text style={s.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.menuItem} onPress={() => navigation.navigate('OrderHistory')}>
          <Text style={s.menuIcon}>📋</Text>
          <Text style={s.menuText}>Lịch sử đơn hàng</Text>
          <Text style={s.arrow}>›</Text>
        </TouchableOpacity>
        {user.role === 'Admin' && (
          <TouchableOpacity style={s.menuItem} onPress={() => navigation.navigate('AdminDashboard')}>
            <Text style={s.menuIcon}>⚙️</Text>
            <Text style={s.menuText}>Quản trị</Text>
            <Text style={s.arrow}>›</Text>
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}><Text style={s.logoutBtnText}>Đăng xuất</Text></TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },
  headerBg: { backgroundColor: C.primary, paddingTop: 30, paddingBottom: 24, alignItems: 'center' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarText: { color: C.white, fontSize: 30, fontWeight: 'bold' },
  name: { color: C.white, fontSize: 18, fontWeight: 'bold' },
  email: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  roleBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 3, borderRadius: 10, marginTop: 8 },
  roleText: { color: C.white, fontSize: 11, fontWeight: 'bold' },
  menu: { backgroundColor: C.card, marginTop: 12, marginHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: C.border },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  menuIcon: { fontSize: 18, marginRight: 12 },
  menuText: { flex: 1, fontSize: 14, color: C.text },
  arrow: { fontSize: 20, color: C.textLight },
  logoutBtn: { marginHorizontal: 12, marginTop: 20, backgroundColor: C.danger, height: 44, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  logoutBtnText: { color: C.white, fontWeight: 'bold', fontSize: 15 },
  loginBtn: { backgroundColor: C.primary, paddingHorizontal: 32, height: 44, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  loginBtnText: { color: C.white, fontWeight: 'bold', fontSize: 15 },
});
