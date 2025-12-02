import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';

export type AdConfirmationModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  disabled?: boolean;
  loadingText?: string;
};

export function AdConfirmationModal(
  props: Readonly<AdConfirmationModalProps>,
): React.ReactElement | null {
  const { visible, onClose, onConfirm, title, message, disabled, loadingText } =
    props;
  if (!visible) return null;

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback>
          <View style={styles.panel}>
            <Text style={styles.title}>{title ?? 'Xác nhận'}</Text>
            {message ? <Text style={styles.message}>{message}</Text> : null}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  disabled ? styles.primaryBtnDisabled : undefined,
                ]}
                onPress={disabled ? undefined : onConfirm}
                accessibilityLabel="watch-ad"
              >
                <Text style={styles.primaryText}>
                  {disabled
                    ? loadingText || 'Đang tải quảng cáo...'
                    : 'Watch Video'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={onClose}>
                <Text style={styles.secondaryText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    width: '84%',
    backgroundColor: '#FFF8E7',
    borderColor: '#8B4513',
    borderWidth: 6,
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  title: {
    fontSize: 18,
    color: '#4A2E0B',
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#4A2E0B',
    textAlign: 'center',
    marginBottom: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryBtn: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#2E8B57',
    borderColor: '#1F5E3C',
    borderWidth: 4,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  primaryBtnDisabled: { opacity: 0.65 },
  primaryText: {
    color: '#FFF8E7',
    fontWeight: '700',
  },
  secondaryBtn: {
    width: 96,
    backgroundColor: '#D2B48C',
    borderColor: '#8B4513',
    borderWidth: 4,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#4A2E0B',
    fontWeight: '700',
  },
});
