import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  ScrollView,
} from 'react-native';
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
import { INGREDIENT_CATEGORIES, CATEGORY_LABELS } from '../game/categories';

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
  const coins = useGameStore(state => state.coins);
  const level = useGameStore(state => state.level);
  const exp = useGameStore(state => state.exp);
  const energy = useGameStore(state => state.energy);
  const maxEnergy = useGameStore(state => state.maxEnergy);

  const intervalRef = useRef<number | null>(null);

  // timer effect will be defined after acceptedOrder

  useEffect(
    function setupAmbient() {
      startAmbient(settings.musicVolume);
      return function cleanupAmbient() {
        stopAmbient();
      };
    },
    [settings.musicVolume],
  );

  useEffect(function animateStall() {
    Animated.loop(
      Animated.sequence([
        Animated.timing(stallAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(stallAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
    return function cleanup() {};
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
  const [reaction, setReaction] = useState<'success' | 'fail' | null>(null);
  const [coinText, setCoinText] = useState<string>('');
  const coinAnim = useRef(new Animated.Value(0)).current;
  const consumeEnergy = useGameStore(state => state.consumeEnergy);
  const [acceptedOrder, setAcceptedOrder] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('base');
  const stallAnim = useRef(new Animated.Value(0)).current;

  useEffect(
    function startTimer() {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      intervalRef.current = setInterval(function tick() {
        if (acceptedOrder) {
          const dec = useGameStore.getState().decrementTime;
          dec();
        }
      }, 1000);
      return function cleanup() {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    },
    [acceptedOrder],
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
      consumeEnergy(1);
      playServeSuccess(settings.soundVolume);
      setReaction('success');
      setTimeout(function clearReaction() {
        setReaction(null);
      }, 800);
      setCoinText(`+${currentOrderItem.price.toLocaleString('vi-VN')}₫`);
      coinAnim.setValue(0);
      Animated.timing(coinAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }).start(function end() {
        setCoinText('');
        useGameStore.getState().finalizeServeCurrentCustomer();
        setAcceptedOrder(false);
        spawnCustomerWithOrder();
      });
    } else {
      const compiled = compileSelectedDish(selectedIngredientIds);
      if (compiled) {
        serveCurrentCustomerWrong();
        consumeEnergy(1);
        playServeFail(settings.soundVolume);
        setReaction('fail');
        setTimeout(function clearReaction() {
          setReaction(null);
        }, 800);
        const penalty = Math.max(0, Math.round(currentOrderItem.price * 0.1));
        setCoinText(`-${penalty.toLocaleString('vi-VN')}₫`);
        coinAnim.setValue(0);
        Animated.timing(coinAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }).start(function end() {
          setCoinText('');
        });
      } else {
        serveCurrentCustomerWrong();
        consumeEnergy(1);
        playServeFail(settings.soundVolume);
        setReaction('fail');
        setTimeout(function clearReaction() {
          setReaction(null);
        }, 800);
        const penalty = Math.max(0, Math.round(currentOrderItem.price * 0.1));
        setCoinText(`-${penalty.toLocaleString('vi-VN')}₫`);
        coinAnim.setValue(0);
        Animated.timing(coinAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }).start(function end() {
          setCoinText('');
        });
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
  const fillColor =
    timeRatio > 0.5 ? '#8B4513' : timeRatio > 0.2 ? '#D38B5D' : '#C75050';

  const requiredIds =
    customers.length > 0
      ? customers[0].order.items[0].ingredients.map(i => i.id)
      : [];
  const showHint = customersServed < 2;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topText}>💰 {coins}</Text>
        <View style={styles.levelWrap}>
          <Text style={styles.levelText}>Lv {level}</Text>
          <View style={styles.levelBarBg} />
          <View
            style={[styles.levelBarFill, { width: `${(exp / 10) * 100}%` }]}
          />
        </View>
        <Text style={styles.topText}>
          ⚡ {energy}/{maxEnergy}
        </Text>
      </View>
      <View style={styles.progressWrap}>
        <View style={styles.progressBg} />
        <View
          style={[
            styles.progressFill,
            { width: `${timeRatio * 100}%`, backgroundColor: fillColor },
          ]}
        />
      </View>
      <View style={styles.playArea}>
        {customers.length === 0 ? (
          <>
            <Animated.Image
              source={getStallImage()}
              style={[
                styles.stallImage,
                {
                  transform: [
                    {
                      translateY: stallAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -2],
                      }),
                    },
                  ],
                },
              ]}
              resizeMode="contain"
            />
            <Text style={styles.hint}>
              Khách sẽ tự ghé quầy trong chốc lát...
            </Text>
          </>
        ) : (
          <>
            <Animated.Image
              source={getStallImage()}
              style={[
                styles.stallImage,
                {
                  transform: [
                    {
                      translateY: stallAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -2],
                      }),
                    },
                  ],
                },
              ]}
              resizeMode="contain"
            />
            {acceptedOrder ? (
              <OrderCard
                order={customers[0].order}
                compact
                remaining={timeRemaining}
              />
            ) : null}
            <View style={acceptedOrder ? { marginTop: -20 } : undefined}>
              <CustomerWalker
                key={customers[0].id}
                customer={customers[0]}
                onArrive={onArriveCustomer}
                bubbleItem={
                  acceptedOrder ? undefined : customers[0].order.items[0]
                }
                onAcceptOrder={() => {
                  setAcceptedOrder(true);
                  useGameStore.getState().resetRoundTimer();
                }}
                reaction={reaction}
                coinText={coinText}
                coinAnim={coinAnim}
              />
            </View>
            {acceptedOrder && (
              <View style={styles.row}>
                <Text style={styles.hint}>
                  Chọn nguyên liệu cho món đầu tiên:
                </Text>
              </View>
            )}
            {acceptedOrder && (
              <View style={styles.categoryRow}>
                {Object.keys(INGREDIENT_CATEGORIES).map(function renderCat(
                  key,
                ) {
                  const isActive = activeCategory === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={
                        isActive
                          ? styles.categoryChipActive
                          : styles.categoryChip
                      }
                      onPress={() => setActiveCategory(key)}
                    >
                      <Text style={styles.categoryText}>
                        {CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            {acceptedOrder && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.ingredientsScroll}
              >
                {INGREDIENT_CATALOG.filter(function inCat(ingredient) {
                  const list =
                    INGREDIENT_CATEGORIES[
                      activeCategory as keyof typeof INGREDIENT_CATEGORIES
                    ];
                  return list.includes(ingredient.id);
                }).map(function renderIngredientChip(ingredient) {
                  const isSelected = selectedIngredientIds.includes(
                    ingredient.id,
                  );
                  const isRequired = requiredIds.includes(ingredient.id);
                  return (
                    <TouchableOpacity
                      key={ingredient.id}
                      style={[
                        isSelected ? styles.chipSelected : styles.chip,
                        showHint && isRequired ? styles.chipHint : null,
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
              </ScrollView>
            )}
            {acceptedOrder && (
              <View style={[styles.row, { marginTop: 4 }]}>
                <Text style={styles.hint}>Bạn đã chọn:</Text>
              </View>
            )}
            {acceptedOrder && (
              <View style={styles.selectedRow}>
                {selectedIngredientIds.map(function renderSelected(id) {
                  return (
                    <View key={id} style={styles.selectedChip}>
                      <Image
                        source={getIngredientImage(id)}
                        style={styles.selectedImage}
                      />
                    </View>
                  );
                })}
              </View>
            )}

            {acceptedOrder && (
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
                  <Text style={styles.secondaryButtonText}>Chọn lại</Text>
                </TouchableOpacity>
              </View>
            )}
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
  levelWrap: {
    width: 96,
    height: 18,
    position: 'relative',
    justifyContent: 'center',
  },
  levelText: {
    color: '#3B2F2F',
    fontSize: 10,
    position: 'absolute',
    zIndex: 5,
    alignSelf: 'center',
    top: -2,
  },
  levelBarBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 12,
    height: 4,
    backgroundColor: '#D2B48C',
    borderRadius: 2,
  },
  levelBarFill: {
    position: 'absolute',
    left: 0,
    top: 12,
    height: 4,
    backgroundColor: '#8B4513',
    borderRadius: 2,
  },
  playArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  stallImage: { width: '92%', height: 140, marginBottom: 8, marginTop: 16 },
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
  categoryRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  categoryChip: {
    backgroundColor: '#E6D5B8',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  categoryChipActive: {
    backgroundColor: '#8B4513',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  categoryText: { color: '#3B2F2F' },
  ingredientsScroll: { paddingHorizontal: 12, marginTop: 6 },
  chip: {
    backgroundColor: '#E6D5B8',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    margin: 4,
    minWidth: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: '#8B4513',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    margin: 4,
    minWidth: 88,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#8A542F',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  chipScaleSelected: { transform: [{ scale: 1.05 }] },
  chipHint: { borderWidth: 1, borderColor: '#8B4513' },
  chipImage: { width: 24, height: 24, marginRight: 6 },
  chipText: { color: '#3B2F2F', fontWeight: '500' },
  chipTextSelected: { color: '#FFF8E1', fontWeight: '600' },

  selectedRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 0 },
  selectedChip: {
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    marginHorizontal: 8,
    padding: 6,
    borderWidth: 1,
    borderColor: '#D2B48C',
  },
  selectedImage: { width: 32, height: 32 },
});

export default GameScreen;
