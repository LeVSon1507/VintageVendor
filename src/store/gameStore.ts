import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, Settings, Customer, DragItem, Collectible } from '../types';

interface GameStore {
  // Game state
  gameState: GameState;
  currentScore: number;
  customersServed: number;
  combo: number;
  timeRemaining: number;
  gameStartTime: number;
  isPaused: boolean;

  // Progression
  coins: number;
  level: number;
  exp: number;
  energy: number;
  maxEnergy: number;

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
  lastRecipeId?: string;

  // Actions
  setGameState: (state: GameState) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;

  // Gameplay actions
  spawnCustomerWithOrder: () => void;
  serveCurrentCustomerCorrect: () => void;
  serveCurrentCustomerWrong: () => void;
  finalizeServeCurrentCustomer: () => void;

  // Progression actions
  addCoins: (amount: number) => void;
  addExp: (amount: number) => void;
  consumeEnergy: (amount: number) => void;
  restoreEnergy: (amount: number) => void;
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
      energy: 10,
      maxEnergy: 10,

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
      lastRecipeId: undefined,

      // Actions
      setGameState: state => set({ gameState: state }),

      startGame: () => {
        const state = get();
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
          lastRecipeId: undefined,
        });
      },

      pauseGame: () => set({ isPaused: true }),
      resumeGame: () => set({ isPaused: false }),

      endGame: () => {
        const state = get();
        const finalScore = state.currentScore;
        const newHighScore = Math.max(state.highScore, finalScore);

        set({
          gameState: 'gameOver',
          highScore: newHighScore,
          totalGamesPlayed: state.totalGamesPlayed + 1,
          isPaused: false,
        });
      },

      // Gameplay actions
      spawnCustomerWithOrder: () => {
        const state = get();
        if (state.customers.length >= 5) return;
        const { createCustomer } = require('../game/customers');
        const { generateOrder } = require('../game/orders');
        const customer = createCustomer();
        const order = generateOrder({ difficulty: state.settings.difficulty, excludeItemIds: state.lastRecipeId ? [state.lastRecipeId] : [] });
        const withOrder = { ...customer, order };
        set({ customers: [...state.customers, withOrder], lastRecipeId: order.items[0]?.id });
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
          exp: didLevelUp ? nextExp - levelUpThreshold : nextExp,
          level: didLevelUp ? state.level + 1 : state.level,
        });
      },

      finalizeServeCurrentCustomer: () => {
        const state = get();
        if (state.customers.length === 0) return;
        set({ customers: state.customers.slice(1) });
      },

      serveCurrentCustomerWrong: () => {
        const state = get();
        if (state.customers.length === 0) return;
        const current = state.customers[0];
        const updatedPatience = Math.max(0, current.patience - 20);
        const updatedMood = updatedPatience <= 20 ? 'angry' : 'impatient';
        set({
          customers: [{ ...current, patience: updatedPatience, mood: updatedMood }, ...state.customers.slice(1)],
        });
        set({ combo: 0 });

        const penaltyCoins = Math.max(0, Math.round(current.order.totalPrice * 0.1));
        const penaltyScore = 50;
        set({ coins: Math.max(0, state.coins - penaltyCoins) });
        set({ currentScore: Math.max(0, state.currentScore - penaltyScore) });
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
      resetRoundTimer: () => {
        const state = get();
        const base = state.settings.difficulty === 'easy' ? 90 : state.settings.difficulty === 'hard' ? 45 : 60;
        const adjusted = Math.max(20, base - state.level * 5);
        set({ timeRemaining: adjusted });
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
        totalGamesPlayed: state.totalGamesPlayed,
        settings: state.settings,
        collectibles: state.collectibles,
        coins: state.coins,
        level: state.level,
        exp: state.exp,
        energy: state.energy,
        maxEnergy: state.maxEnergy,
      }),
    },
  ),
);

export default useGameStore;
