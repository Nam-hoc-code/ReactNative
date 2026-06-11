import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { dbService } from '../../database/DatabaseService';
import { C } from '../../theme/colors';

const ROLES = ['User', 'Admin'];

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const load = async () => setUsers(await dbService.getAllUsers());
  useEffect(() => { load(); }, []);

  const handleChangeRole = async (userId: number, newRole: string) => {
    const cur = dbService.getCurrentUser();
    if (cur && cur.id === userId && newRole === 'User') {
      Alert.alert('Lỗi', 'Không thể tự hạ role của mình');
      return;
    }
    await dbService.updateUserRole(userId, newRole as 'Admin' | 'User');
    await load();
  };

  const handleDelete = (user: any) => {
    const cur = dbService.getCurrentUser();
    if (cur && cur.id === user.id) { Alert.alert('Lỗi', 'Không thể tự xóa'); return; }
    Alert.alert('Xác nhận', `Xóa "${user.username}"?`, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: async () => { await dbService.deleteUser(user.id, cur?.id || 0); await load(); }},
    ]);
  };

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: C.bg, padding: 12 }}
      data={users}
      keyExtractor={i => i.id.toString()}
      renderItem={({ item }) => (
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{item.fullname}</Text>
            <Text style={s.sub}>@{item.username} | {item.email}</Text>
            <View style={s.roleGroup}>
              {ROLES.map(r => (
                <TouchableOpacity
                  key={r}
                  style={[s.roleOpt, item.role === r && s.roleOptActive]}
                  onPress={() => { if (item.role !== r) handleChangeRole(item.id, r); }}
                >
                  <Text style={[s.roleOptText, item.role === r && s.roleOptTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity style={[s.btn, { backgroundColor: C.danger }]} onPress={() => handleDelete(item)}>
            <Text style={s.btnText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      )}
      ListEmptyComponent={<View style={{ alignItems: 'center', paddingTop: 40 }}><Text style={{ color: C.textLight }}>Không có người dùng</Text></View>}
    />
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  name: { fontSize: 14, fontWeight: 'bold', color: C.text },
  sub: { fontSize: 11, color: C.textSecondary, marginTop: 2 },
  roleGroup: { flexDirection: 'row', marginTop: 6, gap: 6 },
  roleOpt: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 14, borderWidth: 1, borderColor: C.border, backgroundColor: C.bg },
  roleOptActive: { backgroundColor: C.primary, borderColor: C.primary },
  roleOptText: { fontSize: 11, color: C.textSecondary, fontWeight: '600' },
  roleOptTextActive: { color: C.white },
  btn: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: C.white, fontSize: 11, fontWeight: 'bold' },
});
