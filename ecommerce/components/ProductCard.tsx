import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Product } from '../database/types';
import { C } from '../theme/colors';
import { formatVND } from '../utils/formatters';
import { getImg } from '../utils/images';
import RatingStars from './RatingStars';

export default function ProductCard({ item, onPress, onAddCart }: { item: Product; onPress: () => void; onAddCart: () => void }) {
  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.85}>
      {/* Image Container */}
      <View style={s.imageContainer}>
        <Image source={getImg(item.img)} style={s.img} />
        <View style={s.badge}>
          <Text style={s.badgeText}>New</Text>
        </View>
      </View>

      {/* Card Body */}
      <View style={s.body}>
        {/* Product Name */}
        <Text style={s.name} numberOfLines={2}>{item.name}</Text>
        
        {/* Rating */}
        <View style={s.ratingContainer}>
          <RatingStars rating={4.5} sold={item.sold ?? 0} />
        </View>

        {/* Price Container */}
        <View style={s.priceContainer}>
          <Text style={s.price}>{formatVND(item.price)}</Text>
          <View style={s.discountBadge}>
            <Text style={s.discountText}>-15%</Text>
          </View>
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity style={s.addBtn} onPress={onAddCart} activeOpacity={0.7}>
          <MaterialCommunityIcons name="cart-plus" size={16} color={C.white} />
          <Text style={s.addBtnText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 12,
    marginHorizontal: 5,
    marginBottom: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
    backgroundColor: C.bg,
  },
  
  img: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: C.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  
  badgeText: {
    color: C.white,
    fontSize: 10,
    fontWeight: '700',
  },
  
  body: {
    padding: 10,
  },
  
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
    lineHeight: 18,
    marginBottom: 6,
  },
  
  ratingContainer: {
    marginBottom: 8,
  },
  
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: C.primary,
  },
  
  discountBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
  },
  
  discountText: {
    color: C.danger,
    fontSize: 10,
    fontWeight: '700',
  },
  
  addBtn: {
    backgroundColor: C.primary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  
  addBtnText: {
    color: C.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
