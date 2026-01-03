
export enum Screen {
  HOME = 'HOME',
  STORE = 'STORE',
  PROFILE = 'PROFILE',
  SETTINGS = 'SETTINGS',
  RANKING = 'RANKING',
  BETTING = 'BETTING',
  
  // Original / Reformulated
  GAME_MEMORY = 'GAME_MEMORY',
  GAME_TRIVIA = 'GAME_TRIVIA', // Agora "Fato ou Mito"
  GAME_MATH = 'GAME_MATH',
  GAME_SEQUENCE = 'GAME_SEQUENCE',
  GAME_SOUND = 'GAME_SOUND',
  // GAME_PROVERB REMOVED
  GAME_INTRUDER = 'GAME_INTRUDER',
  GAME_SCRAMBLE = 'GAME_SCRAMBLE',
  
  // Infinite / Reformulated
  GAME_WORD_CHAIN = 'GAME_WORD_CHAIN', // Agora "Elo de Palavras"
  GAME_ZEN_FOCUS = 'GAME_ZEN_FOCUS',
  GAME_SUM_TARGET = 'GAME_SUM_TARGET',
  
  // Level Unlocks
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
export type AvatarId = 'base' | 'medal' | 'trophy' | 'star' | 'lion' | 'dragon';
export type Language = 'pt' | 'en' | 'es';

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
  streak: number; 
}

export interface UserStats {
  userName: string;
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
  unlockedGames: string[]; 
  currentTheme: ThemeId;
  currentAvatar: AvatarId;
  highScores: Record<string, number>; 
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  leaderboard: LeaderboardEntry[];
  lastDailyClaim: string | null; 
  dailyStreak: number; 
  hasRatedApp: boolean; 
  language: Language; 
  
  weeklyTickets: number;
  raffleWins: number;
  nextRaffleDate: string; 

  dailyChallengeLastCompleted: string | null; 
  dailyChallengesWon: number;

  lastWateredDate: string | null; 
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
  unlockCost?: number; 
  unlockAd?: boolean; 
}

export interface StoreItem {
  id: string;
  type: 'THEME' | 'AVATAR';
  name: string;
  cost: number;
  value: string;
  minLevel?: number;
}

// --- GAME DATA TYPES ---

// Reformulated "Sabedoria" (Fato ou Mito)
export interface FactOrFakeQuestion {
  statement: string;
  isFact: boolean;
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

// Reformulated "Corrente" (Elo de Palavras)
export interface WordLinkBoard {
    topic: string;
    correctWords: string[]; // Palavras que pertencem ao tema
    distractors: string[]; // Palavras que NÃO pertencem
}

export interface DailyChallengeData {
    word: string;
    hint: string;
}
