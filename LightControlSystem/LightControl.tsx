import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Định nghĩa kiểu dữ liệu cho props của Component Con
interface LightControlProps {
  isOn: boolean;
  brightness: number;
  onToggle: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
}

export default function LightControl({
  isOn,
  brightness,
  onToggle,
  onIncrease,
  onDecrease,
}: LightControlProps) {
  return (
    <View style={styles.childContainer}>
      <Text style={styles.componentTitle}>Component Con: LightControl</Text>
      
      {/* Nút Bật / Tắt */}
      <TouchableOpacity 
        style={[styles.button, isOn ? styles.buttonOff : styles.buttonOn]} 
        onPress={onToggle}
        activeOpacity={0.8}
      >
        <Ionicons name={isOn ? "power-outline" : "power"} size={20} color="#fff" />
        <Text style={styles.buttonText}>{isOn ? "Tắt Đèn" : "Bật Đèn"}</Text>
      </TouchableOpacity>

      {/* Điều khiển độ sáng */}
      <View style={styles.brightnessControlGroup}>
        {/* Nút Giảm độ sáng */}
        <TouchableOpacity 
          style={[styles.controlButton, (!isOn || brightness <= 0) && styles.disabledButton]} 
          onPress={onDecrease}
          disabled={!isOn}
          activeOpacity={0.7}
        >
          <Ionicons name="remove-circle-outline" size={24} color={isOn ? "#fff" : "#a1a1a1"} />
          <Text style={[styles.controlButtonText, !isOn && styles.disabledText]}>-10%</Text>
        </TouchableOpacity>

        {/* Nút Tăng độ sáng */}
        <TouchableOpacity 
          style={[styles.controlButton, (!isOn || brightness >= 100) && styles.disabledButton]} 
          onPress={onIncrease}
          disabled={!isOn}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle-outline" size={24} color={isOn ? "#fff" : "#a1a1a1"} />
          <Text style={[styles.controlButtonText, !isOn && styles.disabledText]}>+10%</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  childContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#3b82f6', // Đường viền đứt màu xanh dương để phân biệt rõ Component Con
    borderStyle: 'dashed',
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  componentTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    width: '85%',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonOn: {
    backgroundColor: '#10b981', // Màu xanh lá khi bật
  },
  buttonOff: {
    backgroundColor: '#ef4444', // Màu đỏ khi tắt
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  brightnessControlGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '85%',
    marginTop: 5,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '46%',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  disabledButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  disabledText: {
    color: '#9ca3af',
  },
});
