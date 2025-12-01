import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import useGameStore from '../store/gameStore';
import { t } from '../i18n';

type GameOverRoute = RouteProp<RootStackParamList, 'GameOver'>;
type GameOverNav = StackNavigationProp<RootStackParamList, 'GameOver'>;

function GameOverScreen(): React.ReactElement {
  const navigation = useNavigation<GameOverNav>();
  const route = useRoute<GameOverRoute>();
  const startGame = useGameStore(state => state.startGame);
  const resetGame = useGameStore(state => state.resetGame);

  function handleRetry(): void {
    resetGame();
    startGame();
    navigation.replace('Game');
  }

  function handleHome(): void {
    resetGame();
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('timeUpTitle')}</Text>
      <Text style={styles.score}>
        {t('scoreLabelText')} {route.params.score}
      </Text>
      <Text style={styles.score}>
        {t('customersLabelText')} {route.params.customersServed}
      </Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleRetry}>
          <Text style={styles.primaryText}>{t('retry')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleHome}>
          <Text style={styles.secondaryText}>{t('home')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 26, fontWeight: '700', color: '#3B2F2F', marginBottom: 8 },
  score: { fontSize: 18, color: '#6B5B5B', marginTop: 4 },
  row: { flexDirection: 'row', marginTop: 24 },
  primaryButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  primaryText: { color: '#FFF8E1', fontWeight: '600' },
  secondaryButton: {
    backgroundColor: '#D2B48C',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 8,
  },
  secondaryText: { color: '#3B2F2F', fontWeight: '500' },
});

export default GameOverScreen;
