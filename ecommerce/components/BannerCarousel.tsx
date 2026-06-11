import React, { useRef, useEffect, useState } from 'react';
import { View, FlatList, Image, Dimensions, StyleSheet } from 'react-native';
import { getImg } from '../utils/images';

const { width } = Dimensions.get('window');
const BANNER_H = 160;

const BANNERS = [
  { id: '1', uri: 'frame_515_25_.jpg' },
  { id: '2', uri: 'group_111_1_1.jpg' },
  { id: '3', uri: 'frame_427320264_5_.jpg' },
];

export default function BannerCarousel() {
  const flatRef = useRef<FlatList>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      const next = (idx + 1) % BANNERS.length;
      flatRef.current?.scrollToIndex({ index: next, animated: true });
      setIdx(next);
    }, 3000);
    return () => clearInterval(t);
  }, [idx]);

  return (
    <View style={s.container}>
      <FlatList
        ref={flatRef}
        data={BANNERS}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={i => i.id}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        renderItem={({ item }) => (
          <Image source={getImg(item.uri)} style={s.img} resizeMode="cover" />
        )}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          setIdx(i);
        }}
      />
      <View style={s.dots}>
        {BANNERS.map((_, i) => (
          <View key={i} style={[s.dot, i === idx && s.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { height: BANNER_H, position: 'relative' },
  img: { width, height: BANNER_H, backgroundColor: '#e0e0e0' },
  dots: { position: 'absolute', bottom: 8, flexDirection: 'row', alignSelf: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: '#fff', width: 18, borderRadius: 3 },
});
