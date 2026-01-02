
export enum Screen {
  HOME = 'HOME',
  STORE = 'STORE',
  PROFILE = 'PROFILE',
  SETTINGS = 'SETTINGS',
  RANKING = 'RANKING',
  BETTING = 'BETTING',
  
  // Original
  GAME_MEMORY = 'GAME_MEMORY',
  GAME_TRIVIA = 'GAME_TRIVIA',
  GAME_MATH = 'GAME_MATH',
  GAME_SEQUENCE = 'GAME_SEQUENCE',
  GAME_SOUND = 'GAME_SOUND',
  GAME_PROVERB = 'GAME_PROVERB',
  GAME_INTRUDER = 'GAME_INTRUDER',
  GAME_SCRAMBLE = 'GAME_SCRAMBLE',
  
  // Infinite
  GAME_WORD_CHAIN = 'GAME_WORD_CHAIN',
  GAME_ZEN_FOCUS = 'GAME_ZEN_FOCUS',
  GAME_SUM_TARGET = 'GAME_SUM_TARGET',
  
  // Level Unlocks (Now Open & Implemented)
  GAME_PATTERN = 'GAME_PATTERN',
  GAME_ESTIMATE = 'GAME_ESTIMATE',
  GAME_ROTATION = 'GAME_ROTATION',
  GAME_COLOR_MATCH = 'GAME_COLOR_MATCH',
  GAME_HIDDEN = 'GAME_HIDDEN',
  
  // New Creative/Hard
  GAME_CARDS = 'GAME_CARDS',
  GAME_MATH_RAIN = 'GAME_MATH_RAIN',
  GAME_MOVING_HUNT = 'GAME_MOVING_HUNT'
}

export type ThemeId = 'garden' | 'ocean' | 'sunset' | 'lavender' | 'midnight';
export type AvatarId = 'owl' | 'fox' | 'cat' | 'elephant' | 'turtle' | 'lion' | 'dragon' | 'phoenix';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  reward: number; 
  condition: (stats: UserStats) => boolean;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  coins: number;
  avatar: AvatarId;
  isUser: boolean;
  streak: number; // Added streak property
}

export interface UserStats {
  coins: number;
  streak: number;
  totalGamesPlayed: number;
  level: number;
  experience: number;
  lastPlayedDate: string;
  tutorialsSeen: string[];
  unlockedThemes: ThemeId[];
  unlockedAvatars: AvatarId[];
  unlockedAchievements: string[]; 
  unlockedGames: string[]; // IDs of games unlocked via Purchase or Ad
  currentTheme: ThemeId;
  currentAvatar: AvatarId;
  highScores: Record<string, number>; // Maps gameId to score
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  leaderboard: LeaderboardEntry[];
  // New Daily Reward Props
  lastDailyClaim: string | null; // ISO Date string of last claim
  dailyStreak: number; // Current day index (0-6)
  hasRatedApp: boolean; // Tracks if user rated the app
}

export interface Minigame {
  id: string;
  screen: Screen;
  title: string;
  description: string;
  icon: string;
  color: string;
  category: 'Linguagem' | 'Atenção' | 'Raciocínio' | 'Memória' | 'Zen' | 'Clássico';
  tutorial: string;
  unlockLevel?: number;
  unlockCost?: number; // Cost in coins to unlock
  unlockAd?: boolean; // Requires watching an ad to unlock
}

export interface StoreItem {
  id: string;
  type: 'THEME' | 'AVATAR';
  name: string;
  cost: number;
  value: string;
  minLevel?: number;
}

// ... existing types
export interface TriviaQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface SequenceTask {
  title: string;
  steps: string[];
}

export interface IntruderTask {
  items: string[];
  intruder: string;
  reason: string;
}

export interface ScrambleTask {
  word: string;
  scrambled: string;
  hint: string;
}

export interface ProverbTask {
  part1: string;
  part2: string;
  options: string[];
}
