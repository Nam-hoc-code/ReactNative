import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LightControl from './LightControl';

export default function ParentControl() {
  // 3. Sử dụng useState để quản lý trạng thái đèn và độ sáng
  const [isOn, setIsOn] = useState<boolean>(false);
  const [brightness, setBrightness] = useState<number>(50); // Mặc định 50% khi bật

  // 5. Callback function để bật/tắt đèn
  const handleToggleLight = () => {
    setIsOn((prev) => !prev);
  };

  // 5 & 7 & 8. Callback function tăng độ sáng (+10, tối đa 100%, không cho phép khi tắt)
  const handleIncreaseBrightness = () => {
    if (!isOn) return;
    setBrightness((prev) => {
      if (prev >= 100) return 100;
      return prev + 10;
    });
  };

  // 5 & 7 & 8. Callback function giảm độ sáng (-10, tối thiểu 0%, không cho phép khi tắt)
  const handleDecreaseBrightness = () => {
    if (!isOn) return;
    setBrightness((prev) => {
      if (prev <= 0) return 0;
      return prev - 10;
    });
  };

  // 9. Tính toán màu sắc động cho bóng đèn phù hợp trạng thái
  const getBulbColor = () => {
    if (!isOn) return '#64748b'; // Màu xám đá khi đèn tắt
    // Tính toán độ đậm/nhạt của màu vàng dựa trên mức độ sáng
    const opacity = 0.3 + (brightness / 100) * 0.7; // từ 0.3 đến 1.0
    return `rgba(251, 191, 36, ${opacity})`; 
  };

  return (
    <View style={styles.parentContainer}>
      <Text style={styles.componentTitle}>Component Cha: ParentControl</Text>

      {/* 9. Hình ảnh minh họa bóng đèn bật/tắt phù hợp trạng thái */}
      <View style={styles.lightbulbArea}>
        {isOn && (
          <View 
            style={[
              styles.glowHalo, 
              { 
                backgroundColor: 'rgba(251, 191, 36, 0.35)',
                transform: [{ scale: 1 + (brightness / 100) * 0.4 }],
                opacity: brightness / 100,
              }
            ]} 
          />
        )}
        <Ionicons 
          name={isOn ? "bulb" : "bulb-outline"} 
          size={110} 
          color={getBulbColor()} 
          style={styles.bulbIcon}
        />
      </View>

      {/* Hiển thị thông tin trạng thái */}
      <View style={styles.infoContainer}>
        <View style={styles.statusRow}>
          <Text style={styles.infoLabel}>Trạng thái đèn: </Text>
          {/* 10. Đổi màu trạng thái: xanh khi bật (green), đỏ khi tắt (red) */}
          <View style={[styles.statusBadge, isOn ? styles.statusOn : styles.statusOff]}>
            <Text style={[styles.statusText, { color: isOn ? '#10b981' : '#ef4444' }]}>
              {isOn ? 'ĐANG BẬT' : 'ĐANG TẮT'}
            </Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.infoLabel}>Độ sáng hiện tại: </Text>
          <Text style={[styles.brightnessText, !isOn && styles.disabledText]}>
            {isOn ? `${brightness}%` : 'N/A'}
          </Text>
        </View>
      </View>

      {/* 4. Truyền dữ liệu xuống component con bằng props */}
      {/* 5. Component con gửi dữ liệu/thao tác ngược lên bằng callback function */}
      <LightControl 
        isOn={isOn}
        brightness={brightness}
        onToggle={handleToggleLight}
        onIncrease={handleIncreaseBrightness}
        onDecrease={handleDecreaseBrightness}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  parentContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: '#10b981', // Đường viền xanh lá để phân biệt rõ Component Cha
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  componentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  lightbulbArea: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    position: 'relative',
    width: '100%',
  },
  glowHalo: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    zIndex: 0,
  },
  bulbIcon: {
    zIndex: 1,
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  infoLabel: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusOn: {
    backgroundColor: '#d1fae5', // Xanh lá nhạt
  },
  statusOff: {
    backgroundColor: '#fee2e2', // Đỏ nhạt
  },
  statusText: {
    fontSize: 13,
    fontWeight: '800',
  },
  brightnessText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  disabledText: {
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
});
