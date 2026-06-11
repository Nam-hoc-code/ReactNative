import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { getImg } from '../utils/images';
import { formatVND } from '../utils/formatters';
import { C } from '../theme/colors';

const DEALS: { productId: number; name: string; price: number; orig: number; img: string }[] = [
  { productId: 6, name: 'Nokia 6300', price: 690000, orig: 890000, img: 'Nokia_6300_(1).jpg' },
  { productId: 9, name: 'UGREEN Hub 7in1', price: 499000, orig: 690000, img: 'hub-chuyen-doi-ugreen-usb-c-to-usb-a-2-0-usb-a-3-0-hdmi-pd-ho-tro-4k-15495.jpg' },
  { productId: 4, name: 'AirPods 4', price: 4390000, orig: 4990000, img: 'apple-airpods-4-thumb.jpg' },
];

export default function FlashSale({ navigation }: { navigation: any }) {
  return (
    <View style={s.wrap}>
      <View style={s.header}>
        <Text style={s.title}>⚡ Flash Sale</Text>
        <TouchableOpacity><Text style={s.more}>Xem tất cả ›</Text></TouchableOpacity>
      </View>
      <View style={s.list}>
        {DEALS.map((d, i) => (
          <TouchableOpacity key={i} style={s.item} onPress={() => navigation.navigate('ProductDetail', { productId: d.productId })}>
            <Image source={getImg(d.img)} style={s.img} />
            <Text style={s.orig}>{formatVND(d.orig)}</Text>
            <Text style={s.price}>{formatVND(d.price)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { backgroundColor: C.card, marginVertical: 8, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.border },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  title: { fontSize: 16, fontWeight: 'bold', color: C.primary },
  more: { fontSize: 12, color: C.accent },
  list: { flexDirection: 'row', paddingHorizontal: 12, gap: 8 },
  item: { width: 110, alignItems: 'center' },
  img: { width: 100, height: 100, borderRadius: 8, backgroundColor: '#f5f5f5', marginBottom: 6 },
  orig: { fontSize: 10, color: C.textLight, textDecorationLine: 'line-through' },
  price: { fontSize: 12, fontWeight: 'bold', color: C.primary },
});
