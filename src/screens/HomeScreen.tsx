import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
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

  const lastEnergyAt = useGameStore(state => state.lastEnergyAt);

  const [confirmVisible, setConfirmVisible] = useState<boolean>(false);
  const [confirmTitle, setConfirmTitle] = useState<string>('');
  const [confirmMessage, setConfirmMessage] = useState<string>('');
  const [confirmKind, setConfirmKind] = useState<'ENERGY' | 'MONEY' | null>(
    null,
  );

  const { showAd, isLoaded, preload, statusText } = useGameAds(
    function onReward(type) {
      if (type === 'ENERGY') {
        useGameStore.getState().restoreEnergyOverflow(5);
        return;
      }
      if (type === 'MONEY') {
        addCoins(100000);
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
    if (energy <= 0) {
      setConfirmKind('ENERGY');
      setConfirmTitle(t('energyDepletedTitle'));
      setConfirmMessage(t('energyDepletedMessage'));
      setConfirmVisible(true);
      preload();
      return;
    }
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

  function openConfirmEnergy(): void {
    setConfirmKind('ENERGY');
    setConfirmTitle(t('adTitleEnergy'));
    setConfirmMessage(t('adMessageEnergy'));
    setConfirmVisible(true);
    preload();
  }

  function openConfirmMoney(): void {
    setConfirmKind('MONEY');
    setConfirmTitle(t('adTitleMoney'));
    setConfirmMessage(t('adMessageMoney'));
    setConfirmVisible(true);
    preload();
  }

  const [countdown, setCountdown] = useState<string>('');

  useEffect(
    function energyCountdownTick() {
      const intervalMs = 10 * 60 * 1000;
      const timer = setInterval(function tick() {
        refreshEnergy();
        const now = Date.now();
        const last = lastEnergyAt || now;
        const elapsed = now - last;
        const remainMs = intervalMs - (elapsed % intervalMs);
        const minutes = Math.floor(remainMs / 60000);
        const seconds = Math.floor((remainMs % 60000) / 1000);
        const padded = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        setCountdown(energy >= maxEnergy ? 'Đã đầy' : padded);
      }, 1000) as unknown as number;
      return function cleanup() {
        clearInterval(timer);
      };
    },
    [energy, maxEnergy, lastEnergyAt, refreshEnergy],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.topHeaderRow}>
          <View style={styles.moneyGroup}>
            <TouchableOpacity
              style={styles.coinsSummary}
              onPress={openConfirmMoney}
            >
              <Text style={styles.coinIcon}>💰</Text>
              <Text style={styles.coinText}>{coins}</Text>
              <View
                style={styles.plusSmallButton}
                accessibilityLabel="open-popup-money"
              >
                <Image
                  source={require('../assets/images/icon/plus.webp')}
                  style={styles.iconSmallPlus}
                  resizeMode="contain"
                />
              </View>
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
            <View>
              <TouchableOpacity
                onPress={openConfirmEnergy}
                style={styles.energySummary}
              >
                <Text style={styles.energyIcon}>⚡</Text>
                <Text style={styles.energyText}>
                  {energy}/{maxEnergy}
                </Text>
                <View
                  style={styles.plusSmallButtonEnergy}
                  accessibilityLabel="open-popup-energy"
                >
                  <Image
                    source={require('../assets/images/icon/plus.webp')}
                    style={styles.iconSmallPlus}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.countdownText}>{countdown}</Text>
              </TouchableOpacity>
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
              if (confirmKind === 'ENERGY') {
                showAd('ENERGY');
              } else {
                showAd('MONEY');
              }
              setConfirmVisible(false);
              setConfirmKind(null);
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
    paddingVertical: 0,
    paddingHorizontal: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 34,
  },
  countdownText: {
    marginLeft: 10,
    color: '#6B5B5B',
    fontWeight: '500',
  },
  coinsSummary: {
    backgroundColor: '#E6D5B8',
    paddingVertical: 0,
    paddingHorizontal: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    minHeight: 34,
  },
  coinIcon: { color: '#8A4F2B', marginRight: 6, fontSize: 16, lineHeight: 18 },
  coinText: {
    color: '#3B2F2F',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 18,
    textAlignVertical: 'center',
  },
  energyIcon: {
    color: '#8A4F2B',
    marginRight: 6,
    fontSize: 16,
    lineHeight: 18,
  },
  energyText: {
    color: '#3B2F2F',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 18,
    textAlignVertical: 'center',
  },
  plusSmallButton: {
    paddingLeft: 6,
    borderRadius: 12,
  },
  plusSmallButtonEnergy: {
    paddingLeft: 6,
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3B2F2F',
    fontFamily: Platform.select({
      ios: 'Marker Felt',
      android: 'serif',
    }),
  },
  subtitle: {
    fontSize: 16,
    color: '#6B5B5B',
    fontFamily: Platform.select({
      ios: 'Marker Felt',
      android: 'serif',
    }),
    marginTop: 4,
    fontWeight: '600',
  },
  actions: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  stallHome: {
    width: '86%',
    height: 160,
    marginTop: 16,
    marginBottom: 50,
    transform: [{ scale: 1.5 }],
  },
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
  row: { flexDirection: 'row', marginTop: 20 },
  storeButton: {
    backgroundColor: '#D2B48C',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    marginTop: 16,
  },
  secondaryButton: {
    backgroundColor: '#D2B48C',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 8,
  },
  secondaryButtonText: { color: '#3B2F2F', fontSize: 16, fontWeight: '500' },
  footer: { padding: 16, alignItems: 'center', marginTop: 'auto' },
  footerText: { color: '#6B5B5B' },
});

export default HomeScreen;
