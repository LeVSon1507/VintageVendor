import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStallImage } from '../game/assets';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import useGameStore from '../store/gameStore';
import { t } from '../i18n';
import { RootStackParamList } from '../types';

type HomeScreenNavigation = StackNavigationProp<RootStackParamList, 'Home'>;

function HomeScreen(): React.ReactElement {
  const navigation = useNavigation<HomeScreenNavigation>();
  const startGame = useGameStore(state => state.startGame);
  const settings = useGameStore(state => state.settings);
  const updateSettings = useGameStore(state => state.updateSettings);
  const energy = useGameStore(state => state.energy);
  const maxEnergy = useGameStore(state => state.maxEnergy);
  const refreshEnergy = useGameStore(state => state.refreshEnergy);

  useEffect(
    function onFocusRefresh() {
      refreshEnergy();
    },
    [refreshEnergy],
  );

  function handleStart(): void {
    startGame();
    navigation.navigate('Game');
  }

  function handleOpenSettings(): void {
    navigation.navigate('Settings');
  }

  function handleOpenLeaderboard(): void {
    navigation.navigate('Leaderboard');
  }

  function handleOpenStoreList(): void {
    navigation.navigate('StoreList');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.topRightBar}>
          <TouchableOpacity
            style={styles.langToggle}
            onPress={() =>
              updateSettings({
                language: settings.language === 'vi' ? 'en' : 'vi',
              })
            }
          >
            <Text style={styles.langToggleText}>
              {settings.language === 'vi' ? 'EN' : 'VI'}
            </Text>
          </TouchableOpacity>
          <View style={styles.energySummary}>
            <Text style={styles.energyIcon}>⚡</Text>
            <Text style={styles.energyText}>{energy}/{maxEnergy}</Text>
          </View>
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{t('appTitle')}</Text>
          <Text style={styles.subtitle}>{t('appSubtitle')}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Image
          source={getStallImage()}
          style={styles.stallHome}
          resizeMode="contain"
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleStart}>
          <Text style={styles.primaryButtonText}>{t('start')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.storeButton}
          onPress={handleOpenStoreList}
        >
          <Text style={styles.secondaryButtonText}>{t('store')}</Text>
        </TouchableOpacity>
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleOpenSettings}
          >
            <Text style={styles.secondaryButtonText}>{t('settings')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleOpenLeaderboard}
          >
            <Text style={styles.secondaryButtonText}>Nhật kí</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>{t('slogan')}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5DC' },
  header: { paddingTop: 24, paddingHorizontal: 24, alignItems: 'center' },
  topRightBar: { alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center' },
  langToggle: {
    backgroundColor: '#E6D5B8',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginRight: 10,
  },
  langToggleText: { color: '#3B2F2F', fontWeight: '600' },
  energySummary: { backgroundColor: '#E6D5B8', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
  energyIcon: { color: '#8A4F2B', marginRight: 6 },
  energyText: { color: '#3B2F2F', fontWeight: '600' },
  titleBlock: { marginTop: 40, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: '#3B2F2F' },
  subtitle: { fontSize: 14, color: '#6B5B5B', marginTop: 4 },
  actions: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  stallHome: { width: '86%', height: 160, marginVertical: 28 },
  primaryButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  primaryButtonText: { color: '#FFF8E1', fontSize: 18, fontWeight: '600' },
  row: { flexDirection: 'row', marginTop: 16 },
  storeButton: {
    backgroundColor: '#D2B48C',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    marginTop: 12,
  },
  secondaryButton: {
    backgroundColor: '#D2B48C',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 8,
  },
  secondaryButtonText: { color: '#3B2F2F', fontSize: 16, fontWeight: '500' },
  footer: { padding: 16, alignItems: 'center' },
  footerText: { color: '#6B5B5B' },
});

export default HomeScreen;
