import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, StyleSheet, Animated } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { dbService } from '../../database/DatabaseService';
import { Product, Category } from '../../database/types';
import { formatVND } from '../../utils/formatters';
import { getImg } from '../../utils/images';
import { C } from '../../theme/colors';

export default function AdminProducts({ route }: { route?: any }) {
  const initCatId: number | null = route?.params?.categoryId ?? null;
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(!!initCatId);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [img, setImg] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(initCatId);
  const [description, setDescription] = useState('');
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

  const load = async () => {
    const [cats, prods] = await Promise.all([dbService.getCategories(), dbService.getProducts(search)]);
    setCategories(cats); setProducts(prods);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { const t = setTimeout(() => load(), 300); return () => clearTimeout(t); }, [search]);

  const resetForm = () => { setName(''); setPrice(''); setImg(''); setCategoryId(null); setDescription(''); setEditProduct(null); setShowForm(false); };

  const handleSave = async () => {
    if (!name.trim() || !price.trim() || categoryId === null) { showMsg('Nhập đầy đủ thông tin', false); return; }
    const p = parseFloat(price);
    if (isNaN(p) || p <= 0) { showMsg('Giá phải là số dương', false); return; }
    const url = img.trim() || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400';
    try {
      if (editProduct) await dbService.updateProduct(editProduct.id, name.trim(), p, url, categoryId, description.trim() || undefined);
      else await dbService.addProduct(name.trim(), p, url, categoryId, description.trim() || undefined);
      resetForm(); await load();
      showMsg(editProduct ? 'Đã cập nhật sản phẩm' : 'Đã thêm sản phẩm', true);
    } catch (e: any) { showMsg(e?.message || 'Lỗi', false); }
  };

  const handleEdit = (p: Product) => { setEditProduct(p); setName(p.name); setPrice(p.price.toString()); setImg(p.img); setCategoryId(p.categoryId); setDescription(p.description || ''); setShowForm(true); };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { showMsg('Cần cấp quyền truy cập thư viện ảnh', false); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled && result.assets.length > 0) setImg(result.assets[0].uri);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    try {
      await dbService.deleteProduct(confirmDelete.id);
      setConfirmDelete(null); await load();
      showMsg('Đã xóa sản phẩm', true);
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
        data={products}
        keyExtractor={i => i.id.toString()}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListHeaderComponent={
          <View>
            <View style={s.searchRow}>
              <TextInput style={s.searchInput} placeholder="Tìm sản phẩm..." placeholderTextColor={C.textLight} value={search} onChangeText={setSearch} />
              <TouchableOpacity style={s.addBtn} onPress={() => { resetForm(); setShowForm(!showForm); }}><Text style={s.addBtnText}>+</Text></TouchableOpacity>
            </View>
            {showForm && (
              <View style={s.form}>
                <Text style={s.formTitle}>{editProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</Text>
                <TextInput style={s.input} placeholder="Tên sản phẩm" placeholderTextColor={C.textLight} value={name} onChangeText={setName} />
                <TextInput style={s.input} placeholder="Giá (VNĐ)" placeholderTextColor={C.textLight} value={price} onChangeText={setPrice} keyboardType="numeric" />
                <TextInput style={[s.input, { minHeight: 60, textAlignVertical: 'top' }]} placeholder="Mô tả sản phẩm" placeholderTextColor={C.textLight} value={description} onChangeText={setDescription} multiline />
                {img ? <Image source={getImg(img)} style={s.preview} /> : null}
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                  <TextInput style={[s.input, { flex: 1, marginBottom: 0 }]} placeholder="URL hình ảnh" placeholderTextColor={C.textLight} value={img} onChangeText={setImg} />
                  <TouchableOpacity style={s.pickBtn} onPress={pickImage}><Text style={{ fontSize: 18 }}>📁</Text></TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
                  {categories.map(c => (
                    <TouchableOpacity key={c.id} style={[s.chip, categoryId === c.id && s.chipActive]} onPress={() => setCategoryId(c.id)}>
                      <Text style={[s.chipText, categoryId === c.id && s.chipTextActive]}>{c.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity style={[s.saveBtn, { flex: 1 }]} onPress={handleSave}><Text style={s.saveBtnText}>Lưu</Text></TouchableOpacity>
                  <TouchableOpacity style={[s.saveBtn, { flex: 1, backgroundColor: C.textLight, marginLeft: 8 }]} onPress={resetForm}><Text style={s.saveBtnText}>Hủy</Text></TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <Image source={getImg(item.img)} style={s.img} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.itemName}>{item.name}</Text>
              <Text style={s.itemPrice}>{formatVND(item.price)}</Text>
              <Text style={s.itemCat}>{item.categoryName || 'Chưa phân loại'}</Text>
            </View>
            <View>
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: C.accent, marginBottom: 4 }]} onPress={() => handleEdit(item)}><Text style={s.actionBtnText}>Sửa</Text></TouchableOpacity>
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: C.danger }]} onPress={() => setConfirmDelete({ id: item.id, name: item.name })}><Text style={s.actionBtnText}>Xóa</Text></TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<View style={{ alignItems: 'center', paddingTop: 40 }}><Text style={{ color: C.textLight }}>Không tìm thấy sản phẩm</Text></View>}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: C.bg },
  msgBar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 999, paddingVertical: 10, paddingHorizontal: 16 },
  msgText: { color: C.white, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  confirmOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 998, justifyContent: 'center', alignItems: 'center' },
  confirmBox: { backgroundColor: C.card, borderRadius: 10, padding: 20, width: '80%', maxWidth: 320, borderWidth: 1, borderColor: C.border },
  confirmTitle: { fontSize: 16, fontWeight: 'bold', color: C.text, marginBottom: 8 },
  confirmText: { fontSize: 14, color: C.textSecondary, marginBottom: 16 },
  confirmActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  confirmBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6 },
  confirmBtnText: { color: C.white, fontSize: 13, fontWeight: 'bold' },
  searchRow: { flexDirection: 'row', marginBottom: 12 },
  searchInput: { flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 4, paddingHorizontal: 12, height: 40, fontSize: 13, color: C.text },
  addBtn: { width: 40, height: 40, borderRadius: 4, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  addBtnText: { color: C.white, fontSize: 22, fontWeight: 'bold' },
  form: { backgroundColor: C.card, borderRadius: 8, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  formTitle: { fontSize: 15, fontWeight: 'bold', color: C.text, marginBottom: 10 },
  preview: { width: '100%', height: 120, borderRadius: 4, marginBottom: 10, backgroundColor: '#f0f0f0' },
  pickBtn: { width: 40, height: 40, borderRadius: 4, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.border },
  input: { backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.border, borderRadius: 4, height: 40, paddingHorizontal: 12, fontSize: 13, color: C.text, marginBottom: 10 },
  chip: { backgroundColor: C.bg, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12, marginRight: 6, marginBottom: 5, borderWidth: 1, borderColor: C.border },
  chipActive: { backgroundColor: C.primary, borderColor: C.primary },
  chipText: { fontSize: 11, color: C.textSecondary },
  chipTextActive: { color: C.white, fontWeight: '600' },
  saveBtn: { backgroundColor: C.primary, height: 40, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: C.white, fontWeight: 'bold', fontSize: 13 },
  card: { flexDirection: 'row', backgroundColor: C.card, borderRadius: 8, padding: 10, marginBottom: 8, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  img: { width: 56, height: 56, borderRadius: 4, backgroundColor: '#f0f0f0' },
  itemName: { fontSize: 13, fontWeight: '600', color: C.text },
  itemPrice: { fontSize: 13, fontWeight: 'bold', color: C.primary, marginTop: 2 },
  itemCat: { fontSize: 11, color: C.textSecondary, marginTop: 1 },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4, alignItems: 'center', minWidth: 44 },
  actionBtnText: { color: C.white, fontSize: 10, fontWeight: 'bold' },

});
