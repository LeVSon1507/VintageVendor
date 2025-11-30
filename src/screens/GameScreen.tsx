import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import useGameStore from '../store/gameStore';
import { RootStackParamList, Ingredient } from '../types';
import OrderCard from '../components/OrderCard';
import { validateServe } from '../game/serve';
import { INGREDIENT_CATALOG } from '../game/ingredients';
import { getIngredientImage, getStallImage } from '../game/assets';
import { compileSelectedDish } from '../game/combine';
import CustomerWalker from '../components/CustomerWalker';
import {
  startAmbient,
  stopAmbient,
  playVendorArrive,
  playServeSuccess,
  playServeFail,
  playClick,
} from '../audio/soundManager';

type GameScreenNavigation = StackNavigationProp<RootStackParamList, 'Game'>;

function GameScreen(): React.ReactElement {
  const navigation = useNavigation<GameScreenNavigation>();
  const timeRemaining = useGameStore(state => state.timeRemaining);
  const currentScore = useGameStore(state => state.currentScore);
  const customersServed = useGameStore(state => state.customersServed);
  const customers = useGameStore(state => state.customers);
  const spawnCustomerWithOrder = useGameStore(
    state => state.spawnCustomerWithOrder,
  );
  const serveCurrentCustomerCorrect = useGameStore(
    state => state.serveCurrentCustomerCorrect,
  );
  const serveCurrentCustomerWrong = useGameStore(
    state => state.serveCurrentCustomerWrong,
  );
  const updateCustomer = useGameStore(state => state.updateCustomer);
  const settings = useGameStore(state => state.settings);

  const intervalRef = useRef<number | null>(null);

  useEffect(function startTimer() {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(function tick() {
      const dec = useGameStore.getState().decrementTime;
      dec();
    }, 1000);
    return function cleanup() {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  useEffect(function setupAmbient() {
    startAmbient(settings.musicVolume);
    return function cleanupAmbient() {
      stopAmbient();
    };
  }, []);

  useEffect(function autoSpawnOnMount() {
    if (customers.length === 0) {
      const spawn = useGameStore.getState().spawnCustomerWithOrder;
      spawn();
    }
  }, []);

  useEffect(function autoSpawnLoop() {
    const interval = setInterval(function tick() {
      const state = useGameStore.getState();
      if (state.customers.length < 5) {
        state.spawnCustomerWithOrder();
      }
    }, 8000);
    return function cleanup() {
      clearInterval(interval);
    };
  }, []);

  useEffect(
    function checkEnd() {
      if (timeRemaining === 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        const end = useGameStore.getState().endGame;
        end();
        navigation.replace('GameOver', {
          score: currentScore,
          customersServed,
          combo: 0,
        });
      }
    },
    [timeRemaining, navigation, currentScore, customersServed],
  );

  function handlePause(): void {
    navigation.navigate('Settings');
  }

  function handleSpawn(): void {
    spawnCustomerWithOrder();
  }

  function handleServeWrong(): void {
    serveCurrentCustomerWrong();
  }

  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>(
    [],
  );

  const onArriveCustomer = useCallback(
    function onArriveCustomer(customerId: string): void {
      updateCustomer(customerId, { position: { x: 0, y: 0 }, mood: 'neutral' });
      playVendorArrive(settings.soundVolume);
    },
    [updateCustomer, settings.soundVolume],
  );

  function toggleIngredient(ingredientId: string): void {
    setSelectedIngredientIds(function next(prev) {
      return prev.includes(ingredientId)
        ? prev.filter(id => id !== ingredientId)
        : [...prev, ingredientId];
    });
    playClick(settings.soundVolume);
  }

  function handleServe(): void {
    if (customers.length === 0) return;
    const currentOrderItem = customers[0].order.items[0];
    const providedIngredients: Ingredient[] =
      currentOrderItem.ingredients.filter(function isSelected(ingredient) {
        return selectedIngredientIds.includes(ingredient.id);
      });
    const result = validateServe(currentOrderItem, providedIngredients);
    if (result.ok) {
      serveCurrentCustomerCorrect();
      playServeSuccess(settings.soundVolume);
    } else {
      const compiled = compileSelectedDish(selectedIngredientIds);
      if (compiled) {
        serveCurrentCustomerWrong();
        playServeFail(settings.soundVolume);
      } else {
        serveCurrentCustomerWrong();
        playServeFail(settings.soundVolume);
      }
    }
    setSelectedIngredientIds([]);
  }

  const totalTime =
    settings.difficulty === 'easy'
      ? 90
      : settings.difficulty === 'hard'
      ? 45
      : 60;
  const timeRatio = Math.max(0, Math.min(1, timeRemaining / totalTime));

  const requiredIds =
    customers.length > 0
      ? customers[0].order.items[0].ingredients.map(i => i.id)
      : [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topText}>⏱ {timeRemaining}s</Text>
        <Text style={styles.topText}>⭐ {currentScore}</Text>
        <Text style={styles.topText}>👥 {customersServed}</Text>
      </View>
      <View style={styles.progressWrap}>
        <View style={styles.progressBg} />
        <View style={[styles.progressFill, { width: `${timeRatio * 100}%` }]} />
      </View>
      <View style={styles.playArea}>
        {customers.length === 0 ? (
          <>
            <Text style={styles.hint}>Chưa có khách — bấm Spawn khách</Text>
            <Text style={styles.hint}>
              Khách sẽ tự ghé quầy trong chốc lát...
            </Text>
          </>
        ) : (
          <>
            <OrderCard order={customers[0].order} compact />
            <CustomerWalker
              customer={customers[0]}
              onArrive={onArriveCustomer}
            />
            <View style={styles.row}>
              <Text style={styles.hint}>
                Chọn nguyên liệu cho món đầu tiên:
              </Text>
            </View>
            <View style={styles.ingredientsRow}>
              {INGREDIENT_CATALOG.map(function renderIngredientChip(
                ingredient,
              ) {
                const isSelected = selectedIngredientIds.includes(
                  ingredient.id,
                );
                const isRequired = requiredIds.includes(ingredient.id);
                return (
                  <TouchableOpacity
                    key={ingredient.id}
                    style={[
                      isSelected ? styles.chipSelected : styles.chip,
                      isRequired ? styles.chipHint : null,
                      isSelected ? styles.chipScaleSelected : null,
                    ]}
                    onPress={() => toggleIngredient(ingredient.id)}
                  >
                    <Image
                      source={getIngredientImage(ingredient.id)}
                      style={styles.chipImage}
                    />
                    <Text
                      style={
                        isSelected ? styles.chipTextSelected : styles.chipText
                      }
                    >
                      {ingredient.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.sampleButtonPrimary}
                onPress={handleServe}
              >
                <Text style={styles.sampleButtonText}>Giao món</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButtonSmall}
                onPress={handleServeWrong}
              >
                <Text style={styles.secondaryButtonText}>Phục vụ sai</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handlePause}>
          <Text style={styles.secondaryButtonText}>Tạm dừng</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5DC' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#E6D5B8',
  },
  topText: { color: '#3B2F2F', fontWeight: '600' },
  progressWrap: {
    height: 8,
    marginHorizontal: 16,
    marginTop: 6,
    flexDirection: 'row',
  },
  progressBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#D2B48C',
    borderRadius: 4,
  },
  progressFill: { height: 8, backgroundColor: '#8B4513', borderRadius: 4 },
  playArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  hint: { color: '#6B5B5B', textAlign: 'center', marginBottom: 16 },
  sampleButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  sampleButtonPrimary: {
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  sampleButtonText: { color: '#FFF8E1', fontWeight: '600' },
  bottomBar: { padding: 12, alignItems: 'center' },
  row: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: '#D2B48C',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  secondaryButtonSmall: {
    backgroundColor: '#E6D5B8',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  secondaryButtonText: { color: '#3B2F2F', fontWeight: '500' },
  ingredientsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    justifyContent: 'center',
  },
  chip: {
    backgroundColor: '#E6D5B8',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    margin: 4,
  },
  chipSelected: {
    backgroundColor: '#8B4513',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    margin: 4,
  },
  chipScaleSelected: { transform: [{ scale: 1.05 }] },
  chipHint: { borderWidth: 1, borderColor: '#8B4513' },
  chipImage: { width: 24, height: 24, marginRight: 6 },
  chipText: { color: '#3B2F2F', fontWeight: '500' },
  chipTextSelected: { color: '#FFF8E1', fontWeight: '600' },
});

export default GameScreen;
