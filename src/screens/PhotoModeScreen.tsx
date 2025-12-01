import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { t } from '../i18n';

function PhotoModeScreen(): React.ReactElement {
  const navigation = useNavigation();

  function handleClose(): void {
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        <Text style={styles.title}>{t('photoModeTitle')}</Text>
        <Text style={styles.hint}>{t('photoModeHint')}</Text>
        <TouchableOpacity style={styles.button} onPress={handleClose}>
          <Text style={styles.buttonText}>{t('close')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  panel: { backgroundColor: '#F5F5DC', borderRadius: 16, padding: 16, width: '86%' },
  title: { fontSize: 20, fontWeight: '700', color: '#3B2F2F', marginBottom: 8 },
  hint: { color: '#6B5B5B', marginBottom: 12 },
  button: { backgroundColor: '#8B4513', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, alignSelf: 'flex-end' },
  buttonText: { color: '#FFF8E1', fontWeight: '600' },
});

export default PhotoModeScreen;
