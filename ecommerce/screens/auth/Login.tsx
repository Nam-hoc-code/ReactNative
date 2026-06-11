import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { dbService } from '../../database/DatabaseService';
import { getGuestId, resetGuestId } from '../../utils/guest';
import { C } from '../../theme/colors';

export default function Login({ navigation }: { navigation: any }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tài khoản và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      const user = await dbService.login(username.trim(), password.trim());
      if (!user) {
        Alert.alert('Lỗi', 'Sai tài khoản hoặc mật khẩu');
        setLoading(false);
        return;
      }
      const guestId = await getGuestId();
      await dbService.migrateGuestCart(guestId, user.id);
      await resetGuestId();
      dbService.setCurrentUser(user);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra. Vui lòng thử lại');
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />
      <KeyboardAvoidingView
        style={s.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={s.header}>
            <View style={s.iconWrapper}>
              <MaterialCommunityIcons name="shopping" size={40} color={C.white} />
            </View>
            <Text style={s.appTitle}>E-Shop</Text>
            <Text style={s.appSubtitle}>Mua sắm thông minh, tiết kiệm thời gian</Text>
          </View>

          {/* Form Container */}
          <View style={s.formContainer}>
            {/* Username Field */}
            <View style={s.inputWrapper}>
              <Text style={s.label}>Tên Đăng Nhập</Text>
              <View style={s.inputContainer}>
                <MaterialCommunityIcons
                  name="account"
                  size={20}
                  color={C.textSecondary}
                  style={s.inputIcon}
                />
                <TextInput
                  style={s.input}
                  placeholder="Nhập tên đăng nhập"
                  placeholderTextColor={C.textLight}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={s.inputWrapper}>
              <Text style={s.label}>Mật Khẩu</Text>
              <View style={s.inputContainer}>
                <MaterialCommunityIcons
                  name="lock"
                  size={20}
                  color={C.textSecondary}
                  style={s.inputIcon}
                />
                <TextInput
                  style={s.input}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor={C.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={C.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Demo Accounts Info */}
            <View style={s.demoBox}>
              <MaterialCommunityIcons
                name="information"
                size={16}
                color={C.primary}
                style={s.demoIcon}
              />
              <View style={s.demoContent}>
                <Text style={s.demoTitle}>📝 Tài khoản Demo</Text>
                <Text style={s.demoItem}>
                  <Text style={s.demoBold}>Admin:</Text> admin / password
                </Text>
                <Text style={s.demoItem}>
                  <Text style={s.demoBold}>User:</Text> user / password
                </Text>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[s.loginBtn, loading && s.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <MaterialCommunityIcons
                  name="loading"
                  size={20}
                  color={C.white}
                  style={s.loadingIcon}
                />
              ) : (
                <>
                  <MaterialCommunityIcons name="login" size={18} color={C.white} />
                  <Text style={s.loginBtnText}>Đăng Nhập</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              disabled={loading}
              style={s.registerLink}
            >
              <Text style={s.registerText}>
                Chưa có tài khoản?{' '}
                <Text style={s.registerBoldText}>Đăng ký ngay</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={s.footer}>
            <Text style={s.footerText}>
              Bằng cách đăng nhập, bạn đồng ý với Điều khoản dịch vụ của chúng tôi
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.white,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },

  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: C.text,
    marginBottom: 8,
  },

  appSubtitle: {
    fontSize: 14,
    color: C.textSecondary,
    textAlign: 'center',
  },

  // Form Container
  formContainer: {
    marginBottom: 30,
  },

  inputWrapper: {
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
    marginBottom: 8,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.inputBorder,
    paddingHorizontal: 12,
    height: 48,
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: C.text,
    padding: 0,
  },

  // Demo Box
  demoBox: {
    flexDirection: 'row',
    backgroundColor: '#f0f9ff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: C.primary,
  },

  demoIcon: {
    marginRight: 10,
    marginTop: 2,
  },

  demoContent: {
    flex: 1,
  },

  demoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: C.primary,
    marginBottom: 4,
  },

  demoItem: {
    fontSize: 11,
    color: C.text,
    marginBottom: 2,
  },

  demoBold: {
    fontWeight: '600',
  },

  // Login Button
  loginBtn: {
    backgroundColor: C.primary,
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    elevation: 2,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  loginBtnDisabled: {
    opacity: 0.6,
  },

  loginBtnText: {
    color: C.white,
    fontWeight: '700',
    fontSize: 15,
  },

  loadingIcon: {
    marginRight: 8,
  },

  // Register Link
  registerLink: {
    alignItems: 'center',
    marginTop: 16,
  },

  registerText: {
    fontSize: 13,
    color: C.textSecondary,
    textAlign: 'center',
  },

  registerBoldText: {
    color: C.primary,
    fontWeight: '700',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },

  footerText: {
    fontSize: 11,
    color: C.textLight,
    textAlign: 'center',
  },
});
