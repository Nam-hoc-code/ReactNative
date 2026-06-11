import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { dbService } from '../../database/DatabaseService';
import { C } from '../../theme/colors';

export default function EditProfile({ navigation }: { navigation: any }) {
  const user = dbService.getCurrentUser();
  const [fullname, setFullname] = useState(user?.fullname || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');

  const handleSave = async () => {
    if (!fullname.trim() || !email.trim()) { Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin'); return; }
    const updated = await dbService.updateProfile(user!.id, fullname.trim(), email.trim(), phone.trim() || undefined, address.trim() || undefined);
    dbService.setCurrentUser(updated);
    Alert.alert('Thành công', 'Hồ sơ đã cập nhật');
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TextInput style={s.input} placeholder="Họ và tên" placeholderTextColor={C.textLight} value={fullname} onChangeText={setFullname} />
      <TextInput style={s.input} placeholder="Email" placeholderTextColor={C.textLight} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={s.input} placeholder="Số điện thoại" placeholderTextColor={C.textLight} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextInput style={s.input} placeholder="Địa chỉ giao hàng" placeholderTextColor={C.textLight} value={address} onChangeText={setAddress} multiline />
      <TouchableOpacity style={s.btn} onPress={handleSave}><Text style={s.btnText}>Lưu</Text></TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, padding: 20, justifyContent: 'center' },
  input: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 4, height: 44, paddingHorizontal: 14, fontSize: 14, color: C.text, marginBottom: 14 },
  btn: { backgroundColor: C.primary, height: 44, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: C.white, fontWeight: 'bold', fontSize: 15 },
});
