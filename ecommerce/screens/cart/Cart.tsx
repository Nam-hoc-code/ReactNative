import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { dbService } from '../../database/DatabaseService';
import { CartItem } from '../../database/types';
import { getGuestId } from '../../utils/guest';
import { getImg } from '../../utils/images';
import { C } from '../../theme/colors';
import { formatVND } from '../../utils/formatters';

export default function Cart({ navigation }: { navigation: any }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const user = dbService.getCurrentUser();
        const id = user ? user.id : await getGuestId();
        setUserId(id);
        loadCart(id);
      })();
    }, [])
  );

  const loadCart = async (uid: number) => {
    setItems(await dbService.getCart(uid));
  };

  const updateQty = async (pid: number, delta: number) => {
    if (!userId) return;
    const item = items.find(i => i.productId === pid);
    if (!item) return;
    const nq = item.quantity + delta;
    if (nq <= 0) {
      await dbService.removeFromCart(userId, pid);
    } else {
      await dbService.updateCartQuantity(userId, pid, nq);
    }
    await loadCart(userId);
  };

  const removeItem = async (pid: number) => {
    if (!userId) return;
    await dbService.removeFromCart(userId, pid);
    await loadCart(userId);
  };

  const total = items.reduce((s, i) => s + (i.price || 0) * i.quantity, 0);
  const shipping = total > 0 ? 0 : 0; // Free shipping
  const finalTotal = total + shipping;

  return (
    <SafeAreaView style={s.container}>
      {items.length === 0 ? (
        <View style={s.emptyContainer}>
          <MaterialCommunityIcons name="cart-outline" size={80} color={C.border} />
          <Text style={s.emptyTitle}>Giỏ hàng trống</Text>
          <Text style={s.emptyText}>Thêm sản phẩm vào giỏ hàng để tiếp tục</Text>
          <TouchableOpacity
            style={s.continueShopping}
            onPress={() => navigation.navigate('ShopHome')}
          >
            <Text style={s.continueText}>Tiếp tục mua sắm</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={i => i.id.toString()}
            contentContainerStyle={s.listContent}
            scrollEventThrottle={16}
            ListHeaderComponent={
              <View style={s.header}>
                <Text style={s.headerTitle}>Giỏ Hàng ({items.length})</Text>
                <Text style={s.headerSubtitle}>Kiểm tra và quản lý đơn hàng của bạn</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={s.cartItem}>
                <Image source={getImg(item.img)} style={s.itemImage} />

                <View style={s.itemContent}>
                  <Text style={s.itemName} numberOfLines={2}>
                    {item.productName}
                  </Text>
                  <Text style={s.itemPrice}>{formatVND(item.price || 0)}</Text>

                  <View style={s.qtyControls}>
                    <TouchableOpacity
                      style={s.qtyBtn}
                      onPress={() => updateQty(item.productId, -1)}
                    >
                      <MaterialCommunityIcons name="minus" size={16} color={C.primary} />
                    </TouchableOpacity>

                    <Text style={s.qtyText}>{item.quantity}</Text>

                    <TouchableOpacity
                      style={s.qtyBtn}
                      onPress={() => updateQty(item.productId, 1)}
                    >
                      <MaterialCommunityIcons name="plus" size={16} color={C.primary} />
                    </TouchableOpacity>

                    <Text style={s.itemSubtotal}>
                      {formatVND((item.price || 0) * item.quantity)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={s.removeBtn}
                  onPress={() => removeItem(item.productId)}
                >
                  <MaterialCommunityIcons name="trash-can-outline" size={18} color={C.danger} />
                </TouchableOpacity>
              </View>
            )}
          />

          {/* Order Summary */}
          <View style={s.summaryContainer}>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Tạm tính:</Text>
              <Text style={s.summaryValue}>{formatVND(total)}</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Vận chuyển:</Text>
              <Text style={s.freeShipping}>Miễn phí</Text>
            </View>
            <View style={s.divider} />
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Tổng cộng:</Text>
              <Text style={s.totalValue}>{formatVND(finalTotal)}</Text>
            </View>

            <TouchableOpacity
              style={s.checkoutBtn}
              onPress={() => navigation.navigate('Checkout')}
            >
              <MaterialCommunityIcons name="credit-card" size={18} color={C.white} />
              <Text style={s.checkoutText}>Thanh Toán</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.continueBuyingBtn}
              onPress={() => navigation.navigate('ShopHome')}
            >
              <Text style={s.continueBuyingText}>Tiếp tục mua sắm</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    marginTop: 16,
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: C.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },

  continueShopping: {
    backgroundColor: C.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },

  continueText: {
    color: C.white,
    fontWeight: '600',
    fontSize: 14,
  },

  // List
  listContent: {
    paddingBottom: 20,
  },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: C.text,
    marginBottom: 4,
  },

  headerSubtitle: {
    fontSize: 13,
    color: C.textSecondary,
  },

  // Cart Item
  cartItem: {
    flexDirection: 'row',
    backgroundColor: C.card,
    marginHorizontal: 16,
    marginVertical: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: C.bg,
  },

  itemContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },

  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
    lineHeight: 18,
  },

  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: C.primary,
    marginTop: 2,
  },

  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },

  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },

  qtyText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
    minWidth: 24,
    textAlign: 'center',
  },

  itemSubtotal: {
    fontSize: 12,
    fontWeight: '700',
    color: C.danger,
    marginLeft: 'auto',
  },

  removeBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },

  // Summary
  summaryContainer: {
    backgroundColor: C.card,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  summaryLabel: {
    fontSize: 13,
    color: C.textSecondary,
  },

  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
  },

  freeShipping: {
    fontSize: 13,
    fontWeight: '600',
    color: C.success,
  },

  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 12,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
  },

  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: C.primary,
  },

  checkoutBtn: {
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },

  checkoutText: {
    color: C.white,
    fontWeight: '700',
    fontSize: 15,
  },

  continueBuyingBtn: {
    backgroundColor: C.bg,
    borderRadius: 10,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.primary,
  },

  continueBuyingText: {
    color: C.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});
