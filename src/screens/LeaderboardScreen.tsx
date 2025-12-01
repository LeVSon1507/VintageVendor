import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { t } from '../i18n';

function LeaderboardScreen(): React.ReactElement {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{t('leaderboard')}</Text>
      <Text style={styles.hint}>{t('leaderboardHint')}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5DC', padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#3B2F2F', marginBottom: 8 },
  hint: { color: '#6B5B5B' },
});

export default LeaderboardScreen;
