import React, { useMemo } from 'react';
import {
  Text,
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { t } from '../i18n';
import useGameStore from '../store/gameStore';
import { getItemName } from '../i18n/names';

type JournalNav = StackNavigationProp<RootStackParamList, 'Leaderboard'>;

function JournalScreen(): React.ReactElement {
  const navigation = useNavigation<JournalNav>();
  const journal = useGameStore(state => state.journal);
  const journeyDay = useGameStore(state => state.journeyDay);
  const stats = useGameStore(state => state.stats);
  const resetGame = useGameStore(state => state.resetGame);

  function handleHome(): void {
    resetGame();
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  }

  const mostFrequentCustomer = useMemo(
    function calcTopCustomer() {
      const counts =
        stats && stats.customerTypeCounts
          ? stats.customerTypeCounts
          : {
              student: 0,
              worker: 0,
              elderly: 0,
              tourist: 0,
            };
      const pairs = Object.keys(counts).map(function toPair(key) {
        const value = (counts as any)[key] as number;
        return { key, count: typeof value === 'number' ? value : 0 };
      });
      const sorted = pairs.sort(function byCount(a, b) {
        return b.count - a.count;
      });
      const top = sorted[0];
      const labelMap: Record<string, string> = {
        student: 'Học sinh',
        worker: 'Công nhân',
        elderly: 'Cụ ông/bà',
        tourist: 'Khách du lịch',
      };
      if (!top || top.count <= 0) return '—';
      const label = labelMap[top.key] || top.key;
      return `${label} (${top.count})`;
    },
    [stats],
  );

  const bestSellingItem = useMemo(
    function calcTopItem() {
      const entries = Object.entries((stats && stats.itemSoldCounts) || {});
      if (entries.length === 0) return '—';
      const sorted = entries.sort(function byCount(a, b) {
        return (b[1] || 0) - (a[1] || 0);
      });
      const top = sorted[0];
      const label = getItemName(top[0]);
      return `${label} (${top[1]})`;
    },
    [stats],
  );

  const notes =
    stats && stats.randomNotes && stats.randomNotes.length > 0
      ? stats.randomNotes
      : [t('noteDefault1'), t('noteDefault2'), t('noteDefault3')];

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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{t('journalTitle')}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('milestoneTitle')}</Text>
          <Text style={styles.sectionSub}>
            {t('currentDayLabel')} {journeyDay || 0}
          </Text>
          {(journal || [])
            .slice()
            .sort(function byDay(a, b) {
              return a.day - b.day;
            })
            .map(function renderEntry(entry) {
              return (
                <View key={entry.id} style={styles.entryRow}>
                  <Text style={styles.entryDay}>Day {entry.day}</Text>
                  <Text style={styles.entryTitle}>{entry.title}</Text>
                  <Text
                    style={
                      entry.achieved
                        ? styles.entryAchieved
                        : styles.entryPending
                    }
                  >
                    {entry.achieved ? t('achieved') : t('pending')}
                  </Text>
                </View>
              );
            })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('funStatsTitle')}</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>
              {t('mostFrequentCustomerLabel')}
            </Text>
            <Text style={styles.statValue}>{mostFrequentCustomer}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>{t('bestSellingItemLabel')}</Text>
            <Text style={styles.statValue}>{bestSellingItem}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>{t('outOfStockCountLabel')}</Text>
            <Text style={styles.statValue}>
              {(stats && stats.outOfStockCount) || 0}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>{t('totalSodaChaiSoldLabel')}</Text>
            <Text style={styles.statValue}>
              {(stats && stats.totalSodaChaiSold) || 0} {t('unitBottle')}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>
              {t('coinsEarnedThisSessionLabel')}
            </Text>
            <Text style={styles.statValue}>
              💰 {(stats && stats.coinsEarnedThisSession) || 0}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('notesTitle')}</Text>
          {notes.map(function renderNote(n, i) {
            return (
              <Text key={`${n}-${i}`} style={styles.noteItem}>
                • {n}
              </Text>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5DC' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  scrollContent: { padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#3B2F2F', marginBottom: 8 },
  section: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  sectionTitle: { color: '#3B2F2F', fontWeight: '700', marginBottom: 6 },
  sectionSub: { color: '#6B5B5B', marginBottom: 6 },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E6D5B8',
  },
  entryDay: { color: '#3B2F2F', width: 64 },
  entryTitle: { color: '#3B2F2F', flex: 1 },
  entryAchieved: { color: '#2E7D32', fontWeight: '700' },
  entryPending: { color: '#B71C1C', fontWeight: '700' },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  statLabel: { color: '#3B2F2F' },
  statValue: { color: '#3B2F2F', fontWeight: '700' },
  noteItem: { color: '#3B2F2F' },
  pill: {
    backgroundColor: '#D2B48C',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  pillText: { color: '#3B2F2F', fontWeight: '600' },
});

export default JournalScreen;
