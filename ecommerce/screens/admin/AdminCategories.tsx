import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Animated } from 'react-native';
import { dbService } from '../../database/DatabaseService';
import { Category } from '../../database/types';
import { C } from '../../theme/colors';

export default function AdminCategories({ navigation }: { navigation: any }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; name: string } | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const msgOpacity = useRef(new Animated.Value(0)).current;

  const showMsg = (text: string, ok: boolean) => {
    setMsg({ text, ok });
    Animated.sequence([
      Animated.timing(msgOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(msgOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setMsg(null));
  };

  const load = async () => setCategories(await dbService.getCategories());
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!newName.trim()) { showMsg('Nhập tên danh mục', false); return; }
    try {
      await dbService.addCategory(newName.trim());
      setNewName(''); await load();
      showMsg('Đã thêm danh mục', true);
    } catch (e: any) { showMsg(e?.message || 'Lỗi', false); }
  };

  const handleSaveEdit = async (id: number) => {
    if (!editName.trim()) { showMsg('Tên không được trống', false); return; }
    try {
      await dbService.updateCategory(id, editName.trim());
      setEditingId(null); setEditName(''); await load();
    } catch (e: any) { showMsg(e?.message || 'Lỗi', false); }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    try {
      await dbService.deleteCategory(confirmDelete.id);
      setConfirmDelete(null); await load();
      showMsg('Đã xóa danh mục', true);
    } catch (e: any) { showMsg(e?.message || 'Lỗi', false); setConfirmDelete(null); }
  };

  return (
    <View style={s.container}>
      {msg && (
        <Animated.View style={[s.msgBar, { backgroundColor: msg.ok ? '#16a34a' : '#ef4444', opacity: msgOpacity }]}>
          <Text style={s.msgText}>{msg.text}</Text>
        </Animated.View>
      )}
      {confirmDelete && (
        <View style={s.confirmOverlay}>
          <View style={s.confirmBox}>
            <Text style={s.confirmTitle}>Xác nhận</Text>
            <Text style={s.confirmText}>Xóa "{confirmDelete.name}"?</Text>
            <View style={s.confirmActions}>
              <TouchableOpacity style={[s.confirmBtn, { backgroundColor: C.textLight }]} onPress={() => setConfirmDelete(null)}><Text style={s.confirmBtnText}>Hủy</Text></TouchableOpacity>
              <TouchableOpacity style={[s.confirmBtn, { backgroundColor: C.danger }]} onPress={handleDeleteConfirm}><Text style={s.confirmBtnText}>Xóa</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      <FlatList
        data={categories}
        keyExtractor={i => i.id.toString()}
        ListHeaderComponent={
          <View style={s.addRow}>
            <TextInput style={s.input} placeholder="Thêm danh mục..." placeholderTextColor={C.textLight} value={newName} onChangeText={setNewName} />
            <TouchableOpacity style={s.addBtn} onPress={handleAdd}><Text style={s.addBtnText}>+</Text></TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          if (editingId === item.id) {
            return (
              <View style={s.row}>
                <TextInput style={[s.input, { flex: 1, marginRight: 8 }]} value={editName} onChangeText={setEditName} />
                <TouchableOpacity style={s.smallBtn} onPress={() => handleSaveEdit(item.id)}><Text style={s.smallBtnText}>Lưu</Text></TouchableOpacity>
                <TouchableOpacity style={[s.smallBtn, { backgroundColor: C.textLight }]} onPress={() => { setEditingId(null); setEditName(''); }}><Text style={s.smallBtnText}>Hủy</Text></TouchableOpacity>
              </View>
            );
          }
          return (
            <View style={s.row}>
              <Text style={s.catName}>{item.name}</Text>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity style={[s.smallBtn, { backgroundColor: '#10b981', marginRight: 4 }]} onPress={() => navigation.navigate('AdminProducts', { categoryId: item.id })}><Text style={s.smallBtnText}>+ SP</Text></TouchableOpacity>
                <TouchableOpacity style={[s.smallBtn, { backgroundColor: C.accent, marginRight: 4 }]} onPress={() => { setEditingId(item.id); setEditName(item.name); }}><Text style={s.smallBtnText}>Sửa</Text></TouchableOpacity>
                <TouchableOpacity style={[s.smallBtn, { backgroundColor: C.danger }]} onPress={() => setConfirmDelete({ id: item.id, name: item.name })}><Text style={s.smallBtnText}>Xóa</Text></TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<View style={{ alignItems: 'center', paddingTop: 40 }}><Text style={{ color: C.textLight }}>Chưa có danh mục nào</Text></View>}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: C.bg },
  msgBar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 999, paddingVertical: 10, paddingHorizontal: 16 },
  msgText: { color: C.white, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  confirmOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 998, justifyContent: 'center', alignItems: 'center' },
  confirmBox: { backgroundColor: C.card, borderRadius: 10, padding: 20, width: '80%', maxWidth: 320, borderWidth: 1, borderColor: C.border },
  confirmTitle: { fontSize: 16, fontWeight: 'bold', color: C.text, marginBottom: 8 },
  confirmText: { fontSize: 14, color: C.textSecondary, marginBottom: 16 },
  confirmActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  confirmBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6 },
  confirmBtnText: { color: C.white, fontSize: 13, fontWeight: 'bold' },
  addRow: { flexDirection: 'row', marginBottom: 16 },
  input: { flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 4, paddingHorizontal: 12, height: 40, fontSize: 13, color: C.text },
  addBtn: { width: 40, height: 40, borderRadius: 4, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  addBtnText: { color: C.white, fontSize: 20, fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  catName: { fontSize: 14, color: C.text, fontWeight: '500' },
  smallBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  smallBtnText: { color: C.white, fontSize: 11, fontWeight: 'bold' },
});
