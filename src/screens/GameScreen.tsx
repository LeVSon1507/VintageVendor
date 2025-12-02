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
import { getIngredientName } from '../i18n/names';
import { compileSelectedDish } from '../game/combine';
import CustomerWalker from '../components/CustomerWalker';
import PauseBanner from '../components/PauseBanner';
import RecipeModal from '../components/RecipeModal';
import {
  startAmbient,
  stopAmbient,
  playVendorArrive,
  playServeSuccess,
  playServeFail,
  playClick,
} from '../audio/soundManager';
import { INGREDIENT_CATEGORIES } from '../game/categories';
import { t } from '../i18n';

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
  const resetGame = useGameStore(state => state.resetGame);

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
      if (!state.isPaused && state.customers.length < 5) {
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
    const act = useGameStore.getState().pauseGame;
    act();
  }

  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>(
    [],
  );
  const [reaction, setReaction] = useState<'success' | 'fail' | null>(null);
  const [coinText, setCoinText] = useState<string>('');
  const coinAnim = useRef(new Animated.Value(0)).current;
  const consumeEnergy = useGameStore(state => state.consumeEnergy);
  const [acceptedOrder, setAcceptedOrder] = useState<boolean>(false);
  const [actionDisabled, setActionDisabled] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('base');
  const stallAnim = useRef(new Animated.Value(0)).current;
  const isPaused = useGameStore(state => state.isPaused);
  const resumeGame = useGameStore(state => state.resumeGame);
  const getRecipeHint = useGameStore(state => state.getRecipeHint);
  const dailyFreeHints = useGameStore(state => state.dailyFreeHints);
  const [hintIds, setHintIds] = useState<string[]>([]);
  const [npcHint, setNpcHint] = useState<string>('');
  const [showRecipeModal, setShowRecipeModal] = useState<boolean>(false);
  const [hintCount, setHintCount] = useState<number>(3);
  const [categoryHintKey, setCategoryHintKey] = useState<string | null>(null);

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
      setActionDisabled(false);
      setHintIds([]);
      setNpcHint('');
    },
    [updateCustomer, settings.soundVolume],
  );

  function toggleIngredient(ingredientId: string): void {
    if (actionDisabled) return;
    setSelectedIngredientIds(function next(prev) {
      return prev.includes(ingredientId)
        ? prev.filter(id => id !== ingredientId)
        : [...prev, ingredientId];
    });
    playClick(settings.soundVolume);
  }

  function handleServe(): void {
    if (actionDisabled) return;
    if (isPaused) return;
    if (customers.length === 0) return;
    const currentOrderItem = customers[0].order.items[0];
    const providedIngredients: Ingredient[] =
      currentOrderItem.ingredients.filter(function isSelected(ingredient) {
        return selectedIngredientIds.includes(ingredient.id);
      });
    const result = validateServe(currentOrderItem, providedIngredients);
    if (result.ok) {
      setActionDisabled(true);
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
        serveCurrentCustomerWrong(result.missing.length);
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
        serveCurrentCustomerWrong(result.missing.length);
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

  function handleResetSelection(): void {
    if (actionDisabled) return;
    setSelectedIngredientIds([]);
    playClick(settings.soundVolume);
  }

  function findNextMissingIngredient(): {
    id: string | null;
    category: string | null;
  } {
    if (!acceptedOrder || customers.length === 0)
      return { id: null, category: null };
    const reqIds = customers[0].order.items[0].ingredients.map(function toId(
      i,
    ) {
      return i.id;
    });
    const missingId =
      reqIds.find(function firstMissing(id) {
        return !selectedIngredientIds.includes(id);
      }) ?? null;
    if (!missingId) return { id: null, category: null };
    const categories = Object.keys(INGREDIENT_CATEGORIES);
    const cat =
      categories.find(function has(idCat) {
        const list =
          INGREDIENT_CATEGORIES[idCat as keyof typeof INGREDIENT_CATEGORIES];
        return list.includes(missingId);
      }) ?? null;
    return { id: missingId, category: cat };
  }

  function showAdPrompt(kind: 'HINT'): void {
    setNpcHint('Xem quảng cáo để nhận gợi ý');
  }

  function handleHint(): void {
    if (actionDisabled || customers.length === 0) return;
    if (hintCount <= 0) {
      showAdPrompt('HINT');
      return;
    }
    const next = findNextMissingIngredient();
    setHintIds([]);
    setCategoryHintKey(null);
    if (next.id && next.category) {
      if (next.category === activeCategory) {
        setHintIds([next.id]);
      } else {
        setCategoryHintKey(next.category);
      }
      setHintCount(function dec(prev) {
        return Math.max(0, prev - 1);
      });
    }
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

  useEffect(
    function npcHintMaybe() {
      if (customers.length === 0 || acceptedOrder) return;
      const reqs: string[] =
        (customers[0].order.items[0] as any).requirements || [];
      const p = Math.random();
      if (p < 0.06) {
        const map: Record<string, string> = {
          'Thêm đá': 'Nhớ cho đúng phần đá nghen!',
          'Ít đá': 'Cho ít đá thôi nghen!',
          'Ít đường': 'Ít đường thôi!',
          'Không cay': 'Không cay dùm nhé!',
          Cay: 'Cho cay cay giùm!',
          Nóng: 'Làm nóng giùm!',
          Lạnh: 'Làm lạnh giùm!',
        };
        const candidates = reqs.filter(r => typeof map[r] === 'string');
        const msg =
          candidates.length > 0 ? map[candidates[0]] : 'Nhớ pha cho đúng nhé!';
        setNpcHint(msg);
      } else {
        setNpcHint('');
      }
    },
    [customers, acceptedOrder],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topText}>💰 {coins}</Text>
        <View style={styles.levelWrap}>
          <Text style={styles.levelText}>Lv {level}</Text>
          <View style={styles.levelBarContainer}>
            <View
              style={[styles.levelBarFill, { width: `${(exp / 10) * 100}%` }]}
            />
          </View>
        </View>
        <View style={styles.topRight}>
          <Text style={styles.topText}>
            ⚡ {energy}/{maxEnergy}
          </Text>
          <TouchableOpacity
            style={styles.pauseIconButton}
            onPress={handlePause}
          >
            <Text style={styles.pauseIconText}>⏸️</Text>
          </TouchableOpacity>
        </View>
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
            <Text style={styles.hint}>{t('hintAwaitCustomer')}</Text>
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
            {/* removed inner pause overlay to avoid duplicate modals; global overlay is used */}
            {acceptedOrder ? (
              <OrderCard
                order={customers[0].order}
                compact
                remaining={timeRemaining}
              />
            ) : null}
            <View
              style={acceptedOrder ? styles.acceptedOrderOffset : undefined}
            >
              <CustomerWalker
                key={customers[0].id}
                customer={customers[0]}
                onArrive={onArriveCustomer}
                bubbleItem={
                  acceptedOrder ? undefined : customers[0].order.items[0]
                }
                onAcceptOrder={() => {
                  if (actionDisabled) return;
                  setAcceptedOrder(true);
                  useGameStore.getState().resetRoundTimer();
                }}
                reaction={reaction}
                coinText={coinText}
                coinAnim={coinAnim}
                npcHint={acceptedOrder ? '' : npcHint}
              />
            </View>
            {acceptedOrder && (
              <View style={styles.row}>
                <Text style={styles.hint}>{t('selectIngredientsFirst')}</Text>
              </View>
            )}
            {acceptedOrder && (
              <View style={styles.categoryRow}>
                {Object.keys(INGREDIENT_CATEGORIES).map(function renderCat(
                  key,
                ) {
                  const isActive = activeCategory === key;
                  const labelMap: Record<string, string> = {
                    base: t('categoryBase'),
                    protein: t('categoryProtein'),
                    liquid: t('categoryLiquid'),
                    topping: t('categoryTopping'),
                    spices: t('categorySpices'),
                  };
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[
                        isActive
                          ? styles.categoryChipActive
                          : styles.categoryChip,
                        categoryHintKey === key ? styles.categoryHint : null,
                      ]}
                      onPress={() => {
                        if (actionDisabled) return;
                        setActiveCategory(key);
                        setCategoryHintKey(null);
                      }}
                    >
                      <Text style={styles.categoryText}>{labelMap[key]}</Text>
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
                  const isHinted = hintIds.includes(ingredient.id);
                  return (
                    <TouchableOpacity
                      key={ingredient.id}
                      style={[
                        isSelected ? styles.chipSelected : styles.chip,
                        showHint && isRequired ? styles.chipHint : null,
                        isHinted ? styles.chipHint : null,
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
                        {getIngredientName(ingredient.id)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
            {acceptedOrder && (
              <View style={styles.rowSmallMargin}>
                <Text style={styles.hint}>{t('youSelected')}</Text>
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
              <View style={styles.actionRow}>
                <View style={styles.actionItem}>
                  <TouchableOpacity
                    style={[styles.secondaryButtonSmall, styles.fullButton]}
                    onPress={handleResetSelection}
                  >
                    <Text style={styles.secondaryButtonText}>
                      {t('selectAgain')}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.actionItem}>
                  <TouchableOpacity
                    style={[styles.secondaryButtonSmall, styles.fullButton]}
                    onPress={() => setShowRecipeModal(true)}
                    accessibilityLabel={t('recipes')}
                  >
                    <Text style={styles.secondaryButtonText}>
                      📜 {t('recipes')}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.actionItem}>
                  <TouchableOpacity
                    style={[styles.secondaryButtonSmall, styles.fullButton]}
                    onPress={handleHint}
                  >
                    <Text style={styles.secondaryButtonText}>
                      💡 {t('hint')} (x{hintCount})
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}
      </View>
      {acceptedOrder ? (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.deliverButton} onPress={handleServe}>
            <Text style={styles.sampleButtonText}>{t('deliverDish')}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {showRecipeModal ? (
        <View style={styles.globalOverlay} pointerEvents="auto">
          <View style={styles.globalDim} />
          <RecipeModal
            visible={showRecipeModal}
            onClose={() => setShowRecipeModal(false)}
          />
        </View>
      ) : null}
      {isPaused ? (
        <View style={styles.globalOverlay} pointerEvents="auto">
          <View style={styles.globalDim} />
          <PauseBanner
            onResume={() => resumeGame()}
            onHome={() => {
              resetGame();
              navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
            }}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5DC' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    width: 100,
    flexDirection: 'column',
    alignItems: 'center',
  },
  levelText: {
    color: '#3B2F2F',
    fontSize: 12,
    marginBottom: 4,
  },
  levelBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#D2B48C',
    borderRadius: 3,
    overflow: 'hidden',
  },
  levelBarFill: {
    height: 6,
    backgroundColor: '#8B4513',
  },
  playArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  stallImage: { width: '92%', height: 140, marginBottom: 8, marginTop: 16 },
  hint: { color: '#6B5B5B', textAlign: 'center', marginBottom: 16 },
  topRight: { flexDirection: 'row', alignItems: 'center' },
  sampleButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  sampleButtonPrimary: {
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    borderRadius: 12,
    marginRight: 8,
  },
  sampleButtonText: { color: '#FFF8E1', fontWeight: '600' },
  bottomBar: { padding: 12, alignItems: 'center' },
  deliverButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 12,
    width: '80%',
    alignSelf: 'center',
  },
  fullButton: { width: '100%' },
  pauseIconButton: {
    backgroundColor: '#D2B48C',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  pauseIconText: { color: '#3B2F2F', fontWeight: '600' },
  inlineGroup: { flexDirection: 'row', alignItems: 'center' },
  iconButton: {
    backgroundColor: '#E6D5B8',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  iconButtonText: { color: '#3B2F2F', fontWeight: '600' },
  row: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowSmallMargin: {
    flexDirection: 'row',
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '92%',
    alignSelf: 'center',
    marginTop: 12,
  },
  actionItem: {
    flex: 1,
    marginHorizontal: 6,
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
    // paddingHorizontal: 4,
    alignItems: 'center',
    borderRadius: 8,
  },
  pauseButtonSmall: {
    backgroundColor: '#D2B48C',
    paddingVertical: 8,
    alignItems: 'center',
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
  categoryHint: { borderWidth: 2, borderColor: '#FFD54F' },
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
  pauseOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    elevation: 12,
  },
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
  acceptedOrderOffset: { marginTop: -20 },
});

export default GameScreen;
