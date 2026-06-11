import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { dbService } from '../../database/DatabaseService';
import { Product } from '../../database/types';
import { formatVND } from '../../utils/formatters';
import { getGuestId } from '../../utils/guest';
import { getImg } from '../../utils/images';
import { useToast } from '../../components/Toast';
import RatingStars from '../../components/RatingStars';
import { C } from '../../theme/colors';

export default function ProductDetail({ route, navigation }: { route: any; navigation: any }) {
  const { show: showToast, ToastView } = useToast();
  const { productId } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  const load = async () => {
    const prods = await dbService.getProducts();
    setProduct(prods.find(p => p.id === productId) || null);
  };

  useEffect(() => { load(); }, [productId]);

  if (!product) {
    return <View style={s.center}><Text style={{ color: C.textSecondary }}>Đang tải...</Text></View>;
  }

  const handleAddCart = async () => {
    const user = dbService.getCurrentUser();
    const id = user ? user.id : await getGuestId();
    await dbService.addToCart(id, product.id, quantity);
    showToast('Đã thêm vào giỏ hàng');
    navigation.navigate('Cart');
  };

  return (
    <View style={s.container}>
      {ToastView}
      <ScrollView>
        <Image source={getImg(product.img)} style={s.img} />
        <View style={s.body}>
          <Text style={s.priceBig}>{formatVND(product.price)}</Text>
          <Text style={s.name}>{product.name}</Text>
          {product.description ? <Text style={s.desc}>{product.description}</Text> : null}
          <RatingStars rating={4.5} sold={product.sold ?? 0} />
          <View style={s.divider} />
          <Text style={s.shipLabel}>Vận chuyển</Text>
          <Text style={s.shipValue}>Miễn phí vận chuyển</Text>
          <View style={s.divider} />
          <Text style={s.shipLabel}>Số lượng</Text>
          <View style={s.qtyRow}>
            <TouchableOpacity style={s.qtyBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}><Text style={s.qtyBtnText}>−</Text></TouchableOpacity>
            <Text style={s.qtyNum}>{quantity}</Text>
            <TouchableOpacity style={s.qtyBtn} onPress={() => setQuantity(quantity + 1)}><Text style={s.qtyBtnText}>+</Text></TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <View style={s.footer}>
        <TouchableOpacity style={s.addBtn} onPress={handleAddCart}>
          <Text style={s.addBtnText}>Thêm vào giỏ hàng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },
  img: { width: '100%', height: 320, backgroundColor: '#f0f0f0' },
  body: { backgroundColor: C.card, padding: 16, marginTop: -4 },
  priceBig: { fontSize: 24, fontWeight: 'bold', color: C.primary },
  name: { fontSize: 16, color: C.text, marginTop: 8, lineHeight: 22 },
  desc: { fontSize: 13, color: C.textSecondary, marginTop: 6, lineHeight: 20 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 14 },
  shipLabel: { fontSize: 13, color: C.textSecondary, marginBottom: 4 },
  shipValue: { fontSize: 13, color: C.success, fontWeight: '600' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  qtyBtn: { width: 34, height: 34, borderRadius: 4, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.border },
  qtyBtnText: { fontSize: 18, fontWeight: 'bold', color: C.text },
  qtyNum: { fontSize: 16, fontWeight: 'bold', color: C.text, marginHorizontal: 16 },
  footer: { padding: 16, backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border },
  addBtn: { backgroundColor: C.primary, height: 48, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: C.white, fontSize: 15, fontWeight: 'bold' },
});
