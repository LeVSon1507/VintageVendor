import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import useGameStore from '../store/gameStore';
import { t } from '../i18n';
import { STORE_ITEMS } from '../game/store';

type StoreListNavigation = StackNavigationProp<RootStackParamList, 'StoreList'>;

function StoreListScreen(): React.ReactElement {
  const coins = useGameStore(state => state.coins);
  const navigation = useNavigation<StoreListNavigation>();
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{t('store')}</Text>
      <View style={styles.coinsRow}>
        <Text style={styles.coinsLabel}>💰</Text>
        <Text style={styles.coinsValue}>{coins}</Text>
      </View>
      <View style={styles.list}>
        {STORE_ITEMS.map(function renderStoreItem(storeItem) {
          const unlocked = coins >= storeItem.cost;
          return (
            <View key={storeItem.id} style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemName}>{storeItem.name}</Text>
                <Text style={styles.itemCost}>💰 {storeItem.cost}</Text>
              </View>
              <Text style={[styles.status, unlocked ? styles.unlocked : styles.locked]}>
                {unlocked ? t('unlocked') : t('locked')}
              </Text>
            </View>
          );
        })}
      </View>
      <TouchableOpacity style={styles.backBtn} onPress={function goHome() { navigation.navigate('Home'); }}>
        <Text style={styles.backText}>{t('home')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5DC', paddingHorizontal: 16, paddingTop: 64, paddingBottom: 80 },
  backBtn: { position: 'absolute', left: 16, right: 16, bottom: 16, backgroundColor: '#E6D5B8', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 12, alignItems: 'center' },
  backText: { color: '#3B2F2F', fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '700', color: '#3B2F2F', marginBottom: 8 },
  coinsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  coinsLabel: { color: '#8A4F2B', marginRight: 6 },
  coinsValue: { color: '#3B2F2F', fontWeight: '700' },
  list: { marginTop: 8 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E6D5B8',
  },
  itemLeft: { flexDirection: 'column', flex: 1 },
  itemName: { color: '#3B2F2F', fontWeight: '600' },
  itemCost: { color: '#6B5B5B', marginTop: 2 },
  status: { fontWeight: '700' },
  unlocked: { color: '#2E7D32' },
  locked: { color: '#B71C1C' },
});

export default StoreListScreen;
