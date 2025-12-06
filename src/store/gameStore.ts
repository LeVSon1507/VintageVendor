import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GameState,
  Settings,
  Customer,
  DragItem,
  Collectible,
  LeaderboardEntry,
  JournalEntry,
  Stats,
} from '../types';

interface GameStore {
  // Game state
  gameState: GameState;
  currentScore: number;
  customersServed: number;
  combo: number;
  timeRemaining: number;
  gameStartTime: number;
  isPaused: boolean;
  refreshEnergy: () => void;

  // Progression
  coins: number;
  level: number;
  exp: number;
  energy: number;
  maxEnergy: number;
  lastEnergyAt?: number;
  lastEnergyResetDate?: string;

  // Player data
  playerName: string;
  playerId: string;
  highScore: number;
  totalGamesPlayed: number;

  // Game entities
  customers: Customer[];
  dragItems: DragItem[];
  collectibles: Collectible[];

  // Settings
  settings: Settings;

  // UI state
  isLoading: boolean;
  error: string | null;
  showSettings: boolean;
  showLeaderboard: boolean;
  recentRecipeIds: string[];
  sessionCoins: number;
  highCoins: number;
  leaderboard: LeaderboardEntry[];
  recipeQueue: string[];
  journeyDay: number;
  journal: JournalEntry[];
  stats: Stats;
  hintTokens: number;
  dailyFreeHints: number;
  lastHintResetDate?: string;
  recipeFreeHintUsed: Record<string, boolean>;

  // Actions
  setGameState: (state: GameState) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;

  // Gameplay actions
  spawnCustomerWithOrder: () => void;
  serveCurrentCustomerCorrect: () => void;
  serveCurrentCustomerWrong: (missingCount?: number) => void;
  finalizeServeCurrentCustomer: () => void;

  // Progression actions
  addCoins: (amount: number) => void;
  addExp: (amount: number) => void;
  consumeEnergy: (amount: number) => void;
  restoreEnergy: (amount: number) => void;
  restoreEnergyOverflow: (amount: number) => void;
  resetRoundTimer: () => void;

  // Score management
  addScore: (points: number) => void;
  incrementCustomersServed: () => void;
  incrementCombo: () => void;
  resetCombo: () => void;

  // Customer management
  addCustomer: (customer: Customer) => void;
  removeCustomer: (customerId: string) => void;
  updateCustomer: (customerId: string, updates: Partial<Customer>) => void;

  // Drag and drop
  addDragItem: (item: DragItem) => void;
  removeDragItem: (itemId: string) => void;
  updateDragItem: (itemId: string, updates: Partial<DragItem>) => void;

  // Settings
  updateSettings: (updates: Partial<Settings>) => void;
  setPlayerName: (name: string) => void;

  // Collectibles
  addCollectible: (collectible: Collectible) => void;

  // Timer
  setTimeRemaining: (time: number) => void;
  decrementTime: () => void;

  // UI
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleSettings: () => void;
  toggleLeaderboard: () => void;

  // Reset
  resetGame: () => void;

  // Hints
  resetDailyHints: () => void;
  getRecipeHint: (itemId: string) => string[] | null;
}

const initialSettings: Settings = {
  language: 'vi',
  soundVolume: 0.7,
  musicVolume: 0.5,
  vibration: true,
  notifications: true,
  difficulty: 'medium',
  autoSave: true,
};

const initialStats: Stats = {
  customerTypeCounts: { student: 0, worker: 0, elderly: 0, tourist: 0 },
  itemSoldCounts: {},
  wrongServeCount: 0,
  outOfStockCount: 0,
  totalSodaChaiSold: 0,
  coinsEarnedThisSession: 0,
  randomNotes: [],
};

const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state
      gameState: 'menu',
      currentScore: 0,
      customersServed: 0,
      combo: 0,
      timeRemaining: 60,
      gameStartTime: 0,
      isPaused: false,

      coins: 0,
      level: 1,
      exp: 0,
      energy: 5,
      maxEnergy: 5,
      lastEnergyAt: Date.now(),
      lastEnergyResetDate: new Date().toDateString(),

      playerName: 'Player',
      playerId: '',
      highScore: 0,
      totalGamesPlayed: 0,

      customers: [],
      dragItems: [],
      collectibles: [],

      settings: initialSettings,

      isLoading: false,
      error: null,
      showSettings: false,
      showLeaderboard: false,
      recentRecipeIds: [],
      sessionCoins: 0,
      highCoins: 0,
      leaderboard: [],
      recipeQueue: [],
      journeyDay: 0,
      journal: [],
      stats: initialStats,
      hintTokens: 0,
      dailyFreeHints: 3,
      lastHintResetDate: new Date().toDateString(),
      recipeFreeHintUsed: {},

      // Actions
      setGameState: state => set({ gameState: state }),

      startGame: () => {
        const state = get();
        const today = new Date().toDateString();
        const now = Date.now();

        if (state.lastEnergyResetDate !== today) {
          set({
            energy: state.maxEnergy,
            lastEnergyResetDate: today,
            lastEnergyAt: now,
          });
          const nextDay = (state.journeyDay || 0) + 1;
          const baseJournal: JournalEntry[] = state.journal || [];
          const milestones = [
            { day: 1, title: 'Mở stall' },
            { day: 3, title: 'Mua radio cũ' },
            { day: 7, title: 'Decor bằng lồng đèn' },
            { day: 10, title: 'Khách VIP ghé' },
            { day: 20, title: 'Mở rộng bàn' },
          ];
          const coinsNow = state.coins;
          const achievedJournal: JournalEntry[] = milestones.map(
            function makeEntry(m) {
              const existing = baseJournal.find(function findEntry(e) {
                return e.day === m.day && e.title === m.title;
              });
              const isAchieved = nextDay >= m.day || coinsNow >= 2200000;
              const entry: JournalEntry = existing
                ? { ...existing, achieved: existing.achieved || isAchieved }
                : {
                    id: `journal_${m.day}`,
                    day: m.day,
                    title: m.title,
                    achieved: isAchieved,
                    date: today,
                  };
              return entry;
            },
          );
          set({ journeyDay: nextDay, journal: achievedJournal });
        } else {
          const interval = 10 * 60 * 1000;
          const last = state.lastEnergyAt ?? now;
          const gained = Math.floor((now - last) / interval);
          if (gained > 0) {
            const newEnergy = Math.min(state.maxEnergy, state.energy + gained);
            const newLast = last + gained * interval;
            set({ energy: newEnergy, lastEnergyAt: newLast });
          }
        }
        const check = get();
        if (check.energy <= 0) return;
        set({ energy: Math.max(0, check.energy - 1) });
        const { RECIPE_CATALOG } = require('../game/recipes');
        set({
          gameState: 'playing',
          currentScore: 0,
          customersServed: 0,
          combo: 0,
          timeRemaining:
            state.settings.difficulty === 'easy'
              ? 90
              : state.settings.difficulty === 'hard'
              ? 45
              : 60,
          gameStartTime: Date.now(),
          isPaused: false,
          customers: [],
          dragItems: [],
          recentRecipeIds: [],
          level: 1,
          exp: 0,
          sessionCoins: 0,
          recipeQueue: RECIPE_CATALOG.map((r: any) => r.id),
          stats: {
            ...state.stats,
            coinsEarnedThisSession: 0,
            wrongServeCount: state.stats.wrongServeCount,
            outOfStockCount: state.stats.outOfStockCount,
          },
        });
      },

      pauseGame: () => set({ isPaused: true }),
      resumeGame: () => set({ isPaused: false }),

      endGame: () => {
        const state = get();
        const finalScore = state.currentScore;
        const newHighScore = Math.max(state.highScore, finalScore);
        const durationSec = Math.max(
          0,
          Math.round((Date.now() - state.gameStartTime) / 1000),
        );
        const newHighCoins = Math.max(state.highCoins, state.sessionCoins);
        const newEntry: LeaderboardEntry = {
          rank: 0,
          playerName: state.playerName,
          score: state.sessionCoins,
          duration: durationSec,
          customersServed: state.customersServed,
        };
        const list = [...state.leaderboard, newEntry].sort(function cmp(a, b) {
          return b.score - a.score;
        });
        const ranked = list.map(function withRank(entry, idx) {
          return { ...entry, rank: idx + 1 };
        });

        set({
          gameState: 'gameOver',
          highScore: newHighScore,
          totalGamesPlayed: state.totalGamesPlayed + 1,
          isPaused: false,
          highCoins: newHighCoins,
          leaderboard: ranked,
          stats: { ...state.stats, coinsEarnedThisSession: state.sessionCoins },
        });
      },

      // Gameplay actions
      spawnCustomerWithOrder: () => {
        const state = get();
        if (state.customers.length >= 5) return;
        const { createCustomer } = require('../game/customers');
        const { generateOrder } = require('../game/orders');
        const { RECIPE_CATALOG } = require('../game/recipes');
        const customer = createCustomer();
        const allIds: string[] = (RECIPE_CATALOG || []).map((r: any) => r.id);
        if (allIds.length === 0) return;
        const existingQueue = Array.isArray(state.recipeQueue)
          ? state.recipeQueue.filter((id: string) => allIds.includes(id))
          : [];
        const queue = existingQueue.length > 0 ? existingQueue : allIds;
        const forceId = queue[0] ?? allIds[0];
        const nextQueue =
          queue.length > 0 ? [...queue.slice(1), queue[0]] : queue;
        const currentIds = state.customers
          .map(c => c.order.items[0]?.id)
          .filter(Boolean);
        const exclude = Array.from(
          new Set([...(state.recentRecipeIds || []), ...currentIds]),
        );
        const order = generateOrder({
          difficulty: state.settings.difficulty,
          excludeItemIds: exclude,
          customerType: customer.type,
          forceRecipeId: forceId,
        });
        const withOrder = { ...customer, order };
        const firstId = order.items[0]?.id;
        const nextRecent = firstId
          ? Array.from(new Set([firstId, ...state.recentRecipeIds])).slice(0, 3)
          : state.recentRecipeIds;
        set({
          customers: [...state.customers, withOrder],
          recentRecipeIds: nextRecent,
          recipeQueue: nextQueue,
        });
      },

      serveCurrentCustomerCorrect: () => {
        const state = get();
        if (state.customers.length === 0) return;
        const current = state.customers[0];
        const { calculateServeScore } = require('../game/serve');
        const points = current.order.items.reduce(
          (sum: number, item: any) =>
            sum + calculateServeScore(item, state.timeRemaining, state.combo),
          0,
        );
        const newScore = state.currentScore + points;
        set({ currentScore: newScore });
        set({ customersServed: state.customersServed + 1 });
        set({ combo: state.combo + 1 });

        const coinsGain = current.order.totalPrice;
        const expGain = Math.max(1, current.order.items.length);
        const nextExp = state.exp + expGain;
        const levelUpThreshold = 10;
        const didLevelUp = nextExp >= levelUpThreshold;
        set({
          coins: state.coins + coinsGain,
          sessionCoins: state.sessionCoins + coinsGain,
          exp: didLevelUp ? nextExp - levelUpThreshold : nextExp,
          level: didLevelUp ? state.level + 1 : state.level,
        });

        const nextTypeCounts = { ...state.stats.customerTypeCounts };
        nextTypeCounts[current.type] = (nextTypeCounts[current.type] || 0) + 1;
        const nextItemCounts = { ...state.stats.itemSoldCounts };
        current.order.items.forEach(function countItem(item: any) {
          nextItemCounts[item.id] = (nextItemCounts[item.id] || 0) + 1;
        });
        const sodaChaiSold = current.order.items.reduce(function countSoda(
          total: number,
          item: any,
        ) {
          return total + (item.id === 'soda_chai' ? 1 : 0);
        },
        0);
        set({
          stats: {
            ...state.stats,
            customerTypeCounts: nextTypeCounts,
            itemSoldCounts: nextItemCounts,
            totalSodaChaiSold: state.stats.totalSodaChaiSold + sodaChaiSold,
          },
        });
      },

      finalizeServeCurrentCustomer: () => {
        const state = get();
        if (state.customers.length === 0) return;
        set({ customers: state.customers.slice(1) });
      },

      serveCurrentCustomerWrong: (missingCount?: number) => {
        const state = get();
        if (state.customers.length === 0) return;
        const current = state.customers[0];
        const updatedPatience = Math.max(0, current.patience - 20);
        const updatedMood = updatedPatience <= 20 ? 'angry' : 'impatient';
        set({
          customers: [
            { ...current, patience: updatedPatience, mood: updatedMood },
            ...state.customers.slice(1),
          ],
        });
        set({ combo: 0 });

        const penaltyCoins = Math.max(
          0,
          Math.round(current.order.totalPrice * 0.1),
        );
        const penaltyScore = 50;
        set({ coins: Math.max(0, state.coins - penaltyCoins) });
        set({ sessionCoins: Math.max(0, state.sessionCoins - penaltyCoins) });
        set({ currentScore: Math.max(0, state.currentScore - penaltyScore) });

        const nextWrong = state.stats.wrongServeCount + 1;
        const nextOut =
          state.stats.outOfStockCount +
          Math.max(0, Math.min(1, missingCount || 0));
        set({
          stats: {
            ...state.stats,
            wrongServeCount: nextWrong,
            outOfStockCount: nextOut,
          },
        });
      },

      // Score management
      addScore: points => {
        const state = get();
        const comboMultiplier = state.combo > 0 ? 1 + state.combo * 0.1 : 1;
        const finalPoints = Math.round(points * comboMultiplier);

        set({ currentScore: state.currentScore + finalPoints });
      },

      incrementCustomersServed: () => {
        const state = get();
        set({ customersServed: state.customersServed + 1 });
      },

      incrementCombo: () => {
        const state = get();
        set({ combo: state.combo + 1 });
      },

      resetCombo: () => set({ combo: 0 }),

      // Customer management
      addCustomer: customer => {
        const state = get();
        set({ customers: [...state.customers, customer] });
      },

      removeCustomer: customerId => {
        const state = get();
        set({
          customers: state.customers.filter(c => c.id !== customerId),
        });
      },

      updateCustomer: (customerId, updates) => {
        const state = get();
        set({
          customers: state.customers.map(customer =>
            customer.id === customerId ? { ...customer, ...updates } : customer,
          ),
        });
      },

      // Drag and drop
      addDragItem: item => {
        const state = get();
        set({ dragItems: [...state.dragItems, item] });
      },

      removeDragItem: itemId => {
        const state = get();
        set({
          dragItems: state.dragItems.filter(item => item.id !== itemId),
        });
      },

      updateDragItem: (itemId, updates) => {
        const state = get();
        set({
          dragItems: state.dragItems.map(item =>
            item.id === itemId ? { ...item, ...updates } : item,
          ),
        });
      },

      // Settings
      updateSettings: updates => {
        const state = get();
        set({
          settings: { ...state.settings, ...updates },
        });
      },

      setPlayerName: name => {
        set({ playerName: name });
      },

      // Collectibles
      addCollectible: collectible => {
        const state = get();
        set({ collectibles: [...state.collectibles, collectible] });
      },

      // Timer
      setTimeRemaining: time => set({ timeRemaining: time }),
      decrementTime: () => {
        const state = get();
        if (state.isPaused) return;
        set({ timeRemaining: Math.max(0, state.timeRemaining - 1) });
      },

      // UI
      setLoading: loading => set({ isLoading: loading }),
      setError: error => set({ error }),
      toggleSettings: () => {
        const state = get();
        set({ showSettings: !state.showSettings });
      },
      toggleLeaderboard: () => {
        const state = get();
        set({ showLeaderboard: !state.showLeaderboard });
      },

      // Reset
      resetGame: () => {
        set({
          gameState: 'menu',
          currentScore: 0,
          customersServed: 0,
          combo: 0,
          timeRemaining: 60,
          gameStartTime: 0,
          isPaused: false,
          customers: [],
          dragItems: [],
          error: null,
          recipeFreeHintUsed: {},
        });
      },

      // Progression actions
      addCoins: amount => {
        const state = get();
        set({ coins: state.coins + Math.max(0, amount) });
      },
      addExp: amount => {
        const state = get();
        const next = state.exp + Math.max(0, amount);
        const threshold = 10;
        const up = Math.floor(next / threshold);
        set({ exp: next % threshold, level: state.level + up });
      },
      consumeEnergy: amount => {
        const state = get();
        set({ energy: Math.max(0, state.energy - Math.max(0, amount)) });
      },
      restoreEnergy: amount => {
        const state = get();
        set({
          energy: Math.min(state.maxEnergy, state.energy + Math.max(0, amount)),
        });
      },
      restoreEnergyOverflow: amount => {
        const state = get();
        set({ energy: state.energy + Math.max(0, amount) });
      },
      watchAdEnergy: () => {
        const state = get();
        const next = Math.min(state.maxEnergy, state.energy + 1);
        set({ energy: next, lastEnergyAt: Date.now() });
      },
      refreshEnergy: () => {
        const state = get();
        const today = new Date().toDateString();
        const now = Date.now();
        if (state.lastEnergyResetDate !== today) {
          set({
            energy: state.maxEnergy,
            lastEnergyResetDate: today,
            lastEnergyAt: now,
          });
          set({ dailyFreeHints: 3 });
          return;
        }
        const interval = 10 * 60 * 1000;
        const last = state.lastEnergyAt ?? now;
        const gained = Math.floor((now - last) / interval);
        if (gained > 0) {
          const newEnergy = Math.min(state.maxEnergy, state.energy + gained);
          const newLast = last + gained * interval;
          set({ energy: newEnergy, lastEnergyAt: newLast });
        }
      },
      resetRoundTimer: () => {
        const state = get();
        const base =
          state.settings.difficulty === 'easy'
            ? 90
            : state.settings.difficulty === 'hard'
            ? 45
            : 60;
        const adjusted = Math.max(20, base - state.level * 5);
        set({ timeRemaining: adjusted });
      },

      resetDailyHints: () => {
        const state = get();
        const today = new Date().toDateString();
        if (state.lastHintResetDate !== today) {
          set({ dailyFreeHints: 3, lastHintResetDate: today });
        }
      },

      getRecipeHint: (itemId: string) => {
        const state = get();
        const { RECIPE_CATALOG } = require('../game/recipes');
        const { INGREDIENT_CATEGORIES } = require('../game/categories');
        const rec = RECIPE_CATALOG.find((r: any) => r.id === itemId);
        if (!rec) return null;
        const wasFreeUsed = state.recipeFreeHintUsed[itemId] === true;
        if (!wasFreeUsed) {
          set({
            recipeFreeHintUsed: { ...state.recipeFreeHintUsed, [itemId]: true },
          });
        } else if (state.dailyFreeHints > 0) {
          set({ dailyFreeHints: Math.max(0, state.dailyFreeHints - 1) });
        } else if (state.hintTokens > 0) {
          set({ hintTokens: Math.max(0, state.hintTokens - 1) });
        } else {
          return null;
        }
        const ids = rec.ingredients.map((i: any) => i.id);
        function pickFromCat(cat: string): string | undefined {
          const list = INGREDIENT_CATEGORIES[cat] || [];
          const found = ids.find((id: string) => list.includes(id));
          return found;
        }
        const picks: string[] = [];
        const base = pickFromCat('base');
        const liquid = pickFromCat('liquid');
        const topping = pickFromCat('topping');
        if (base) picks.push(base);
        if (liquid) picks.push(liquid);
        if (topping) picks.push(topping);
        if (picks.length < 3) {
          for (const id of ids) {
            if (picks.length >= 3) break;
            if (!picks.includes(id)) picks.push(id);
          }
        }
        return picks.slice(0, 3);
      },
    }),
    {
      name: 'vintage-vendor-game-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        // Only persist specific parts of the state
        playerName: state.playerName,
        playerId: state.playerId,
        highScore: state.highScore,
        highCoins: state.highCoins,
        leaderboard: state.leaderboard,
        totalGamesPlayed: state.totalGamesPlayed,
        settings: state.settings,
        collectibles: state.collectibles,
        coins: state.coins,
        level: state.level,
        exp: state.exp,
        energy: state.energy,
        maxEnergy: state.maxEnergy,
        lastEnergyAt: state.lastEnergyAt,
        lastEnergyResetDate: state.lastEnergyResetDate,
        journal: state.journal,
        journeyDay: state.journeyDay,
        stats: state.stats,
        hintTokens: state.hintTokens,
        dailyFreeHints: state.dailyFreeHints,
        lastHintResetDate: state.lastHintResetDate,
        recipeFreeHintUsed: state.recipeFreeHintUsed,
      }),
    },
  ),
);

export default useGameStore;
