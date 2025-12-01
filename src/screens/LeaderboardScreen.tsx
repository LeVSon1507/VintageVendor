import React, { useMemo } from 'react';
import { Text, StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useGameStore from '../store/gameStore';

function JournalScreen(): React.ReactElement {
  const journal = useGameStore(state => state.journal);
  const journeyDay = useGameStore(state => state.journeyDay);
  const stats = useGameStore(state => state.stats);

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
      const nameMap: Record<string, string> = {
        cafe_vot: 'Cà phê vợt',
        sua_dau_nanh: 'Sữa đậu nành',
        banh_mi_thit: 'Bánh mì thịt',
        che: 'Chè',
        xien_que: 'Xiên que',
        banh_bo: 'Bánh bò',
        soda_da_chanh: 'Soda đá chanh',
        soda_chai: 'Soda chai',
        xien_que_tuong_ot: 'Xiên que tương ớt',
        ca_vien_chien: 'Cá viên chiên',
        soda_chanh_muoi: 'Soda chanh muối',
      };
      const label = nameMap[top[0]] || top[0];
      return `${label} (${top[1]})`;
    },
    [stats],
  );

  const notes =
    stats && stats.randomNotes && stats.randomNotes.length > 0
      ? stats.randomNotes
      : [
          'Hôm nay trời đẹp!',
          'Khách khen quầy sạch sẽ',
          'Một vị khách nhớ hương vị tuổi thơ',
        ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Nhật kí tiệm</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Milestone</Text>
          <Text style={styles.sectionSub}>
            Ngày hiện tại: {journeyDay || 0}
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
                    {entry.achieved ? 'Đã đạt' : 'Chưa đạt'}
                  </Text>
                </View>
              );
            })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thống kê vui</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Khách hay mua nhất:</Text>
            <Text style={styles.statValue}>{mostFrequentCustomer}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Item bán chạy số 1:</Text>
            <Text style={styles.statValue}>{bestSellingItem}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Số lần hết hàng:</Text>
            <Text style={styles.statValue}>
              {(stats && stats.outOfStockCount) || 0}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Tổng lượng soda chai bán:</Text>
            <Text style={styles.statValue}>
              {(stats && stats.totalSodaChaiSold) || 0} chai
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Số tiền kiếm được phiên này:</Text>
            <Text style={styles.statValue}>
              💰 {(stats && stats.coinsEarnedThisSession) || 0}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ghi chú nho nhỏ</Text>
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
});

export default JournalScreen;
