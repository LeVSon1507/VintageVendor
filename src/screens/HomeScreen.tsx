import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import useGameStore from '../store/gameStore';
import { t } from '../i18n';
import { RootStackParamList } from '../types';

type HomeScreenNavigation = StackNavigationProp<RootStackParamList, 'Home'>;

function HomeScreen(): React.ReactElement {
  const navigation = useNavigation<HomeScreenNavigation>();
  const startGame = useGameStore(state => state.startGame);

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('appTitle')}</Text>
        <Text style={styles.subtitle}>{t('appSubtitle')}</Text>
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
            <Text style={styles.secondaryButtonText}>{t('leaderboard')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Aiiiiiii • tạp hoá đeeeeee</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5DC' },
  header: { paddingTop: 24, paddingHorizontal: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#3B2F2F' },
  subtitle: { fontSize: 14, color: '#6B5B5B', marginTop: 4 },
  actions: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  stallHome: { width: '86%', height: 160, marginBottom: 16 },
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
import { getStallImage } from '../game/assets';
