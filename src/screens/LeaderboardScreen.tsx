import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useGameStore from '../store/gameStore';
import { t } from '../i18n';

function LeaderboardScreen(): React.ReactElement {
  const leaderboard = useGameStore(state => state.leaderboard);
  const highCoins = useGameStore(state => state.highCoins);
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{t('leaderboard')}</Text>
      <View style={styles.bestRow}>
        <Text style={styles.bestLabel}>{t('yourBest')}</Text>
        <Text style={styles.bestValue}>💰 {highCoins}</Text>
      </View>
      <View style={styles.list}>
        {(leaderboard || []).slice(0, 10).map(function renderEntry(entry) {
          return (
            <View
              key={`${entry.rank}-${entry.playerName}-${entry.score}`}
              style={styles.itemRow}
            >
              <Text style={styles.rank}>#{entry.rank}</Text>
              <Text style={styles.name}>{entry.playerName}</Text>
              <Text style={styles.score}>💰 {entry.score}</Text>
            </View>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5DC', padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#3B2F2F', marginBottom: 8 },
  list: { marginTop: 8 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E6D5B8',
  },
  rank: { color: '#3B2F2F', width: 40 },
  name: { color: '#3B2F2F', flex: 1 },
  score: { color: '#3B2F2F', fontWeight: '600' },
  bestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bestLabel: { color: '#3B2F2F', fontWeight: '600' },
  bestValue: { color: '#3B2F2F', fontWeight: '700' },
});

export default LeaderboardScreen;
