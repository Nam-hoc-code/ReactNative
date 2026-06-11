import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Category } from '../database/types';
import { C } from '../theme/colors';

interface Props {
  categories: Category[];
  selected: number | null;
  onSelect: (id: number | null) => void;
}

export default function CategorySelector({ categories, selected, onSelect }: Props) {
  return (
    <View style={s.wrap}>
      <FlatList
        horizontal
        data={categories}
        keyExtractor={i => i.id.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
        ListHeaderComponent={
          <TouchableOpacity style={[s.chip, selected === null && s.chipActive]} onPress={() => onSelect(null)}>
            <Text style={[s.label, selected === null && s.labelActive]}>Tất cả</Text>
          </TouchableOpacity>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={[s.chip, selected === item.id && s.chipActive]} onPress={() => onSelect(selected === item.id ? null : item.id)}>
            <Text style={[s.label, selected === item.id && s.labelActive]}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingVertical: 10, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border },
  chipActive: { backgroundColor: C.primary, borderColor: C.primary },
  label: { fontSize: 13, color: C.textSecondary },
  labelActive: { color: C.white, fontWeight: '600' },
});
