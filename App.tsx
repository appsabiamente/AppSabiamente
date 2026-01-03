
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Screen, UserStats, Minigame, ThemeId, AvatarId, StoreItem, Achievement, LeaderboardEntry, Language } from './types';
import { Video, Star, Brain, Music, Calculator, ClipboardList, Coins, Target, Zap, Activity, Wind, Eye, Square, LayoutGrid, Info, Home, Store, User, RotateCcw, Check, Sparkles, Infinity as InfinityIcon, Lock, Unlock, Grid, Link, Quote, AlertCircle, Type, Grid3X3, Palette, Search, Trophy, Medal, Crown, Ghost, Sun, Gamepad, CheckCircle, XCircle, Box, Copy, TrendingUp, CloudRain, ListOrdered, MousePointerClick, SunMedium, Moon, Cloud, Flower, Settings as SettingsIcon, Users, Clover, ArrowUpCircle, Flame, ThumbsUp, Play, CheckSquare, HeartHandshake, WifiOff, SignalHigh, Book, Feather, Leaf, Edit3, Image as ImageIcon, Send } from 'lucide-react';

import { setMuted, playClickSound, playFanfare, playCelebrationSound, playMagicalSound } from './services/audioService';
import { triggerFireworks, triggerConfettiCannon, triggerCentralBurst } from './services/celebrationService';
import MemoryGame from './components/MemoryGame';
import TriviaGame from './components/TriviaGame';
import MathGame from './components/MathGame';
import SequenceGame from './components/SequenceGame';
import SoundGame from './components/SoundGame';
import TreeOfMind from './components/TreeOfMind';
import Ranking from './components/Ranking';
import Betting from './components/Betting';
import Settings from './components/Settings';
import {
  IntruderGame,
  ScrambleGame,
  WordChainGame,
  ZenFocusGame,
  SumTargetGame,
  PatternGame,
  EstimateGame,
  RotationGame,
  ColorMatchGame,
  HiddenObjectGame,
  CardGame,
  MathRainGame,
  MovingHuntGame
} from './components/NewGames';

const getNextSunday = () => {
    const d = new Date();
    d.setDate(d.getDate() + (7 - d.getDay()) % 7);
    d.setHours(23, 59, 59, 0);
    return d.toISOString();
};

const INITIAL_STATS: UserStats = {
  userName: '', 
  coins: 0,
  streak: 0, 
  totalGamesPlayed: 0,
  level: 1,
  experience: 0,
  lastPlayedDate: '2000-01-01T00:00:00.000Z', 
  tutorialsSeen: [],
  unlockedThemes: ['garden'],
  unlockedAvatars: ['base'],
  unlockedAchievements: [],
  unlockedGames: [], 
  currentTheme: 'garden',
  currentAvatar: 'base',
  highScores: {},
  soundEnabled: true,
  notificationsEnabled: false,
  leaderboard: [],
  lastDailyClaim: null,
  dailyStreak: 0,
  hasRatedApp: false,
  language: 'pt',
  weeklyTickets: 0,
  raffleWins: 0,
  nextRaffleDate: getNextSunday(),
  dailyChallengeLastCompleted: null,
  dailyChallengesWon: 0,
  lastWateredDate: null 
};

const FIRST_NAMES = [
    "Maria", "João", "José", "Ana", "Francisco", "Luiz", "Paulo", "Carlos", "Manoel", "Pedro", 
    "Francisca", "Marcos", "Raimundo", "Sebastião", "Antônio", "Marcelo", "Jorge", "Geraldo", 
    "Adriana", "Sandra", "Márcia", "Vera", "Bento", "Helena", "Beatriz", "Ricardo", "Sônia", 
    "Lúcia", "Roberto", "Fernanda", "Camila", "Lucas", "Matheus", "Gabriel", "Dona Cida", "Sr. João"
];
const LAST_NAMES = [
    "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", 
    "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes", "Soares", "Fernandes", 
    "Vieira", "Barbosa", "Rocha", "Dias", "Nascimento", "Andrade", "Moreira", "Nunes", "Marques"
];
const FANTASY_NAMES = [
    "Mestre do Saber", "Vovó Ninja", "Cérebro Ativo", "Super Vovô", "Rainha da Paz",
    "Coruja Sábia", "Águia Dourada", "Pensador", "Memória 1000", "Sábio 2024",
    "Gênio", "Vencedor", "Anônimo", "Mente Afiada", "Vovó Feliz", "Rei do Xadrez",
    "Dama de Ferro", "Professor X", "Einstein", "Lobo Guará", "Sr. Mistério",
    "Campeão", "Estrela Guia", "Sol da Manhã", "Fênix", "Mestre Yoda"
];

const ACHIEVEMENTS: Achievement[] = [
    { id: 'first_step', title: 'Primeiro Passo', description: 'Complete 1 jogo.', icon: 'Star', unlocked: false, reward: 20, condition: s => s.totalGamesPlayed >= 1 },
    { id: 'rich', title: 'Pote de Ouro', description: 'Acumule 500 moedas.', icon: 'Coins', unlocked: false, reward: 50, condition: s => s.coins >= 500 },
    { id: 'wise', title: 'Sábio', description: 'Alcance o nível 5.', icon: 'Brain', unlocked: false, reward: 100, condition: s => s.level >= 5 },
    { id: 'master', title: 'Mestre da Mente', description: 'Alcance o nível 10.', icon: 'Crown', unlocked: false, reward: 200, condition: s => s.level >= 10 },
    { id: 'expert', title: 'Especialista', description: 'Complete 50 jogos.', icon: 'Zap', unlocked: false, reward: 150, condition: s => s.totalGamesPlayed >= 50 },
    { id: 'veteran', title: 'Veterano', description: 'Jogue 100 vezes.', icon: 'Shield', unlocked: false, reward: 300, condition: s => s.totalGamesPlayed >= 100 },
    { id: 'brilliant', title: 'Mente Brilhante', description: 'Alcance o Nível 20.', icon: 'Sun', unlocked: false, reward: 500, condition: s => s.level >= 20 },
    { id: 'collector', title: 'Colecionador', description: 'Tenha 3 avatares.', icon: 'User', unlocked: false, reward: 250, condition: s => s.unlockedAvatars.length >= 3 },
    { id: 'millionaire', title: 'Tesouro', description: 'Acumule 2000 moedas.', icon: 'Coins', unlocked: false, reward: 400, condition: s => s.coins >= 2000 },
    { id: 'unstoppable', title: 'Imparável', description: 'Atinja Nível 30.', icon: 'Zap', unlocked: false, reward: 1000, condition: s => s.level >= 30 },
    { id: 'encyclopedia', title: 'Enciclopédia', description: 'Recorde > 50 na Sabedoria.', icon: 'Book', unlocked: false, reward: 100, condition: s => (s.highScores['triv'] || 0) >= 50 },
    { id: 'calculator', title: 'Calculadora', description: 'Recorde > 50 no Cálculo.', icon: 'Calculator', unlocked: false, reward: 100, condition: s => (s.highScores['math'] || 0) >= 50 },
    { id: 'eagle_eye', title: 'Olhos de Águia', description: 'Recorde > 50 no Intruso.', icon: 'Eye', unlocked: false, reward: 100, condition: s => (s.highScores['intr'] || 0) >= 50 },
    { id: 'poet', title: 'Poeta', description: 'Recorde > 50 no Elo.', icon: 'Feather', unlocked: false, reward: 100, condition: s => (s.highScores['chain'] || 0) >= 50 },
    { id: 'zen_master', title: 'Mestre Zen', description: 'Recorde > 50 no Foco Zen.', icon: 'Leaf', unlocked: false, reward: 100, condition: s => (s.highScores['zen'] || 0) >= 50 },
];

const THEMES: Record<ThemeId, string> = {
    garden: 'bg-brand-bg text-gray-900',
    ocean: 'bg-cyan-50 text-slate-900',
    sunset: 'bg-orange-50 text-orange-900',
    lavender: 'bg-purple-50 text-purple-900',
    midnight: 'bg-slate-900 text-white'
};

const AVATARS: Record<AvatarId, any> = {
    base: <User />,
    medal: <Medal />, 
    trophy: <Trophy />, 
    star: <Star />, 
    lion: <Crown />, 
    dragon: <Ghost />
};

const STORE_ITEMS: StoreItem[] = [
    { id: 'av_medal', type: 'AVATAR', name: 'Medalha', cost: 250, value: 'medal' },
    { id: 'av_trophy', type: 'AVATAR', name: 'Troféu', cost: 500, value: 'trophy' },
    { id: 'av_star', type: 'AVATAR', name: 'Estrela', cost: 1000, value: 'star' },
    { id: 'av_lion', type: 'AVATAR', name: 'Leão (Nv. 5)', cost: 2000, value: 'lion', minLevel: 5 },
    { id: 'av_dragon', type: 'AVATAR', name: 'Dragão (Nv. 10)', cost: 5000, value: 'dragon', minLevel: 10 },
];

const GAMES: Minigame[] = [
  { id: 'chain', screen: Screen.GAME_WORD_CHAIN, title: 'Elo de Palavras', description: 'Categorias', icon: 'Link', category: 'Linguagem', color: 'text-blue-600 bg-blue-100', tutorial: 'Encontre todas as palavras do tema.', unlockLevel: 1 },
  { id: 'zen', screen: Screen.GAME_ZEN_FOCUS, title: 'Foco Zen', description: 'Infinito', icon: 'Eye', category: 'Zen', color: 'text-teal-600 bg-teal-100', tutorial: 'Toque apenas nos círculos.', unlockLevel: 1 },
  { id: 'sum', screen: Screen.GAME_SUM_TARGET, title: 'Soma Alvo', description: 'Infinito', icon: 'Target', category: 'Raciocínio', color: 'text-green-600 bg-green-100', tutorial: 'Atinga a soma alvo.', unlockLevel: 1 },
  { id: 'cards', screen: Screen.GAME_CARDS, title: 'Cartas', description: 'Sorte', icon: 'Copy', category: 'Clássico', color: 'text-red-600 bg-red-100', tutorial: 'Maior ou menor?', unlockLevel: 1 },
  { id: 'mem', screen: Screen.GAME_MEMORY, title: 'Memória', description: 'Pares', icon: 'Brain', category: 'Memória', color: 'text-indigo-600 bg-indigo-100', tutorial: 'Encontre os pares.', unlockLevel: 1 },
  { id: 'triv', screen: Screen.GAME_TRIVIA, title: 'Fato ou Mito?', description: 'Quiz Rápido', icon: 'Brain', category: 'Linguagem', color: 'text-blue-600 bg-blue-100', tutorial: 'É verdade ou mentira?', unlockLevel: 1 },
  { id: 'math', screen: Screen.GAME_MATH, title: 'Cálculo', description: 'Compras', icon: 'Calculator', category: 'Raciocínio', color: 'text-emerald-600 bg-emerald-100', tutorial: 'Faça as contas.', unlockLevel: 1 },
  { id: 'patt', screen: Screen.GAME_PATTERN, title: 'Padrões', description: 'Visual', icon: 'Grid3X3', category: 'Memória', color: 'text-purple-600 bg-purple-100', tutorial: 'Repita o padrão.', unlockLevel: 1 },
  { id: 'est', screen: Screen.GAME_ESTIMATE, title: 'Estimativa', description: 'Qtd.', icon: 'Activity', category: 'Raciocínio', color: 'text-orange-600 bg-orange-100', tutorial: 'Estime a quantidade.', unlockLevel: 1 },
  { id: 'rot', screen: Screen.GAME_ROTATION, title: 'Rotação', description: 'Espacial', icon: 'RotateCcw', category: 'Raciocínio', color: 'text-cyan-600 bg-cyan-100', tutorial: 'Qual a figura rodada?', unlockAd: true },
  { id: 'rain', screen: Screen.GAME_MATH_RAIN, title: 'Chuva', description: 'Rápido', icon: 'CloudRain', category: 'Raciocínio', color: 'text-blue-600 bg-blue-100', tutorial: 'Resolva antes de cair.', unlockLevel: 3 },
  { id: 'col', screen: Screen.GAME_COLOR_MATCH, title: 'Cores', description: 'Rápido', icon: 'Palette', category: 'Atenção', color: 'text-pink-600 bg-pink-100', tutorial: 'A cor combina?', unlockLevel: 5 },
  { id: 'mov', screen: Screen.GAME_MOVING_HUNT, title: 'Caça', description: 'Foco', icon: 'MousePointerClick', category: 'Atenção', color: 'text-red-600 bg-red-100', tutorial: 'Ache o único.', unlockLevel: 10 },
  { id: 'hid', screen: Screen.GAME_HIDDEN, title: 'Oculto', description: 'Foco', icon: 'Search', category: 'Atenção', color: 'text-gray-600 bg-gray-200', tutorial: 'Encontre o objeto.', unlockCost: 10000 },
];

type LockType = 'LEVEL' | 'COINS' | 'AD';
interface PendingUnlock {
    game: Minigame;
    type: LockType;
}

type EventType = 'LEVEL_UP' | 'ACHIEVEMENT' | 'STREAK';
interface GameEvent {
    type: EventType;
    data: any;
}

const FORCED_AD_INTERVAL = 5 * 60 * 1000;

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.HOME);
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  const [activeTutorial, setActiveTutorial] = useState<{title: string, text: string, gameId: string} | null>(null);
  const [victoryData, setVictoryData] = useState<{score: number, gameId: string} | null>(null);
  const [imgError, setImgError] = useState(false); 
  
  const [showAdModal, setShowAdModal] = useState(false);
  const adCallbackRef = useRef<(() => void) | null>(null);
  const [isForcedAd, setIsForcedAd] = useState(false);
  
  const lastAdTime = useRef<number>(Date.now());
  const [pendingForcedAd, setPendingForcedAd] = useState(false);

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [pendingUnlock, setPendingUnlock] = useState<PendingUnlock | null>(null);
  const [pendingAdReward, setPendingAdReward] = useState<'NONE' | 'GAME_UNLOCK' | 'COINS' | 'GENERIC'>('NONE');

  const [eventQueue, setEventQueue] = useState<GameEvent[]>([]);
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const [levelUpData, setLevelUpData] = useState<{level: number, reward: number} | null>(null);
  const [streakPopupValue, setStreakPopupValue] = useState<number | null>(null);
  
  const [isRatingCheck, setIsRatingCheck] = useState(false);
  const [isRaining, setIsRaining] = useState(false);

  // New state for name editing feedback
  const [nameSaved, setNameSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sabiamente_stats_v8');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (!parsed.leaderboard || !Array.isArray(parsed.leaderboard)) parsed.leaderboard = []; 
            if (!parsed.unlockedAvatars) parsed.unlockedAvatars = ['base'];
            if (!parsed.currentAvatar) parsed.currentAvatar = 'base';
            if (!parsed.language) parsed.language = 'pt';
            if (parsed.weeklyTickets === undefined) parsed.weeklyTickets = 0;
            if (parsed.raffleWins === undefined) parsed.raffleWins = 0;
            if (!parsed.nextRaffleDate) parsed.nextRaffleDate = getNextSunday();
            if (!parsed.dailyChallengesWon) parsed.dailyChallengesWon = 0;
            if (!parsed.dailyChallengeLastCompleted) parsed.dailyChallengeLastCompleted = null;
            if (!parsed.lastWateredDate) parsed.lastWateredDate = null;
            if (!parsed.userName) parsed.userName = '';
            
            const cleanStats = {...INITIAL_STATS, ...parsed};
            setStats(cleanStats);

            if (cleanStats.leaderboard.length < 50) {
                initLeaderboard(cleanStats.coins);
            }

        } catch (e) {
            console.error("Save data corrupted", e);
            initLeaderboard(INITIAL_STATS.coins);
        }
    } else {
        initLeaderboard(INITIAL_STATS.coins);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sabiamente_stats_v8', JSON.stringify(stats));
    checkAchievements(); 
    setMuted(!stats.soundEnabled);
  }, [stats]);

  useEffect(() => {
      const isModalActive = levelUpData || unlockedAchievement || streakPopupValue || victoryData || pendingUnlock || showAdModal || activeTutorial;
      
      if (currentScreen === Screen.HOME && eventQueue.length > 0 && !isModalActive) {
          const t = setTimeout(() => {
              const nextEvent = eventQueue[0];
              const remaining = eventQueue.slice(1);
              setEventQueue(remaining);

              switch(nextEvent.type) {
                  case 'LEVEL_UP':
                      setLevelUpData(nextEvent.data);
                      triggerFireworks();
                      playFanfare();
                      break;
                  case 'ACHIEVEMENT':
                      setUnlockedAchievement(nextEvent.data);
                      triggerConfettiCannon();
                      playFanfare();
                      break;
                  case 'STREAK':
                      setStreakPopupValue(nextEvent.data);
                      triggerCentralBurst();
                      playCelebrationSound();
                      break;
              }
          }, 500); 
          return () => clearTimeout(t);
      }
  }, [currentScreen, eventQueue, levelUpData, unlockedAchievement, streakPopupValue, victoryData, pendingUnlock, showAdModal, activeTutorial]);

  useEffect(() => {
      const handleGlobalClick = (e: MouseEvent) => {
          const target = e.target as HTMLElement;
          if (target.closest('button') || target.closest('a') || target.closest('.interactive')) {
              playClickSound();
          }
      };
      window.addEventListener('click', handleGlobalClick);
      return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isMenuScreen = (screen: Screen) => {
      return [Screen.HOME, Screen.STORE, Screen.PROFILE, Screen.SETTINGS, Screen.RANKING, Screen.BETTING].includes(screen);
  };

  useEffect(() => {
      const adTimer = setInterval(() => {
          const now = Date.now();
          if (now - lastAdTime.current > FORCED_AD_INTERVAL) {
              const isModalActive = showAdModal || activeTutorial || victoryData || pendingUnlock || levelUpData;
              if (isMenuScreen(currentScreen) && !isModalActive) {
                  triggerForcedAd();
              } else {
                  setPendingForcedAd(true);
              }
          }
      }, 10000); 
      return () => clearInterval(adTimer);
  }, [currentScreen, showAdModal, activeTutorial, victoryData, pendingUnlock, levelUpData]);

  useEffect(() => {
      const isModalActive = showAdModal || activeTutorial || victoryData || pendingUnlock || levelUpData;
      if (pendingForcedAd && isMenuScreen(currentScreen) && !isModalActive) {
          triggerForcedAd();
      }
  }, [currentScreen, pendingForcedAd, showAdModal, activeTutorial, victoryData, pendingUnlock, levelUpData]);

  const triggerForcedAd = () => {
      setIsForcedAd(true);
      setShowAdModal(true);
      setPendingForcedAd(false);
  };

  const syncWithLeaderboard = (s: UserStats): UserStats => {
      if (!s.leaderboard || !Array.isArray(s.leaderboard)) {
          return {
              ...s,
              leaderboard: [{ id: 'user', name: s.userName || 'Você', coins: s.coins, avatar: s.currentAvatar, isUser: true, streak: s.streak }]
          };
      }
      const userExists = s.leaderboard.some(e => e.isUser);
      let newLeaderboard = [...s.leaderboard];
      if (!userExists) {
          newLeaderboard.push({ id: 'user', name: s.userName || 'Você', coins: s.coins, avatar: s.currentAvatar, isUser: true, streak: s.streak });
      }
      newLeaderboard = newLeaderboard.map(entry => {
          if (entry.isUser) {
              return { ...entry, name: s.userName || 'Você', coins: s.coins, streak: s.streak, avatar: s.currentAvatar };
          }
          return entry;
      });
      return { ...s, leaderboard: newLeaderboard };
  };

  const setStatsSynced = (updater: (prev: UserStats) => UserStats) => {
      setStats(prev => {
          const next = updater(prev);
          return syncWithLeaderboard(next);
      });
  };

  const initLeaderboard = (userCoins: number) => {
      const entries: LeaderboardEntry[] = [];
      entries.push({ id: 'user', name: 'Você', coins: userCoins, avatar: 'base', isUser: true, streak: 0 });
      
      const getRandomName = () => {
          if (Math.random() < 0.15) {
              return FANTASY_NAMES[Math.floor(Math.random() * FANTASY_NAMES.length)];
          }
          const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
          const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
          return `${first} ${last}`;
      }

      for(let i=0; i<50; i++) entries.push({ id: `bot_elite_${i}`, name: getRandomName(), coins: Math.floor(Math.random() * 90000) + 10000, avatar: 'dragon', isUser: false, streak: Math.floor(Math.random()*200)+50 });
      for(let i=0; i<300; i++) entries.push({ id: `bot_vet_${i}`, name: getRandomName(), coins: Math.floor(Math.random() * 9000) + 1000, avatar: 'lion', isUser: false, streak: Math.floor(Math.random()*100)+20 });
      for(let i=0; i<600; i++) entries.push({ id: `bot_reg_${i}`, name: getRandomName(), coins: Math.floor(Math.random() * 900) + 100, avatar: 'star', isUser: false, streak: Math.floor(Math.random()*30)+5 });
      for(let i=0; i<300; i++) entries.push({ id: `bot_nov_${i}`, name: getRandomName(), coins: Math.floor(Math.random() * 100), avatar: 'base', isUser: false, streak: Math.floor(Math.random()*5) });

      setStats(s => ({...s, leaderboard: entries}));
  };

  const refreshRanking = () => {
      setStatsSynced(prev => {
          const updated = prev.leaderboard.map(entry => {
              if (entry.isUser) return entry;
              if (Math.random() > 0.7) {
                  const change = Math.floor(Math.random() * 20) - 5; 
                  return { ...entry, coins: Math.max(0, entry.coins + change) };
              }
              return entry;
          });
          return { ...prev, leaderboard: updated };
      });
  };

  const checkAchievements = () => {
      let newUnlock = false;
      const updatedList = [...stats.unlockedAchievements];
      let coinsToAdd = 0;

      ACHIEVEMENTS.forEach(ach => {
          if (!updatedList.includes(ach.id) && ach.condition(stats)) {
              updatedList.push(ach.id);
              newUnlock = true;
              coinsToAdd += ach.reward;
              setEventQueue(prev => [...prev, { type: 'ACHIEVEMENT', data: ach }]);
          }
      });
      if(newUnlock) {
          setStatsSynced(s => ({...s, coins: s.coins + coinsToAdd, unlockedAchievements: updatedList}));
      }
  };

  const handleDailyClaim = (rewardAmount: number) => {
      const today = new Date().toDateString();
      setStatsSynced(s => ({
          ...s,
          coins: s.coins + rewardAmount,
          lastDailyClaim: today,
          dailyStreak: s.dailyStreak + 1,
      }));
      triggerCentralBurst();
      playCelebrationSound();
      alert(`Recebido! +${rewardAmount} moedas.`);
  };

  const handleWaterGarden = () => {
      requestAd(() => {
          const today = new Date().toISOString().split('T')[0];
          let newExp = stats.experience + 15;
          let newLevel = stats.level;
          let levelUpReward = 0;
          
          if (newExp >= 100) {
              newLevel += 1;
              newExp = newExp - 100;
              levelUpReward = newLevel * 50;
              setEventQueue(prev => [...prev, { type: 'LEVEL_UP', data: { level: newLevel, reward: levelUpReward } }]);
          } else {
              triggerCentralBurst();
              playCelebrationSound();
          }

          setStatsSynced(s => ({
              ...s,
              experience: newExp,
              level: newLevel,
              coins: s.coins + levelUpReward,
              lastWateredDate: today
          }));
          
          setIsRaining(true);
          setTimeout(() => setIsRaining(false), 3000);
          
          alert("Jardim regado com sucesso! +15 XP");
      });
  };

  const canWaterToday = () => {
      const today = new Date().toISOString().split('T')[0];
      return stats.lastWateredDate !== today;
  };

  const requestAd = (cb: () => void) => {
      adCallbackRef.current = cb;
      setPendingAdReward('GENERIC'); 
      setIsForcedAd(false);
      setShowAdModal(true);
  };

  const requestAdForGameUnlock = () => {
      setPendingAdReward('GAME_UNLOCK');
      setIsForcedAd(false);
      setShowAdModal(true);
  };

  const handleAdClosed = () => {
      setShowAdModal(false);
      setIsForcedAd(false);
      lastAdTime.current = Date.now();
      
      if (pendingAdReward === 'GAME_UNLOCK' && pendingUnlock?.game) {
          const gameId = pendingUnlock.game.id;
          setStatsSynced(s => ({ ...s, unlockedGames: [...s.unlockedGames, gameId] }));
          setCurrentScreen(pendingUnlock.game.screen);
          setPendingUnlock(null);
      } 
      else if (adCallbackRef.current) {
          adCallbackRef.current();
          adCallbackRef.current = null;
      }
      setPendingAdReward('NONE');
  };

  const handleRateApp = () => {
      window.open("https://play.google.com/store/apps", "_blank");
      setIsRatingCheck(true);
  }

  const confirmRating = () => {
      setStatsSynced(s => ({...s, coins: s.coins + 100, hasRatedApp: true}));
      setIsRatingCheck(false);
      triggerCentralBurst();
      playCelebrationSound();
      alert("Obrigado por avaliar! +100 Moedas adicionadas.");
  }

  const handleResetProgress = () => {
      localStorage.removeItem('sabiamente_stats_v8');
      setStats(INITIAL_STATS);
      setCurrentScreen(Screen.HOME);
  };

  const handleLanguageChange = (lang: Language) => {
      setStats(prev => ({...prev, language: lang}));
  };

  const getCalendarDaysDifference = (lastDateISO: string): number => {
      if (!lastDateISO) return 999;
      const now = new Date();
      const last = new Date(lastDateISO);
      
      const currentCalendarDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastCalendarDate = new Date(last.getFullYear(), last.getMonth(), last.getDate());
      
      const msPerDay = 1000 * 60 * 60 * 24;
      const diffTime = currentCalendarDate.getTime() - lastCalendarDate.getTime();
      return Math.floor(diffTime / msPerDay);
  };

  const handleDailyChallengeWin = (coinsWon: number) => {
      const today = new Date().toISOString().split('T')[0];
      setStatsSynced(prev => ({
          ...prev,
          coins: prev.coins + coinsWon,
          dailyChallengeLastCompleted: today,
          dailyChallengesWon: prev.dailyChallengesWon + 1
      }));
      setEventQueue(prev => [...prev, { type: 'ACHIEVEMENT', data: { title: 'Desafio Vencido', description: 'Você dominou a palavra do dia!', reward: coinsWon, icon: 'Calendar' } }]); 
  };

  const handleGameComplete = (score: number) => {
      const currentGame = GAMES.find(g => g.screen === currentScreen);
      const gameId = currentGame?.id || 'unknown';
      setVictoryData({ score, gameId }); 
      
      const newHighScores = { ...stats.highScores };
      if (score > (newHighScores[gameId] || 0)) {
          newHighScores[gameId] = score;
      }

      let newExp = stats.experience;
      let newLevel = stats.level;
      let levelUpReward = 0;
      let newCoins = stats.coins + score;

      if (score > 0) {
          newExp += 10;
          if (newExp >= 100) {
              newLevel += 1;
              newExp = newExp - 100;
              levelUpReward = newLevel * 50; 
              newCoins += levelUpReward;
              setEventQueue(prev => [...prev, { type: 'LEVEL_UP', data: { level: newLevel, reward: levelUpReward } }]);
          }
      }

      let newStreak = stats.streak;

      if (score > 0) {
          const daysDiff = getCalendarDaysDifference(stats.lastPlayedDate);
          if (daysDiff === 1) {
              newStreak = stats.streak + 1;
              setEventQueue(prev => [...prev, { type: 'STREAK', data: newStreak }]);
          } else if (daysDiff > 1) {
              newStreak = 1;
              setEventQueue(prev => [...prev, { type: 'STREAK', data: 1 }]);
          }
      }

      setStatsSynced(prev => {
          const updatedLeaderboard = prev.leaderboard.map(entry => {
              if (!entry.isUser) {
                  const gain = Math.floor(Math.random() * (score > 0 ? score * 1.1 : 5));
                  return { ...entry, coins: entry.coins + gain };
              }
              return entry; 
          });

          return {
            ...prev,
            coins: newCoins,
            totalGamesPlayed: prev.totalGamesPlayed + 1,
            experience: newExp,
            level: newLevel,
            highScores: newHighScores,
            lastPlayedDate: new Date().toISOString(),
            streak: newStreak, 
            leaderboard: updatedLeaderboard
          };
      });
  };

  const handleRestart = () => {
      setVictoryData(null);
      const s = currentScreen;
      setCurrentScreen(Screen.HOME);
      setTimeout(() => setCurrentScreen(s), 50);
  };

  const handleGoHome = () => {
      setVictoryData(null);
      setCurrentScreen(Screen.HOME);
  };

  const tryStartGame = (game: Minigame) => {
    const isSpecialUnlocked = stats.unlockedGames.includes(game.id);
    if (game.unlockLevel && stats.level < game.unlockLevel) {
        setPendingUnlock({ game, type: 'LEVEL' }); return;
    }
    if (game.unlockCost && !isSpecialUnlocked) {
        setPendingUnlock({ game, type: 'COINS' }); return;
    }
    if (game.unlockAd && !isSpecialUnlocked) {
        setPendingUnlock({ game, type: 'AD' }); return;
    }
    if (!stats.tutorialsSeen.includes(game.id)) {
        setActiveTutorial({ title: game.title, text: game.tutorial, gameId: game.id });
    } else {
        setCurrentScreen(game.screen);
    }
  };
  
  const handleBuyGame = () => {
      if (!pendingUnlock || !pendingUnlock.game.unlockCost) return;
      const cost = pendingUnlock.game.unlockCost;
      if (stats.coins >= cost) {
          setStatsSynced(s => ({ ...s, coins: s.coins - cost, unlockedGames: [...s.unlockedGames, pendingUnlock.game.id] }));
          const game = pendingUnlock.game;
          setPendingUnlock(null);
          if (!stats.tutorialsSeen.includes(game.id)) {
            setActiveTutorial({ title: game.title, text: game.tutorial, gameId: game.id });
          } else {
            setCurrentScreen(game.screen);
          }
      }
  };

  const finishTutorial = () => {
    if (activeTutorial) {
        setStats(prev => ({...prev, tutorialsSeen: [...prev.tutorialsSeen, activeTutorial.gameId]}));
        const game = GAMES.find(g => g.id === activeTutorial.gameId);
        if (game) setCurrentScreen(game.screen);
        setActiveTutorial(null);
    }
  };

  const buyItem = (item: StoreItem) => {
      if(item.minLevel && stats.level < item.minLevel) { alert(`Precisa Nível ${item.minLevel}!`); return; }
      if (stats.coins >= item.cost) {
          if (item.type === 'THEME') {
              setStatsSynced(s => ({ ...s, coins: s.coins - item.cost, unlockedThemes: [...s.unlockedThemes, item.value as ThemeId], currentTheme: item.value as ThemeId }));
          } else {
              setStatsSynced(s => ({ ...s, coins: s.coins - item.cost, unlockedAvatars: [...s.unlockedAvatars, item.value as AvatarId], currentAvatar: item.value as AvatarId }));
              triggerConfettiCannon();
              playMagicalSound();
          }
      } else { alert("Moedas insuficientes!"); }
  };

  const equipItem = (type: 'THEME'|'AVATAR', val: string) => {
      if (type === 'THEME') setStatsSynced(s => ({...s, currentTheme: val as ThemeId}));
      else setStatsSynced(s => ({...s, currentAvatar: val as AvatarId}));
  };

  const toggleSound = () => { setStats(prev => ({ ...prev, soundEnabled: !prev.soundEnabled })); };

  const watchAdForCoins = () => {
      requestAd(() => {
          const reward = 20;
          setStatsSynced(s => ({ ...s, coins: s.coins + reward }));
          alert(`Você ganhou ${reward} moedas!`);
      });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newName = e.target.value;
      setStatsSynced(s => ({ ...s, userName: newName }));
      setNameSaved(false);
  };

  const handleSaveName = () => {
      if (stats.userName.trim()) {
          playCelebrationSound();
          setNameSaved(true);
          setTimeout(() => setNameSaved(false), 2000);
      }
  };

  const renderGame = () => {
      const props = { onComplete: handleGameComplete, onExit: handleGoHome, onRequestAd: requestAd };
      const getScore = (id: string) => stats.highScores[id] || 0;

      switch(currentScreen) {
          case Screen.GAME_MEMORY: return <MemoryGame {...props} highScore={getScore('mem')} />;
          case Screen.GAME_TRIVIA: return <TriviaGame {...props} userCoins={stats.coins} onUseCoins={()=>{return true}} />;
          case Screen.GAME_MATH: return <MathGame {...props} highScore={getScore('math')} />;
          case Screen.GAME_SEQUENCE: return <SequenceGame {...props} />;
          case Screen.GAME_SOUND: return <SoundGame {...props} />;
          case Screen.GAME_INTRUDER: return <IntruderGame {...props} highScore={getScore('intr')} />;
          // GAME_PROVERB REMOVED
          case Screen.GAME_SCRAMBLE: return <ScrambleGame {...props} highScore={getScore('scram')} />;
          case Screen.GAME_WORD_CHAIN: return <WordChainGame {...props} highScore={getScore('chain')} />;
          case Screen.GAME_ZEN_FOCUS: return <ZenFocusGame {...props} highScore={getScore('zen')} />;
          case Screen.GAME_SUM_TARGET: return <SumTargetGame {...props} />;
          case Screen.GAME_PATTERN: return <PatternGame {...props} highScore={getScore('patt')} />;
          case Screen.GAME_ESTIMATE: return <EstimateGame {...props} highScore={getScore('est')} />;
          case Screen.GAME_ROTATION: return <RotationGame {...props} />;
          case Screen.GAME_COLOR_MATCH: return <ColorMatchGame {...props} highScore={getScore('col')} />;
          case Screen.GAME_HIDDEN: return <HiddenObjectGame {...props} highScore={getScore('hid')} />;
          case Screen.GAME_CARDS: return <CardGame {...props} highScore={getScore('cards')} />;
          case Screen.GAME_MATH_RAIN: return <MathRainGame {...props} />;
          case Screen.GAME_MOVING_HUNT: return <MovingHuntGame {...props} highScore={getScore('mov')} />;
          default: return <div className="p-8 text-center"><button onClick={handleGoHome}>Voltar</button></div>;
      }
  };

  const renderIcon = (iconName: string, size: number) => {
    const icons: any = { Link, Eye, Target, Brain, Calculator, Quote, AlertCircle, Type, Grid3X3, Music, Zap, Star, Activity, RotateCcw, Palette, Search, Box, Copy, TrendingUp, CloudRain, ListOrdered, MousePointerClick, Trophy, Book, Feather, Leaf };
    const Icon = icons[iconName] || Star;
    return <Icon size={size} />;
  }
  
  const getThemeIcon = (val: string) => {
      if(val === 'ocean') return <Cloud size={24} className="text-blue-500"/>;
      if(val === 'sunset') return <SunMedium size={24} className="text-orange-500"/>;
      if(val === 'lavender') return <Flower size={24} className="text-purple-500"/>;
      if(val === 'midnight') return <Moon size={24} className="text-slate-800"/>;
      return <Sun size={24}/>;
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${THEMES[stats.currentTheme]}`}>
      <div className="max-w-md mx-auto h-[100dvh] flex flex-col shadow-2xl relative overflow-hidden bg-brand-bg/90 backdrop-blur-md">
        
        {!isOnline && (
            <div className="absolute inset-0 z-[250] bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
                    <WifiOff size={64} className="mx-auto text-red-500 mb-6 animate-pulse" />
                    <h2 className="text-2xl font-black text-gray-800 mb-2">Sem Internet</h2>
                    <p className="text-gray-500 mb-8 text-lg leading-relaxed">O SábiaMente precisa de uma conexão ativa para gerar os desafios e salvar seu progresso.</p>
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                        <SignalHigh size={16}/> Verifique sua conexão
                    </div>
                </div>
            </div>
        )}

        {isMenuScreen(currentScreen) ? (
             <div className="px-6 pt-6 pb-2 flex justify-between items-center z-10">
                <div onClick={() => setCurrentScreen(Screen.PROFILE)} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md text-brand-primary border-2 border-white">
                        {AVATARS[stats.currentAvatar] || <User />}
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight opacity-90 truncate max-w-[150px]">Olá, {stats.userName || 'Mestre'}</h1>
                        <div className="flex items-center gap-1 text-xs font-bold opacity-60">Nível {stats.level}</div>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="bg-white/90 px-4 py-2 rounded-full font-bold shadow-sm flex items-center gap-2 border border-gray-100/50">
                        <Coins size={18} className="text-yellow-500 fill-yellow-500" /> 
                        <span className="text-gray-800">{stats.coins}</span>
                    </div>
                    <button 
                        onClick={() => setCurrentScreen(Screen.SETTINGS)}
                        className="bg-white/90 p-2 rounded-full shadow-sm border border-gray-100/50 text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        <SettingsIcon size={20} />
                    </button>
                </div>
             </div>
        ) : null}

        <div className="flex-grow overflow-y-auto relative no-scrollbar pb-24">
            {currentScreen === Screen.HOME && (
                <div className="px-6 space-y-6">
                    <div className="mt-2 relative">
                        <TreeOfMind stats={stats} onWater={handleWaterGarden} canWater={canWaterToday()} isRaining={isRaining} />
                        <div className="absolute top-0 right-0 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-orange-200 shadow-sm animate-pulse">
                            <Flame size={14} className="fill-orange-500"/>
                            {stats.streak} Dias Seguidos
                        </div>
                    </div>
                    
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-xl opacity-90 flex items-center gap-2">
                                <Grid size={20} />
                                Atividades
                            </h3>
                            <span className="text-xs font-bold opacity-50 uppercase tracking-wide">Desafie sua mente</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pb-4">
                            {GAMES.map(g => {
                                const isLevelLocked = g.unlockLevel && stats.level < g.unlockLevel;
                                const isCostLocked = g.unlockCost && !stats.unlockedGames.includes(g.id);
                                const isAdLocked = g.unlockAd && !stats.unlockedGames.includes(g.id);
                                const isLocked = isLevelLocked || isCostLocked || isAdLocked;
                                const score = stats.highScores[g.id] || 0;

                                return (
                                <button 
                                    key={g.id} 
                                    onClick={() => tryStartGame(g)} 
                                    className={`relative p-4 rounded-3xl shadow-soft border flex flex-col gap-3 transition-all bg-white border-white hover:scale-[1.02] hover:shadow-lg ${isLocked ? 'opacity-90' : ''}`}
                                >
                                    {score > 0 && !isLocked && (
                                        <div className="absolute top-2 right-2 bg-yellow-50 text-yellow-700 border border-yellow-200 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm z-10">
                                            <Trophy size={8} className="fill-yellow-500 text-yellow-500" /> {score}
                                        </div>
                                    )}
                                    {isLocked && (
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 rounded-3xl flex flex-col items-center justify-center">
                                            {isLevelLocked && (
                                                <div className="bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                                    <Lock size={12}/> Nv. {g.unlockLevel}
                                                </div>
                                            )}
                                            {isCostLocked && (
                                                <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                                                    <Lock size={12}/> 10k <Coins size={10} fill="currentColor"/>
                                                </div>
                                            )}
                                            {isAdLocked && (
                                                <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                                                    <Video size={12}/> Desbloquear
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className="flex justify-between items-start">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${g.color}`}>
                                            {renderIcon(g.icon, 24)}
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-sm leading-tight text-gray-900">{g.title}</p>
                                        <p className="text-[10px] uppercase font-bold opacity-50 mt-1">{g.category}</p>
                                    </div>
                                </button>
                            )})}
                            <div className="relative p-4 rounded-3xl shadow-soft border border-dashed border-gray-300 flex flex-col gap-3 bg-gray-50 opacity-60">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-200">
                                    <Gamepad size={24} className="text-gray-400" />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-sm leading-tight text-gray-500">Mais em Breve</p>
                                    <p className="text-[10px] uppercase font-bold opacity-50 mt-1">Novidades</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {currentScreen === Screen.PROFILE && (
                <div className="px-6 pb-28 pt-4">
                    <div className="flex flex-col items-center justify-center mb-8 animate-in zoom-in">
                        <h1 className="text-5xl font-black tracking-tighter mb-4 filter drop-shadow-sm select-none">
                            <span className="text-brand-primary">Sábia</span>
                            <span className="text-brand-secondary">Mente</span>
                        </h1>
                        <h2 className="text-2xl font-bold opacity-90 text-gray-800">Seu Perfil</h2>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-soft mb-8 border border-gray-100">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Edit3 size={14}/> Como gostaria de ser chamado?
                        </label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="text" 
                                value={stats.userName} 
                                onChange={handleNameChange} 
                                placeholder="Digite seu nome aqui"
                                className="flex-grow text-xl font-bold text-gray-800 border-b-2 border-gray-200 focus:border-brand-primary outline-none py-2 placeholder:text-gray-300 bg-transparent transition-colors"
                            />
                            <button 
                                onClick={handleSaveName}
                                className={`p-3 rounded-xl transition-all ${nameSaved ? 'bg-green-500 text-white' : 'bg-brand-primary text-white hover:bg-brand-primary/90'}`}
                            >
                                {nameSaved ? <Check size={20}/> : <Send size={20}/>}
                            </button>
                        </div>
                    </div>

                    <h3 className="text-xl font-bold mb-4 opacity-90 text-gray-800 flex items-center gap-2"><Trophy size={20} className="text-yellow-500"/> Suas Conquistas</h3>
                    <div className="space-y-4">
                        {ACHIEVEMENTS.map(ach => {
                            const isUnlocked = stats.unlockedAchievements.includes(ach.id);
                            return (
                                <div key={ach.id} className={`p-4 rounded-2xl flex items-center gap-4 border-2 transition-all ${isUnlocked ? 'bg-white border-yellow-400 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60 grayscale'}`}>
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isUnlocked ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-200 text-gray-400'}`}>
                                        {renderIcon(ach.icon, 24)}
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="font-bold text-gray-800">{ach.title}</h4>
                                        <p className="text-xs text-gray-500">{ach.description}</p>
                                        <p className="text-xs font-bold text-yellow-600 mt-1 flex items-center gap-1"><Coins size={10}/> Prêmio: {ach.reward}</p>
                                    </div>
                                    {isUnlocked ? <CheckCircle size={20} className="ml-auto text-green-500" /> : <Lock size={16} className="ml-auto text-gray-300"/>}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {currentScreen === Screen.STORE && (
                <div className="px-6 pb-28 pt-4">
                    <h2 className="text-2xl font-bold mb-6 opacity-90">Loja</h2>
                    <div className="mb-4">
                         <button onClick={watchAdForCoins} className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between font-bold text-lg hover:scale-[1.02] transition-transform">
                             <div className="flex items-center gap-3">
                                 <Video size={24} />
                                 <div className="text-left">
                                     <span className="block leading-none">Assistir Vídeo</span>
                                     <span className="text-xs opacity-90 font-normal">Ganhe +20 Moedas</span>
                                 </div>
                             </div>
                             <div className="bg-white/20 p-2 rounded-full"><Coins size={20} className="fill-white"/></div>
                         </button>
                    </div>
                    {!stats.hasRatedApp && (
                        <div className="mb-8">
                            <button onClick={handleRateApp} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between font-bold text-lg hover:scale-[1.02] transition-transform">
                                <div className="flex items-center gap-3">
                                    <Star size={24} className="fill-yellow-300 text-yellow-300"/>
                                    <div className="text-left">
                                        <span className="block leading-none">Avalie o App</span>
                                        <span className="text-xs opacity-90 font-normal">Ganhe +100 Moedas</span>
                                    </div>
                                </div>
                                <div className="bg-white/20 p-2 rounded-full"><ThumbsUp size={20} className="fill-white"/></div>
                            </button>
                        </div>
                    )}
                    <div className="space-y-8">
                        <section>
                            <h3 className="font-bold mb-3 opacity-60 text-sm uppercase tracking-wider">Avatares</h3>
                            <div className="grid grid-cols-3 gap-3">
                                <button 
                                    onClick={() => equipItem('AVATAR', 'base')} 
                                    className={`p-2 rounded-2xl border-2 flex flex-col items-center gap-2 bg-white shadow-sm transition-all ${stats.currentAvatar === 'base' ? 'border-brand-primary ring-2 ring-brand-primary/20' : 'border-transparent'}`}
                                >
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 relative">
                                        {AVATARS['base']}
                                    </div>
                                    <div className="text-center">
                                        <span className="block text-[10px] font-bold leading-tight">Normal</span>
                                        <span className="flex items-center justify-center text-[9px] gap-1 bg-green-100 px-2 py-1 rounded-lg text-green-700 font-bold mt-1">
                                            {stats.currentAvatar === 'base' ? 'Equipado' : 'Adquirido'}
                                        </span>
                                    </div>
                                </button>
                                {STORE_ITEMS.filter(i => i.type === 'AVATAR').map(item => {
                                    const unlocked = stats.unlockedAvatars.includes(item.value as AvatarId);
                                    const lockedByLevel = item.minLevel && stats.level < item.minLevel;
                                    const isActive = stats.currentAvatar === item.value;
                                    return (
                                        <button key={item.id} onClick={() => unlocked ? equipItem('AVATAR', item.value) : buyItem(item)} className={`p-2 rounded-2xl border-2 flex flex-col items-center gap-2 bg-white shadow-sm transition-all ${isActive ? 'border-brand-primary ring-2 ring-brand-primary/20' : 'border-transparent'}`}>
                                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 relative">
                                                {AVATARS[item.value as AvatarId]}
                                                {lockedByLevel && <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center"><Lock size={16} className="text-white"/></div>}
                                            </div>
                                            <div className="text-center">
                                                <span className="block text-[10px] font-bold leading-tight">{item.name}</span>
                                                {!unlocked ? (
                                                    <span className="flex items-center justify-center text-[10px] gap-1 bg-yellow-100 px-2 py-1 rounded-lg text-yellow-700 font-bold mt-1">
                                                        {lockedByLevel ? `Nv. ${item.minLevel}` : <><Coins size={10}/> {item.cost}</>}
                                                    </span>
                                                ) : (
                                                    <span className={`flex items-center justify-center text-[9px] gap-1 px-2 py-1 rounded-lg font-bold mt-1 ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                        {isActive ? 'Equipado' : 'Adquirido'}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </section>
                        <section>
                            <h3 className="font-bold mb-3 opacity-60 text-sm uppercase tracking-wider">Temas</h3>
                            <button onClick={()=>equipItem('THEME', 'garden')} className={`w-full p-4 mb-4 rounded-2xl border-2 flex items-center gap-4 bg-white ${stats.currentTheme === 'garden' ? 'border-brand-primary' : 'border-gray-100'}`}>
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"><Sun className="text-green-600"/></div>
                                <span className="font-bold text-gray-800">Padrão (Jardim)</span>
                                {stats.currentTheme === 'garden' && <Check className="ml-auto text-brand-primary"/>}
                            </button>
                            <div className="grid grid-cols-2 gap-4">
                                {['ocean', 'sunset', 'lavender', 'midnight'].map(themeId => {
                                    if (!stats.unlockedThemes.includes(themeId as ThemeId)) return null; 
                                    const isActive = stats.currentTheme === themeId;
                                    return (
                                        <button key={themeId} onClick={() => equipItem('THEME', themeId)} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 shadow-sm transition-all bg-white ${isActive ? 'border-brand-primary' : 'border-transparent'}`}>
                                            <div className="w-full h-16 rounded-xl bg-gray-50 flex items-center justify-center">
                                                {getThemeIcon(themeId)}
                                            </div>
                                            <span className="font-bold text-sm text-gray-800 capitalize">{themeId}</span>
                                            {isActive && <span className="text-xs font-bold text-brand-primary flex items-center gap-1"><Check size={12}/> Usando</span>}
                                        </button>
                                    )
                                })}
                            </div>
                        </section>
                    </div>
                </div>
            )}

            {currentScreen === Screen.RANKING && (
                <Ranking stats={stats} onExit={handleGoHome} onRefresh={refreshRanking} />
            )}

            {currentScreen === Screen.BETTING && (
                <Betting 
                    stats={stats} 
                    onUpdateStats={(newStats) => setStatsSynced(s => ({...s, ...newStats}))} 
                    onExit={handleGoHome} 
                    onRequestAd={requestAd}
                    onClaimDaily={handleDailyClaim}
                    onWinDaily={handleDailyChallengeWin}
                />
            )}
            
            {currentScreen === Screen.SETTINGS && (
                <Settings 
                    stats={stats} 
                    onToggleSound={toggleSound} 
                    onToggleNotifications={() => setStatsSynced(s => ({...s, notificationsEnabled: !s.notificationsEnabled}))}
                    onResetProgress={handleResetProgress}
                    onExit={handleGoHome}
                    onLanguageChange={handleLanguageChange}
                />
            )}

            {currentScreen !== Screen.HOME && currentScreen !== Screen.STORE && currentScreen !== Screen.PROFILE && currentScreen !== Screen.SETTINGS && currentScreen !== Screen.RANKING && currentScreen !== Screen.BETTING && renderGame()}
        </div>

        {/* BOTTOM NAV */}
        {isMenuScreen(currentScreen) && (
            <div 
                className="absolute bottom-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 flex justify-around items-center p-3 z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]"
                style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
            >
                <button onClick={() => setCurrentScreen(Screen.HOME)} className={`flex flex-col items-center gap-1 transition-colors ${currentScreen === Screen.HOME ? 'text-brand-primary scale-105' : 'text-gray-400 hover:text-gray-600'}`}>
                    <Home size={24} fill={currentScreen === Screen.HOME ? "currentColor" : "none"} className={currentScreen === Screen.HOME ? 'fill-current' : ''} />
                    <span className="text-[10px] font-bold">Início</span>
                </button>
                <button onClick={() => setCurrentScreen(Screen.STORE)} className={`flex flex-col items-center gap-1 transition-colors ${currentScreen === Screen.STORE ? 'text-blue-600 scale-105' : 'text-gray-400 hover:text-gray-600'}`}>
                    <Store size={24} fill={currentScreen === Screen.STORE ? "currentColor" : "none"} />
                    <span className="text-[10px] font-bold">Loja</span>
                </button>
                <button onClick={() => setCurrentScreen(Screen.BETTING)} className={`flex flex-col items-center gap-1 transition-colors ${currentScreen === Screen.BETTING ? 'text-purple-600 scale-105' : 'text-gray-400 hover:text-gray-600'}`}>
                    <div className="relative">
                        <Clover size={24} fill={currentScreen === Screen.BETTING ? "currentColor" : "none"}/>
                        {stats.dailyStreak > 0 && currentScreen !== Screen.BETTING && <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
                    </div>
                    <span className="text-[10px] font-bold">Sorte</span>
                </button>
                <button onClick={() => setCurrentScreen(Screen.RANKING)} className={`flex flex-col items-center gap-1 transition-colors ${currentScreen === Screen.RANKING ? 'text-yellow-600 scale-105' : 'text-gray-400 hover:text-gray-600'}`}>
                    <Trophy size={24} fill={currentScreen === Screen.RANKING ? "currentColor" : "none"}/>
                    <span className="text-[10px] font-bold">Rank</span>
                </button>
                <button onClick={() => setCurrentScreen(Screen.PROFILE)} className={`flex flex-col items-center gap-1 transition-colors ${currentScreen === Screen.PROFILE ? 'text-orange-600 scale-105' : 'text-gray-400 hover:text-gray-600'}`}>
                    <User size={24} fill={currentScreen === Screen.PROFILE ? "currentColor" : "none"}/>
                    <span className="text-[10px] font-bold">Perfil</span>
                </button>
            </div>
        )}

        {/* ... Modals (kept identical) ... */}
        {pendingUnlock && (
             <div className="absolute inset-0 z-[70] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
                 <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative">
                     <div className="mb-6 flex justify-center">
                         {pendingUnlock.type === 'LEVEL' && <div className="bg-gray-100 p-4 rounded-full"><Lock size={48} className="text-gray-400"/></div>}
                         {pendingUnlock.type === 'COINS' && <div className="bg-yellow-100 p-4 rounded-full"><Coins size={48} className="text-yellow-500 fill-yellow-500"/></div>}
                         {pendingUnlock.type === 'AD' && <div className="bg-blue-100 p-4 rounded-full"><Video size={48} className="text-blue-500"/></div>}
                     </div>
                     <h2 className="text-2xl font-black text-gray-800 mb-2">Jogo Bloqueado</h2>
                     {pendingUnlock.type === 'LEVEL' && (
                         <div className="space-y-4">
                             <p className="text-gray-600">Este jogo requer mais experiência.</p>
                             <div className="bg-gray-100 p-4 rounded-2xl font-bold text-gray-800">Nível Necessário: <span className="text-brand-primary">{pendingUnlock.game.unlockLevel}</span></div>
                             <p className="text-xs text-gray-400">Continue jogando para subir de nível.</p>
                             <button onClick={() => setPendingUnlock(null)} className="w-full py-3 bg-gray-200 text-gray-700 font-bold rounded-xl mt-4">Entendi</button>
                         </div>
                     )}
                     {pendingUnlock.type === 'COINS' && (
                         <div className="space-y-4">
                             <p className="text-gray-600">Desbloqueie este jogo permanentemente.</p>
                             <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-200">
                                 <p className="text-xs text-gray-400 uppercase font-bold mb-1">Custo</p>
                                 <div className="text-2xl font-black text-yellow-600 flex items-center justify-center gap-2">{pendingUnlock.game.unlockCost} <Coins fill="currentColor"/></div>
                             </div>
                             <p className="text-xs text-gray-500">Seu saldo: {stats.coins}</p>
                             <div className="flex gap-2 mt-4">
                                 <button onClick={() => setPendingUnlock(null)} className="flex-1 py-3 bg-gray-100 text-gray-500 font-bold rounded-xl">Cancelar</button>
                                 <button onClick={handleBuyGame} disabled={stats.coins < (pendingUnlock.game.unlockCost || 99999)} className="flex-1 py-3 bg-green-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:bg-gray-300">Comprar</button>
                             </div>
                         </div>
                     )}
                     {pendingUnlock.type === 'AD' && (
                         <div className="space-y-4">
                             <p className="text-gray-600">Assista a um vídeo curto para liberar este jogo agora!</p>
                             <button onClick={requestAdForGameUnlock} className="w-full py-4 bg-blue-600 text-white font-bold text-lg rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"><Play fill="currentColor"/> Assistir Vídeo</button>
                             <button onClick={() => setPendingUnlock(null)} className="text-sm text-gray-400 font-bold mt-2">Cancelar</button>
                         </div>
                     )}
                 </div>
             </div>
        )}

        {streakPopupValue !== null && (
            <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
                <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden animate-in zoom-in spin-in-1 duration-500">
                    <div className="absolute inset-0 bg-orange-400/20 z-0 animate-pulse"></div>
                    <Flame size={96} className="mx-auto text-orange-500 mb-4 animate-bounce relative z-10 fill-orange-500" />
                    <h2 className="text-4xl font-black text-gray-800 mb-2 relative z-10">{streakPopupValue} DIAS!</h2>
                    <p className="text-xl font-bold text-orange-600 mb-6 relative z-10">Sequência Incrível!</p>
                    <p className="text-gray-500 mb-8 relative z-10 text-sm">Sua disciplina está fortalecendo sua mente a cada dia.</p>
                    <button onClick={() => setStreakPopupValue(null)} className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-xl hover:scale-[1.02] transition-transform relative z-10 shadow-xl cursor-pointer">Continuar</button>
                </div>
            </div>
        )}

        {isRatingCheck && (
            <div className="absolute inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
                    <Star size={48} className="mx-auto text-yellow-400 fill-yellow-400 mb-4 animate-spin-slow" />
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Verificando Avaliação...</h3>
                    <p className="text-gray-600 mb-8">Você avaliou o app na loja? Só clique abaixo se já tiver concluído.</p>
                    <div className="flex flex-col gap-3">
                        <button onClick={confirmRating} className="w-full bg-green-500 text-white py-3 rounded-xl font-bold shadow-md hover:bg-green-600">Sim, Já Avaliei!</button>
                        <button onClick={() => setIsRatingCheck(false)} className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl font-bold hover:bg-gray-200">Ainda não</button>
                    </div>
                </div>
            </div>
        )}

        {levelUpData && (
            <div className="absolute inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-500">
                <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
                    <div className="absolute inset-0 bg-green-400/20 z-0 animate-pulse"></div>
                    <ArrowUpCircle size={80} className="mx-auto text-green-500 mb-4 animate-bounce relative z-10" />
                    <h2 className="text-3xl font-black text-gray-800 mb-2 relative z-10">Nível {levelUpData.level}!</h2>
                    <p className="text-gray-600 mb-6 relative z-10 text-lg">Seu Jardim da Mente cresceu.</p>
                    <div className="bg-yellow-50 p-6 rounded-2xl border-2 border-yellow-300 relative z-10 shadow-lg transform rotate-1">
                        <p className="text-sm font-bold text-yellow-700 uppercase tracking-wide">Recompensa</p>
                        <p className="text-4xl font-black text-yellow-500 flex items-center justify-center gap-2 mt-2">+{levelUpData.reward} <Coins size={32} className="fill-yellow-500"/></p>
                    </div>
                    <button onClick={() => setLevelUpData(null)} className="mt-8 w-full bg-green-600 text-white py-4 rounded-xl font-bold text-xl hover:scale-[1.02] transition-transform relative z-10 shadow-xl cursor-pointer">Continuar</button>
                </div>
            </div>
        )}

        {unlockedAchievement && (
            <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 pointer-events-auto">
                     <div className="absolute inset-0 bg-yellow-400/10 z-0"></div>
                     <Sparkles size={64} className="mx-auto text-yellow-500 mb-4 animate-bounce relative z-10" />
                     <h2 className="text-2xl font-black text-gray-800 mb-2 relative z-10">Conquista Desbloqueada!</h2>
                     <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mb-6 relative z-10">
                         <h3 className="font-bold text-lg text-gray-800">{unlockedAchievement.title}</h3>
                         <p className="text-gray-600 text-sm">{unlockedAchievement.description}</p>
                     </div>
                     <p className="text-xl font-bold text-green-600 flex items-center justify-center gap-2 relative z-10"><Coins className="fill-current"/> +{unlockedAchievement.reward}</p>
                     <button onClick={() => setUnlockedAchievement(null)} className="mt-4 w-full bg-gray-900 text-white py-3 rounded-xl font-bold cursor-pointer relative z-20 hover:scale-105 active:scale-95 transition-transform shadow-lg">Incrível</button>
                </div>
            </div>
        )}

        {victoryData && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
                <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
                    {victoryData.score > 0 ? (
                        <>
                            <Sparkles size={64} className="mx-auto text-yellow-400 mb-4 animate-bounce" />
                            <h2 className="text-3xl font-black text-gray-800 mb-2">Excelente!</h2>
                            <p className="text-gray-500 mb-8 text-lg">Você ganhou <span className="text-yellow-500 font-bold">+{victoryData.score} Moedas</span></p>
                        </>
                    ) : (
                        <>
                            <XCircle size={64} className="mx-auto text-red-400 mb-4" />
                            <h2 className="text-3xl font-black text-gray-800 mb-2">Que Pena!</h2>
                            <p className="text-gray-500 mb-8 text-lg">Você perdeu as moedas desta rodada.</p>
                        </>
                    )}
                    <div className="space-y-3">
                        <button onClick={handleRestart} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"><RotateCcw /> Jogar Novamente</button>
                        <button onClick={handleGoHome} className="w-full bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-colors">Voltar ao Jardim</button>
                    </div>
                </div>
            </div>
        )}

        {activeTutorial && (
            <div className="absolute inset-0 z-50 bg-white/95 flex flex-col justify-center p-10 text-center">
                <div className="mb-6 mx-auto bg-brand-primary/10 p-6 rounded-full text-brand-primary"><Info size={48}/></div>
                <h1 className="text-3xl font-black mb-4 text-gray-900">{activeTutorial.title}</h1>
                <p className="text-xl text-gray-600 mb-12 leading-relaxed">{activeTutorial.text}</p>
                <button onClick={finishTutorial} className="w-full bg-gray-900 text-white py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-transform">Entendi <Check /></button>
            </div>
        )}

        {showAdModal && (
            <div className="absolute inset-0 z-[200] bg-gray-900 flex flex-col items-center justify-center text-white p-8 animate-in fade-in">
                <div className="w-full h-56 bg-gray-800 rounded-3xl mb-8 flex items-center justify-center animate-pulse border border-gray-700"><Video size={48} className="opacity-50"/></div>
                <h3 className="text-2xl font-bold mb-2">{isForcedAd ? "Apoio ao SábiaMente" : "Anúncio do Patrocinador"}</h3>
                <p className="opacity-60 mb-12 text-center max-w-xs leading-tight">{isForcedAd ? "Este anúncio ajuda a manter o aplicativo gratuito para todos." : "Obrigado por apoiar o SábiaMente"}</p>
                <button onClick={handleAdClosed} className="bg-white text-black px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform">Fechar X</button>
            </div>
        )}
      </div>
    </div>
  );
}
