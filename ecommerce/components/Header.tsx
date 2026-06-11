import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { dbService } from '../database/DatabaseService';
import { C } from '../theme/colors';

export default function Header({ navigation }: { navigation: any }) {
  const user = dbService.getCurrentUser();

  const handleLogout = () => {
    dbService.logout();
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  return (
    <View style={s.wrap}>
      <View style={s.left}>
        <Text style={s.logo}>Shop</Text>
        {user && (
          <View style={s.userBadge}>
            <Text style={s.userName}>{user.fullname}</Text>
            <Text style={s.userRole}>{user.role}</Text>
          </View>
        )}
      </View>
      {user ? (
        <TouchableOpacity onPress={handleLogout} style={s.btn}>
          <Text style={s.btnText}>Đăng xuất</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={[s.btn, { backgroundColor: C.primary }]}>
            <Text style={s.btnText}>Đăng nhập</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={[s.btn, { backgroundColor: C.accent }]}>
            <Text style={s.btnText}>Đăng ký</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.primary, paddingHorizontal: 16, paddingVertical: 10 },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  logo: { fontSize: 20, fontWeight: 'bold', color: C.white, marginRight: 12 },
  userBadge: {},
  userName: { color: C.white, fontSize: 13, fontWeight: '600' },
  userRole: { color: 'rgba(255,255,255,0.7)', fontSize: 10 },
  btn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  btnText: { color: C.white, fontSize: 12, fontWeight: 'bold' },
});
