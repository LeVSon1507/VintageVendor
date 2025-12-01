// Core game types
export type GameState = 'menu' | 'playing' | 'paused' | 'gameOver' | 'photoMode';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Language = 'vi' | 'en';

// Player and scoring
export type Player = {
  id: string;
  name: string;
  email?: string;
  createdAt: Date;
  lastPlayed: Date;
  totalScore: number;
  gamesPlayed: number;
};

export type Score = {
  id: string;
  playerId: string;
  score: number;
  duration: number;
  customersServed: number;
  combo: number;
  createdAt: Date;
};

export type LeaderboardEntry = {
  rank: number;
  playerName: string;
  score: number;
  duration: number;
  customersServed: number;
};

// Game entities
export type Customer = {
  id: string;
  type: 'student' | 'worker' | 'elderly' | 'tourist';
  order: Order;
  patience: number; // 0-100
  position: Position;
  mood: 'happy' | 'neutral' | 'impatient' | 'angry';
};

export type Order = {
  id: string;
  items: OrderItem[];
  totalPrice: number;
  timeLimit: number;
  complexity: number;
};

export type OrderItem = {
  id: string;
  name: string;
  ingredients: Ingredient[];
  price: number;
  preparationTime: number;
  requirements?: string[];
};

export type Ingredient = {
  id: string;
  name: string;
  type: 'liquid' | 'solid' | 'powder' | 'garnish';
  quantity: number;
  unit: 'ml' | 'g' | 'piece';
};

// UI and interaction
export type Position = {
  x: number;
  y: number;
};

export type DragItem = {
  id: string;
  type: 'ingredient' | 'dish' | 'tool';
  name: string;
  position: Position;
  size: { width: number; height: number };
  touchArea: number;
};

// Collectibles and achievements
export type Collectible = {
  id: string;
  name: string;
  type: 'lixi' | 'vintage_item' | 'recipe';
  rarity: 'common' | 'rare' | 'legendary';
  description: string;
  icon: string;
  obtainedAt: Date;
};

// Photo and sharing
type PhotoFilter = 'vintage' | 'sepia' | 'blackwhite' | 'retro';

export type GamePhoto = {
  id: string;
  imageData: string;
  filter: PhotoFilter;
  caption: string;
  score: number;
  createdAt: Date;
};

// Settings and preferences
export type Settings = {
  language: Language;
  soundVolume: number;
  musicVolume: number;
  vibration: boolean;
  notifications: boolean;
  difficulty: Difficulty;
  autoSave: boolean;
};

// API types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type LeaderboardTimeframe = 'day' | 'week' | 'all';

// Game session
export type GameSession = {
  id: string;
  playerId: string;
  startTime: Date;
  endTime?: Date;
  score: number;
  customersServed: number;
  combo: number;
  difficulty: Difficulty;
  state: GameState;
};

// Navigation
export type RootStackParamList = {
  Home: undefined;
  Game: undefined;
  GameOver: { score: number; customersServed: number; combo: number };
  PhotoMode: { gameState: GameState };
  Leaderboard: undefined;
  Settings: undefined;
  StoreList: undefined;
};

// Component props
type BaseComponentProps = {
  style?: any;
  children?: React.ReactNode;
};

export type GameButtonProps = BaseComponentProps & {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
};

export type CustomerCardProps = {
  customer: Customer;
  onOrderComplete: (orderId: string) => void;
  onCustomerLeave: (customerId: string) => void;
};

export type IngredientSlotProps = {
  ingredient: Ingredient;
  onDragStart: (ingredient: Ingredient) => void;
  onDragEnd: () => void;
};

// Animation types
export type AnimationType = 'fade' | 'slide' | 'scale' | 'bounce';

export type AnimationConfig = {
  type: AnimationType;
  duration: number;
  delay?: number;
  easing?: string;
};

// Haptic feedback
export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

// Storage keys
export const STORAGE_KEYS = {
  PLAYER_DATA: '@vintage_vendor:player_data',
  GAME_SETTINGS: '@vintage_vendor:game_settings',
  HIGH_SCORE: '@vintage_vendor:high_score',
  LAST_SESSION: '@vintage_vendor:last_session',
  COLLECTIBLES: '@vintage_vendor:collectibles',
} as const;

// Game constants
export const GAME_CONSTANTS = {
  MAX_CUSTOMERS: 5,
  BASE_PATIENCE: 100,
  PATIENCE_DECAY_RATE: 1,
  BASE_GAME_TIME: 60,
  COMBO_MULTIPLIER: 1.5,
  MIN_TOUCH_AREA: 44,
  MAX_INGREDIENTS: 3,
  SCORE_PER_CUSTOMER: 100,
  SCORE_PER_SECOND: 10,
} as const;
