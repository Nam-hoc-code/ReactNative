import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Category } from '../database/types';
import { C } from '../theme/colors';

const ICONS: Record<string, string> = {
  'Điện thoại': '📱', 'Laptop': '💻', 'Thời trang': '👕',
  'Gia dụng': '🏠', 'Sách': '📚', 'Thể thao': '⚽',
  'Mỹ phẩm': '💄', 'Thực phẩm': '🍎',
};

export default function CategoryGrid({ categories, selected, onSelect }: { categories: Category[]; selected: number | null; onSelect: (id: number | null) => void }) {
  return (
    <View style={s.wrap}>
      <Text style={s.title}>Danh mục</Text>
      <View style={s.grid}>
        <TouchableOpacity style={[s.item, selected === null && s.itemActive]} onPress={() => onSelect(null)}>
          <Text style={s.icon}>📋</Text>
          <Text style={[s.label, selected === null && s.labelActive]}>Tất cả</Text>
        </TouchableOpacity>
        {categories.map(c => (
          <TouchableOpacity key={c.id} style={[s.item, selected === c.id && s.itemActive]} onPress={() => onSelect(selected === c.id ? null : c.id)}>
            <Text style={s.icon}>{ICONS[c.name] || '📦'}</Text>
            <Text style={[s.label, selected === c.id && s.labelActive]} numberOfLines={1}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginVertical: 12 },
  title: { fontSize: 16, fontWeight: 'bold', color: C.text, marginBottom: 10, paddingHorizontal: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  item: { width: '20%', alignItems: 'center', paddingVertical: 8 },
  itemActive: {},
  icon: { fontSize: 28, marginBottom: 4 },
  label: { fontSize: 11, color: C.textSecondary, textAlign: 'center' },
  labelActive: { color: C.primary, fontWeight: '600' },
});
