import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { FlatList, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ScrollView } from 'react-native';
import BannerCarousel from '../../components/BannerCarousel';
import CategoryGrid from '../../components/CategoryGrid';
import FlashSale from '../../components/FlashSale';
import ProductCard from '../../components/ProductCard';
import { dbService } from '../../database/DatabaseService';
import { Category, Product } from '../../database/types';
import { getGuestId } from '../../utils/guest';
import { useToast } from '../../components/Toast';
import { C } from '../../theme/colors';

const PRICE_SEGMENTS: { label: string; min: number | null; max: number | null }[] = [
  { label: 'Dưới 500k', min: null, max: 500000 },
  { label: '500k - 1tr', min: 500000, max: 1000000 },
  { label: '1tr - 5tr', min: 1000000, max: 5000000 },
  { label: '5tr - 10tr', min: 5000000, max: 10000000 },
  { label: '> 10tr', min: 10000000, max: null },
];

export default function ShopHome({ navigation }: { navigation: any }) {
  const { show: showToast, ToastView } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(dbService.getCurrentUser());

  const load = async () => {
    const cats = await dbService.getCategories();
    setCategories(cats);
    const seg = selectedSegment !== null ? PRICE_SEGMENTS[selectedSegment] : null;
    const min = seg ? (seg.min ?? undefined) : (minPrice ? parseFloat(minPrice) : undefined);
    const max = seg ? (seg.max ?? undefined) : (maxPrice ? parseFloat(maxPrice) : undefined);
    const prods = await dbService.getProducts(search, selectedCat || undefined, max, min);
    setProducts(prods);
    const u = dbService.getCurrentUser();
    setCurrentUser(u);
    if (u) {
      const cart = await dbService.getCart(u.id);
      setCartCount(cart.length);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { const t = setTimeout(() => load(), 300); return () => clearTimeout(t); }, [search, minPrice, maxPrice, selectedSegment, selectedCat]);

  const pickSegment = (i: number | null) => {
    setSelectedSegment(i);
    if (i !== null) { setMinPrice(''); setMaxPrice(''); }
  };

  const handleAddCart = async (productId: number) => {
    const user = dbService.getCurrentUser();
    const id = user ? user.id : await getGuestId();
    await dbService.addToCart(id, productId, 1);
    await load();
    showToast('Đã thêm vào giỏ hàng');
  };

  const clearFilters = () => {
    setSearch(''); setSelectedCat(null); setMinPrice(''); setMaxPrice(''); setSelectedSegment(null);
  };

  const hasFilter = !!search || selectedCat !== null || selectedSegment !== null || !!minPrice || !!maxPrice;

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />
      {ToastView}
      <FlatList
        style={s.container}
        contentContainerStyle={s.content}
        data={products}
        keyExtractor={i => i.id.toString()}
        numColumns={2}
        columnWrapperStyle={s.colWrap}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <View>
            <View style={s.header}>
              <View style={s.headerContent}>
                <View>
                  <Text style={s.headerGreeting}>{currentUser ? `Xin chào, ${currentUser.fullname}! 👋` : 'Chào mừng bạn! 👋'}</Text>
                  <Text style={s.headerTitle}>Cùng mua sắm hôm nay</Text>
                </View>
                <TouchableOpacity style={s.headerCart} onPress={() => navigation.navigate('Cart')}>
                  <MaterialCommunityIcons name="cart" size={24} color={C.white} />
                  {cartCount > 0 && (
                    <View style={s.cartBadge}>
                      <Text style={s.cartBadgeText}>{cartCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View style={s.searchContainer}>
                <MaterialCommunityIcons name="magnify" size={20} color={C.textLight} style={s.searchIcon} />
                <TextInput
                  style={s.searchInput}
                  placeholder="Tìm kiếm sản phẩm..."
                  placeholderTextColor={C.textLight}
                  value={search}
                  onChangeText={setSearch}
                />
                {search ? (
                  <TouchableOpacity onPress={() => setSearch('')}>
                    <MaterialCommunityIcons name="close-circle" size={18} color={C.textLight} />
                  </TouchableOpacity>
                ) : null}
              </View>

              <TouchableOpacity style={s.filterToggle} onPress={() => setShowPriceFilter(!showPriceFilter)}>
                <MaterialCommunityIcons name="filter" size={16} color={C.white} />
                <Text style={s.filterToggleText}>Lọc giá</Text>
              </TouchableOpacity>
              {showPriceFilter && (
                <View style={s.overlay}>
                  <View style={s.overlayContent}>
                    <View style={s.priceFilterRow}>
                      <TextInput style={s.priceInput} placeholder="Từ" placeholderTextColor={C.textLight} value={minPrice} onChangeText={t => { setMinPrice(t); setSelectedSegment(null); }} keyboardType="numeric" />
                      <Text style={{ color: C.textSecondary, marginHorizontal: 6 }}>—</Text>
                      <TextInput style={s.priceInput} placeholder="Đến" placeholderTextColor={C.textLight} value={maxPrice} onChangeText={t => { setMaxPrice(t); setSelectedSegment(null); }} keyboardType="numeric" />
                    </View>
                    <View style={s.segmentRow}>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                        {PRICE_SEGMENTS.map((seg, i) => (
                          <TouchableOpacity
                            key={i}
                            style={[s.chipOverlay, selectedSegment === i && s.chipOverlayActive]}
                            onPress={() => pickSegment(selectedSegment === i ? null : i)}
                          >
                            <Text style={[s.chipOverlayText, selectedSegment === i && s.chipOverlayTextActive]}>{seg.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                </View>
              )}
            </View>

            <BannerCarousel />

            <CategoryGrid categories={categories} selected={selectedCat} onSelect={setSelectedCat} />

            <FlashSale navigation={navigation} />

            <View style={s.sectionHeader}>
              <View>
                <Text style={s.sectionTitle}>Gợi ý hôm nay</Text>
                <Text style={s.sectionSubtitle}>{products.length} sản phẩm</Text>
              </View>
              {hasFilter && (
                <TouchableOpacity style={s.clearFilterBtn} onPress={clearFilters}>
                  <MaterialCommunityIcons name="filter-off" size={16} color={C.primary} />
                  <Text style={s.clearFilterText}>Xoá lọc</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <MaterialCommunityIcons name="inbox" size={60} color={C.border} />
            <Text style={s.emptyTitle}>Không tìm thấy sản phẩm</Text>
            <Text style={s.emptyText}>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
            onAddCart={() => handleAddCart(item.id)}
          />
        )}
      />
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingBottom: 20 },

  header: {
    backgroundColor: C.primary, paddingHorizontal: 16, paddingTop: 12,
    paddingBottom: 12, position: 'relative', zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  },
  headerGreeting: { color: C.white, fontSize: 13, opacity: 0.9 },
  headerTitle: { color: C.white, fontSize: 18, fontWeight: '700', marginTop: 2 },
  headerCart: { position: 'relative', padding: 8 },
  cartBadge: {
    position: 'absolute', top: 0, right: 0, backgroundColor: C.danger, borderRadius: 10,
    minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center',
  },
  cartBadgeText: { color: C.white, fontSize: 11, fontWeight: '700' },

  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: C.text, padding: 0 },

  filterToggle: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 4 },
  filterToggleText: { color: C.white, fontSize: 13, fontWeight: '600' },
  priceFilterRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  priceInput: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 6, height: 36, paddingHorizontal: 10, color: C.text, fontSize: 13 },

  segmentRow: { marginTop: 10 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  chipActive: { backgroundColor: C.white },
  chipText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },
  chipTextActive: { color: C.primary },

  overlay: { position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20, paddingHorizontal: 16, paddingTop: 4 },
  overlayContent: {
    backgroundColor: C.white, borderRadius: 10, padding: 14,
    elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8,
  },
  chipOverlay: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14, backgroundColor: C.bg },
  chipOverlayActive: { backgroundColor: C.primary },
  chipOverlayText: { fontSize: 12, fontWeight: '600', color: C.textSecondary },
  chipOverlayTextActive: { color: C.white },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: C.text },
  sectionSubtitle: { fontSize: 12, color: C.textSecondary, marginTop: 2 },
  clearFilterBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#e0e7ff',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 4,
  },
  clearFilterText: { fontSize: 12, color: C.primary, fontWeight: '600' },

  colWrap: { paddingHorizontal: 8 },

  emptyContainer: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: C.text, marginTop: 12 },
  emptyText: { fontSize: 13, color: C.textSecondary, marginTop: 4, textAlign: 'center' },
});
