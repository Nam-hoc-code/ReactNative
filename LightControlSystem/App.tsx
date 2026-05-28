import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import ParentControl from './ParentControl';

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f1f5f9" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>HỆ THỐNG ĐIỀU KHIỂN ĐÈN THÔNG MINH</Text>
        <Text style={styles.subtitle}>Bài Tập Thực Hành React Native (Props & State)</Text>
        
        {/* 2. Gọi và hiển thị đúng Component Cha (ParentControl) */}
        <ParentControl />
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Cấu trúc: App.tsx ➔ ParentControl.tsx ➔ LightControl.tsx</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
});
