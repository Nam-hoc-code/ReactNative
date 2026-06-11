import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { dbService } from '../../database/DatabaseService';
import { getGuestId, resetGuestId } from '../../utils/guest';
import { C } from '../../theme/colors';

export default function Register({ navigation }: { navigation: any }) {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleRegister = async () => {
    if (!fullname.trim() || !email.trim() || !username.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin'); return;
    }
    if (password !== confirm) { Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp'); return; }
    const user = await dbService.register(fullname.trim(), email.trim(), username.trim(), password.trim(), phone.trim() || undefined, address.trim() || undefined);
    const guestId = await getGuestId();
    await dbService.migrateGuestCart(guestId, user.id);
    await resetGuestId();
    dbService.setCurrentUser(user);
    Alert.alert('Thành công', 'Đăng ký thành công!');
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={s.title}>Đăng ký</Text>
      <TextInput style={s.input} placeholder="Họ và tên" placeholderTextColor={C.textLight} value={fullname} onChangeText={setFullname} />
      <TextInput style={s.input} placeholder="Email" placeholderTextColor={C.textLight} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={s.input} placeholder="Tên đăng nhập" placeholderTextColor={C.textLight} value={username} onChangeText={setUsername} autoCapitalize="none" />
      <TextInput style={s.input} placeholder="Mật khẩu" placeholderTextColor={C.textLight} value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput style={s.input} placeholder="Xác nhận mật khẩu" placeholderTextColor={C.textLight} value={confirm} onChangeText={setConfirm} secureTextEntry />
      <TextInput style={s.input} placeholder="Số điện thoại" placeholderTextColor={C.textLight} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextInput style={s.input} placeholder="Địa chỉ giao hàng" placeholderTextColor={C.textLight} value={address} onChangeText={setAddress} />
      <TouchableOpacity style={s.btn} onPress={handleRegister}><Text style={s.btnText}>Đăng ký</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 14 }}>
        <Text style={s.linkText}>Đã có tài khoản? Đăng nhập</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 32, backgroundColor: C.white },
  title: { fontSize: 22, fontWeight: 'bold', color: C.text, textAlign: 'center', marginBottom: 28 },
  input: { backgroundColor: C.inputBg, borderRadius: 4, height: 44, paddingHorizontal: 14, fontSize: 14, color: C.text, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  btn: { backgroundColor: C.primary, height: 44, borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  btnText: { color: C.white, fontWeight: 'bold', fontSize: 15 },
  linkText: { color: C.accent, textAlign: 'center', fontSize: 13 },
});
