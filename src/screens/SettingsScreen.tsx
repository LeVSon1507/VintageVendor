import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { t } from '../i18n';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import useGameStore from '../store/gameStore';

type SettingsNav = StackNavigationProp<RootStackParamList, 'Settings'>;

function SettingsScreen(): React.ReactElement {
  const navigation = useNavigation<SettingsNav>();
  const settings = useGameStore(state => state.settings);
  const updateSettings = useGameStore(state => state.updateSettings);
  const resetGame = useGameStore(state => state.resetGame);

  function handleHome(): void {
    resetGame();
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  }

  function toggleLanguage(): void {
    const next = settings.language === 'vi' ? 'en' : 'vi';
    updateSettings({ language: next });
  }

  function toggleVibration(): void {
    updateSettings({ vibration: !settings.vibration });
  }

  function adjustMusicVolume(delta: number): void {
    const next = Math.min(1, Math.max(0, settings.musicVolume + delta));
    updateSettings({ musicVolume: next });
  }

  function adjustSoundVolume(delta: number): void {
    const next = Math.min(1, Math.max(0, settings.soundVolume + delta));
    updateSettings({ soundVolume: next });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.pill}
          onPress={handleHome}
          accessibilityLabel={t('home')}
        >
          <Text style={styles.pillText}>{t('home')}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>{t('settingsTitle')}</Text>
      <View style={styles.rowBetween}>
        <Text style={styles.label}>{t('languageLabel')}</Text>
        <TouchableOpacity style={styles.pill} onPress={toggleLanguage}>
          <Text style={styles.pillText}>
            {settings.language === 'vi' ? t('languageVi') : t('languageEn')}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.rowBetween}>
        <Text style={styles.label}>{t('vibrationLabel')}</Text>
        <Switch value={settings.vibration} onValueChange={toggleVibration} />
      </View>
      <View style={styles.block}>
        <Text style={styles.label}>
          {t('musicLabel')}: {Math.round(settings.musicVolume * 100)}%
        </Text>
        <View style={styles.rowBetween}>
          <TouchableOpacity
            style={styles.pill}
            onPress={() => adjustMusicVolume(-0.1)}
          >
            <Text style={styles.pillText}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.pill}
            onPress={() => adjustMusicVolume(0.1)}
          >
            <Text style={styles.pillText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.block}>
        <Text style={styles.label}>
          {t('soundLabel')}: {Math.round(settings.soundVolume * 100)}%
        </Text>
        <View style={styles.rowBetween}>
          <TouchableOpacity
            style={styles.pill}
            onPress={() => adjustSoundVolume(-0.1)}
          >
            <Text style={styles.pillText}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.pill}
            onPress={() => adjustSoundVolume(0.1)}
          >
            <Text style={styles.pillText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5DC', padding: 16 },
  topBar: { flexDirection: 'row', justifyContent: 'flex-end' },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B2F2F',
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  label: { color: '#3B2F2F', fontSize: 16 },
  pill: {
    backgroundColor: '#D2B48C',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  pillText: { color: '#3B2F2F', fontWeight: '600' },
  block: { marginTop: 12 },
});

export default SettingsScreen;
