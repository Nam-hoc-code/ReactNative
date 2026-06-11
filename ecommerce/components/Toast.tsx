import React, { useRef, useEffect, useState } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { C } from '../theme/colors';

interface ToastData { message: string; visible: boolean }

export function useToast() {
  const opacity = useRef(new Animated.Value(0)).current;
  const [data, setData] = useState<ToastData>({ message: '', visible: false });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (data.visible) {
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      timer.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => setData({ message: '', visible: false }));
      }, 2000);
    }
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [data.visible]);

  const show = (message: string) => setData({ message, visible: true });

  const ToastView = data.visible ? (
    <Animated.View style={[s.wrap, { opacity }]}>
      <Text style={s.icon}>✓</Text>
      <Text style={s.text}>{data.message}</Text>
    </Animated.View>
  ) : null;

  return { show, ToastView };
}

const s = StyleSheet.create({
  wrap: {
    position: 'absolute', top: 60, left: 20, right: 20, zIndex: 999,
    backgroundColor: '#16a34a', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 18,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6,
  },
  icon: { fontSize: 20, fontWeight: 'bold', color: C.white, backgroundColor: 'rgba(255,255,255,0.25)', width: 28, height: 28, borderRadius: 14, textAlign: 'center', lineHeight: 28 },
  text: { color: C.white, fontSize: 14, fontWeight: '600', flex: 1 },
});
