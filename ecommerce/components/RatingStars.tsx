import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C } from '../theme/colors';

export default function RatingStars({ rating, sold }: { rating?: number; sold?: number }) {
  const r = rating ?? 4.5;
  const full = Math.floor(r);
  return (
    <View style={s.row}>
      <Text style={s.stars}>
        {'★'.repeat(full)}{'☆'.repeat(5 - full)}
      </Text>
      <Text style={s.text}>{r.toFixed(1)}</Text>
      {sold !== undefined && <Text style={s.sold}> | Đã bán {sold}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  stars: { color: C.star, fontSize: 12, letterSpacing: 1 },
  text: { color: C.textSecondary, fontSize: 11, marginLeft: 4 },
  sold: { color: C.textLight, fontSize: 11, marginLeft: 4 },
});
