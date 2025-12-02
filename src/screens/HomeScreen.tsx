import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStallImage } from '../game/assets';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import useGameStore from '../store/gameStore';
import { t } from '../i18n';
import { RootStackParamList } from '../types';
import { AdConfirmationModal } from '../components/AdConfirmationModal';
import { useGameAds } from '../hooks/useGameAds';

type HomeScreenNavigation = StackNavigationProp<RootStackParamList, 'Home'>;

function HomeScreen(): React.ReactElement {
  const navigation = useNavigation<HomeScreenNavigation>();
  const startGame = useGameStore(state => state.startGame);
  const settings = useGameStore(state => state.settings);
  const updateSettings = useGameStore(state => state.updateSettings);
  const energy = useGameStore(state => state.energy);
  const maxEnergy = useGameStore(state => state.maxEnergy);
  const coins = useGameStore(state => state.coins);
  const refreshEnergy = useGameStore(state => state.refreshEnergy);
  const resetDailyHints = useGameStore(state => state.resetDailyHints);
  const addCoins = useGameStore(state => state.addCoins);

  const [confirmVisible, setConfirmVisible] = useState<boolean>(false);
  const [confirmTitle, setConfirmTitle] = useState<string>('');
  const [confirmMessage, setConfirmMessage] = useState<string>('');

  const { showAd, isLoaded, preload, statusText } = useGameAds(
    function onReward(type) {
      if (type === 'MONEY') {
        addCoins(100);
      }
    },
  );

  useEffect(
    function onFocusRefresh() {
      refreshEnergy();
      resetDailyHints();
    },
    [refreshEnergy, resetDailyHints],
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

  function openConfirmMoney(): void {
    setConfirmTitle('Nhận tiền');
    setConfirmMessage('Xem video để nhận tiền thưởng');
    setConfirmVisible(true);
    preload();
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.topHeaderRow}>
          <View style={styles.moneyGroup}>
            <View style={styles.coinsSummary}>
              <Text style={styles.coinIcon}>💰</Text>
              <Text style={styles.coinText}>{coins}</Text>
            </View>
            <TouchableOpacity
              style={styles.plusSmallButton}
              onPress={openConfirmMoney}
              accessibilityLabel="open-store"
            >
              <Image
                source={require('../assets/images/icon/plus.png')}
                style={styles.iconSmallPlus}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
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
              <Text style={styles.energyText}>
                {energy}/{maxEnergy}
              </Text>
            </View>
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
            <Text style={styles.secondaryButtonText}>{t('journalTitle')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>{t('slogan')}</Text>
      </View>
      {confirmVisible ? (
        <View style={styles.globalOverlay} pointerEvents="auto">
          <View style={styles.globalDim} />
          <AdConfirmationModal
            visible={confirmVisible}
            onClose={function close() {
              setConfirmVisible(false);
            }}
            onConfirm={function confirm() {
              showAd('MONEY');
              setConfirmVisible(false);
            }}
            title={confirmTitle}
            message={confirmMessage}
            disabled={!isLoaded}
            loadingText={statusText}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5DC' },
  header: { paddingTop: 24, paddingHorizontal: 24, alignItems: 'center' },
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  topRightBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moneyGroup: { flexDirection: 'row', alignItems: 'center' },
  langToggle: {
    backgroundColor: '#E6D5B8',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginRight: 10,
  },
  langToggleText: { color: '#3B2F2F', fontWeight: '600' },
  energySummary: {
    backgroundColor: '#E6D5B8',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinsSummary: {
    backgroundColor: '#E6D5B8',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  coinIcon: { color: '#8A4F2B', marginRight: 6 },
  coinText: { color: '#3B2F2F', fontWeight: '600' },
  energyIcon: { color: '#8A4F2B', marginRight: 6 },
  energyText: { color: '#3B2F2F', fontWeight: '600' },
  plusSmallButton: {
    backgroundColor: '#EBDCC2',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  iconSmallPlus: { width: 20, height: 20 },
  globalOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    elevation: 16,
  },
  globalDim: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(139, 69, 19, 0.18)',
  },
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
