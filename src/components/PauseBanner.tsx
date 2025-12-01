import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

export type PauseBannerProps = {
  onResume: () => void;
  onHome: () => void;
};

function PauseBanner(props: PauseBannerProps): React.ReactElement {
  const { onResume, onHome } = props;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(function runAnim() {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  }, [translateY, opacity]);

  return (
    <Animated.View style={[styles.wrap, { opacity, transform: [{ translateY }] }]}>
      <View style={styles.rowAlign}>
        <View style={styles.pauseIcon}>
          <View style={styles.bar} />
          <View style={styles.bar} />
        </View>
        <Text style={styles.title}>Tạm dừng</Text>
      </View>
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.btnPrimary} onPress={onResume}>
          <Text style={styles.btnPrimaryText}>Tiếp tục</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary} onPress={onHome}>
          <Text style={styles.btnSecondaryText}>Về trang chủ</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '72%',
    minHeight: 52,
    backgroundColor: '#F8F2E8F2',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    alignItems: 'flex-start',
  },
  rowAlign: { flexDirection: 'row', alignItems: 'center' },
  pauseIcon: { width: 18, height: 18, marginRight: 8, flexDirection: 'row', justifyContent: 'space-between' },
  bar: { width: 6, height: 14, backgroundColor: '#8A4F2B' },
  title: { color: '#8A4F2B', fontWeight: '600' },
  btnRow: { flexDirection: 'row', marginTop: 8 },
  btnPrimary: { backgroundColor: '#8B4513', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, marginRight: 8 },
  btnPrimaryText: { color: '#FFF8E1', fontWeight: '600' },
  btnSecondary: { backgroundColor: '#E6D5B8', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },
  btnSecondaryText: { color: '#3B2F2F', fontWeight: '500' },
});

export default PauseBanner;
