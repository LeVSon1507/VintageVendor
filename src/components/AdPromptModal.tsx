import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { t } from '../i18n';

export type AdPromptModalProps = {
  visible: boolean;
  loading: boolean;
  onClose: () => void;
  onWatchAd: () => void;
  title?: string;
};

function AdPromptModal(props: AdPromptModalProps): React.ReactElement | null {
  const { visible, loading, onClose, onWatchAd, title } = props;
  if (!visible) return null;

  return (
    <TouchableWithoutFeedback onPress={loading ? undefined : onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback>
          <View style={styles.panel}>
            <Text style={styles.title}>{title || t('hint')}</Text>
            {loading ? (
              <View style={styles.centerRow}>
                <Text style={styles.loadingText}>Đang xem quảng cáo...</Text>
              </View>
            ) : (
              <View style={styles.actions}>
                <TouchableOpacity style={styles.primaryBtn} onPress={onWatchAd} accessibilityLabel="watch-ad">
                  <Text style={styles.primaryText}>Xem quảng cáo để nhận gợi ý</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryBtn} onPress={onClose} accessibilityLabel={t('close')}>
                  <Text style={styles.secondaryText}>{t('close')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 69, 19, 0.18)',
  },
  panel: {
    backgroundColor: '#F5F5DC',
    borderRadius: 16,
    padding: 16,
    width: '88%',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  title: { color: '#3B2F2F', fontWeight: '700', fontSize: 18, marginBottom: 10 },
  centerRow: { alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  loadingText: { color: '#6B5B5B' },
  actions: { marginTop: 6 },
  primaryBtn: { backgroundColor: '#8B4513', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 8 },
  primaryText: { color: '#FFF8E1', fontWeight: '600' },
  secondaryBtn: { backgroundColor: '#E6D5B8', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12 },
  secondaryText: { color: '#3B2F2F', fontWeight: '600' },
});

export default AdPromptModal;
