import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { dbService } from '../../database/DatabaseService';
import { Coupon } from '../../database/types';
import { C } from '../../theme/colors';
import { formatVND } from '../../utils/formatters';

export default function UserCoupons() {
  const [coupons, setCoupons] = useState<(Coupon & { locked?: boolean; lockReason?: string })[]>([]);

  useFocusEffect(useCallback(() => {
    const user = dbService.getCurrentUser();
    if (!user) return;
    dbService.getUserCoupons(user.id).then(setCoupons);
  }, []));

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: C.bg, padding: 12 }}
      data={coupons}
      keyExtractor={i => i.id.toString()}
      renderItem={({ item }) => (
        <View style={[s.card, item.locked && s.cardLocked]}>
          <View style={[s.badge, item.locked && s.badgeLocked]}>
            <Text style={s.code}>{item.code}</Text>
            <Text style={s.discount}>{item.type === 'percent' ? `Giảm ${item.discount}%` : `Giảm ${formatVND(item.discount)}`}</Text>
          </View>
          <View style={s.info}>
            {item.minOrder > 0 && <Text style={s.detail}>Đơn tối thiểu: {formatVND(item.minOrder)}</Text>}
            <Text style={s.detail}>HSD: {new Date(item.expiresAt).toLocaleDateString('vi-VN')}</Text>
            {item.locked && <Text style={s.lockReason}>🔒 {item.lockReason}</Text>}
          </View>
        </View>
      )}
      ListEmptyComponent={
        <View style={{ alignItems: 'center', paddingTop: 60 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>🎫</Text>
          <Text style={{ color: C.textLight, fontSize: 15 }}>Bạn chưa có voucher nào</Text>
          <Text style={{ color: C.textLight, fontSize: 12, marginTop: 4 }}>Admin sẽ gửi mã giảm giá cho bạn</Text>
        </View>
      }
    />
  );
}

const s = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: C.card, borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  cardLocked: { opacity: 0.6, borderColor: C.textLight },
  badge: { backgroundColor: C.primary, borderRadius: 8, padding: 10, alignItems: 'center', justifyContent: 'center', minWidth: 90, marginRight: 12 },
  badgeLocked: { backgroundColor: C.textLight },
  code: { color: C.white, fontWeight: 'bold', fontSize: 13 },
  discount: { color: '#ffe0b2', fontSize: 10, marginTop: 2 },
  info: { flex: 1, justifyContent: 'center' },
  detail: { fontSize: 11, color: C.textSecondary, marginBottom: 2 },
  lockReason: { fontSize: 10, color: C.danger, marginTop: 4, fontStyle: 'italic' },
});
