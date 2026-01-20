/**
 * Achievement System
 * ==================
 * Gamification layer for ScanMovie.
 * Tracks user progress and unlocks achievements.
 */

// Achievement definitions
export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: 'discovery' | 'collection' | 'social' | 'streak' | 'special';
  requirement: number;
  points: number;
  secret?: boolean;
}

export interface UserAchievement {
  achievementId: string;
  unlockedAt: number;
  progress: number;
}

export interface AchievementProgress {
  achievement: Achievement;
  current: number;
  unlocked: boolean;
  unlockedAt?: number;
  percentage: number;
}

// All available achievements
export const ACHIEVEMENTS: Achievement[] = [
  // Discovery achievements
  {
    id: 'first-movie',
    title: 'First Steps',
    description: 'Add your first movie to watchlist',
    emoji: '🎬',
    category: 'discovery',
    requirement: 1,
    points: 10,
  },
  {
    id: 'movie-explorer-10',
    title: 'Movie Explorer',
    description: 'Add 10 movies to your watchlist',
    emoji: '🔍',
    category: 'discovery',
    requirement: 10,
    points: 25,
  },
  {
    id: 'movie-explorer-50',
    title: 'Movie Buff',
    description: 'Add 50 movies to your watchlist',
    emoji: '🎞️',
    category: 'discovery',
    requirement: 50,
    points: 100,
  },
  {
    id: 'movie-explorer-100',
    title: 'Cinephile',
    description: 'Add 100 movies to your watchlist',
    emoji: '🏆',
    category: 'discovery',
    requirement: 100,
    points: 250,
  },
  
  // Favorites achievements
  {
    id: 'first-favorite',
    title: 'First Love',
    description: 'Add your first favorite movie',
    emoji: '❤️',
    category: 'collection',
    requirement: 1,
    points: 10,
  },
  {
    id: 'favorites-10',
    title: 'Movie Lover',
    description: 'Have 10 favorite movies',
    emoji: '💕',
    category: 'collection',
    requirement: 10,
    points: 50,
  },
  {
    id: 'favorites-25',
    title: 'True Fan',
    description: 'Have 25 favorite movies',
    emoji: '💖',
    category: 'collection',
    requirement: 25,
    points: 100,
  },
  
  // Rating achievements
  {
    id: 'first-rating',
    title: 'Critic Debut',
    description: 'Rate your first movie',
    emoji: '⭐',
    category: 'collection',
    requirement: 1,
    points: 10,
  },
  {
    id: 'critic-10',
    title: 'Rising Critic',
    description: 'Rate 10 movies',
    emoji: '✨',
    category: 'collection',
    requirement: 10,
    points: 30,
  },
  {
    id: 'critic-50',
    title: 'Professional Critic',
    description: 'Rate 50 movies',
    emoji: '🌟',
    category: 'collection',
    requirement: 50,
    points: 100,
  },
  {
    id: 'critic-100',
    title: 'Master Critic',
    description: 'Rate 100 movies',
    emoji: '👑',
    category: 'collection',
    requirement: 100,
    points: 250,
  },
  
  // Collection achievements
  {
    id: 'first-collection',
    title: 'Curator',
    description: 'Create your first collection',
    emoji: '📂',
    category: 'collection',
    requirement: 1,
    points: 15,
  },
  {
    id: 'collections-5',
    title: 'Organizer',
    description: 'Create 5 collections',
    emoji: '🗄️',
    category: 'collection',
    requirement: 5,
    points: 50,
  },
  {
    id: 'collections-10',
    title: 'Master Curator',
    description: 'Create 10 collections',
    emoji: '📚',
    category: 'collection',
    requirement: 10,
    points: 100,
  },
  
  // Social achievements
  {
    id: 'first-party',
    title: 'Party Starter',
    description: 'Create your first watch party',
    emoji: '🎉',
    category: 'social',
    requirement: 1,
    points: 20,
  },
  {
    id: 'parties-5',
    title: 'Social Butterfly',
    description: 'Create 5 watch parties',
    emoji: '🦋',
    category: 'social',
    requirement: 5,
    points: 75,
  },
  
  // Genre exploration achievements
  {
    id: 'genre-explorer',
    title: 'Genre Explorer',
    description: 'Add movies from 5 different genres',
    emoji: '🎭',
    category: 'discovery',
    requirement: 5,
    points: 40,
  },
  {
    id: 'genre-master',
    title: 'Genre Master',
    description: 'Add movies from all 10+ genres',
    emoji: '🌈',
    category: 'discovery',
    requirement: 10,
    points: 100,
  },
  
  // AI interaction achievements
  {
    id: 'ai-first',
    title: 'AI Explorer',
    description: 'Use AI search for the first time',
    emoji: '🤖',
    category: 'discovery',
    requirement: 1,
    points: 15,
  },
  {
    id: 'ai-power-user',
    title: 'AI Power User',
    description: 'Use AI search 25 times',
    emoji: '🧠',
    category: 'discovery',
    requirement: 25,
    points: 75,
  },
  
  // Compare achievements
  {
    id: 'first-compare',
    title: 'Decision Maker',
    description: 'Compare movies for the first time',
    emoji: '⚖️',
    category: 'discovery',
    requirement: 1,
    points: 10,
  },
  
  // Streak achievements
  {
    id: 'streak-3',
    title: 'Consistent Viewer',
    description: 'Use the app 3 days in a row',
    emoji: '🔥',
    category: 'streak',
    requirement: 3,
    points: 30,
  },
  {
    id: 'streak-7',
    title: 'Weekly Regular',
    description: 'Use the app 7 days in a row',
    emoji: '💪',
    category: 'streak',
    requirement: 7,
    points: 75,
  },
  {
    id: 'streak-30',
    title: 'Movie Addict',
    description: 'Use the app 30 days in a row',
    emoji: '🎖️',
    category: 'streak',
    requirement: 30,
    points: 200,
  },
  
  // Special/secret achievements
  {
    id: 'night-owl',
    title: 'Night Owl',
    description: 'Browse movies after midnight',
    emoji: '🦉',
    category: 'special',
    requirement: 1,
    points: 15,
    secret: true,
  },
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Browse movies before 6 AM',
    emoji: '🌅',
    category: 'special',
    requirement: 1,
    points: 15,
    secret: true,
  },
  {
    id: 'marathon-ready',
    title: 'Marathon Ready',
    description: 'Add 5+ movies to a single collection',
    emoji: '📺',
    category: 'special',
    requirement: 5,
    points: 25,
  },
  {
    id: 'mood-master',
    title: 'Mood Master',
    description: 'Use all mood filters in Discover',
    emoji: '🎨',
    category: 'special',
    requirement: 8,
    points: 50,
  },
  {
    id: 'random-winner',
    title: 'Feeling Lucky',
    description: 'Use random movie picker 10 times',
    emoji: '🎲',
    category: 'special',
    requirement: 10,
    points: 30,
  },
];

// Storage key
const ACHIEVEMENTS_STORAGE_KEY = 'scanmovie_achievements';
const STATS_STORAGE_KEY = 'scanmovie_achievement_stats';

interface AchievementStats {
  watchlistCount: number;
  favoritesCount: number;
  ratingsCount: number;
  collectionsCount: number;
  partiesCount: number;
  aiSearchCount: number;
  compareCount: number;
  randomPickerCount: number;
  genresExplored: number[];
  moodsUsed: string[];
  currentStreak: number;
  lastVisitDate: string;
}

const defaultStats: AchievementStats = {
  watchlistCount: 0,
  favoritesCount: 0,
  ratingsCount: 0,
  collectionsCount: 0,
  partiesCount: 0,
  aiSearchCount: 0,
  compareCount: 0,
  randomPickerCount: 0,
  genresExplored: [],
  moodsUsed: [],
  currentStreak: 0,
  lastVisitDate: '',
};

// Get unlocked achievements
export function getUnlockedAchievements(): UserAchievement[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Get achievement stats
export function getAchievementStats(): AchievementStats {
  if (typeof window === 'undefined') return defaultStats;
  try {
    const stored = localStorage.getItem(STATS_STORAGE_KEY);
    return stored ? { ...defaultStats, ...JSON.parse(stored) } : defaultStats;
  } catch {
    return defaultStats;
  }
}

// Save achievement stats
function saveAchievementStats(stats: AchievementStats): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
}

// Save unlocked achievements
function saveUnlockedAchievements(achievements: UserAchievement[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(achievements));
}

// Check and unlock an achievement
export function checkAndUnlockAchievement(
  achievementId: string, 
  currentProgress: number
): { unlocked: boolean; achievement?: Achievement } {
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!achievement) return { unlocked: false };

  const unlocked = getUnlockedAchievements();
  const alreadyUnlocked = unlocked.some(u => u.achievementId === achievementId);
  
  if (alreadyUnlocked) return { unlocked: false };
  
  if (currentProgress >= achievement.requirement) {
    const newAchievement: UserAchievement = {
      achievementId,
      unlockedAt: Date.now(),
      progress: currentProgress,
    };
    saveUnlockedAchievements([...unlocked, newAchievement]);
    return { unlocked: true, achievement };
  }
  
  return { unlocked: false };
}

// Track specific actions
export function trackAction(action: string, data?: unknown): Achievement | null {
  const stats = getAchievementStats();
  let unlockedAchievement: Achievement | null = null;

  switch (action) {
    case 'add_to_watchlist': {
      stats.watchlistCount++;
      const result1 = checkAndUnlockAchievement('first-movie', stats.watchlistCount);
      const result10 = checkAndUnlockAchievement('movie-explorer-10', stats.watchlistCount);
      const result50 = checkAndUnlockAchievement('movie-explorer-50', stats.watchlistCount);
      const result100 = checkAndUnlockAchievement('movie-explorer-100', stats.watchlistCount);
      unlockedAchievement = result1.achievement || result10.achievement || result50.achievement || result100.achievement || null;
      
      // Track genre
      if (data && typeof data === 'object' && 'genre_ids' in data) {
        const genreIds = (data as { genre_ids?: number[] }).genre_ids || [];
        genreIds.forEach(g => {
          if (!stats.genresExplored.includes(g)) {
            stats.genresExplored.push(g);
          }
        });
        const genreResult5 = checkAndUnlockAchievement('genre-explorer', stats.genresExplored.length);
        const genreResult10 = checkAndUnlockAchievement('genre-master', stats.genresExplored.length);
        if (!unlockedAchievement) {
          unlockedAchievement = genreResult5.achievement || genreResult10.achievement || null;
        }
      }
      break;
    }
    
    case 'add_to_favorites': {
      stats.favoritesCount++;
      const result1 = checkAndUnlockAchievement('first-favorite', stats.favoritesCount);
      const result10 = checkAndUnlockAchievement('favorites-10', stats.favoritesCount);
      const result25 = checkAndUnlockAchievement('favorites-25', stats.favoritesCount);
      unlockedAchievement = result1.achievement || result10.achievement || result25.achievement || null;
      break;
    }
    
    case 'rate_movie': {
      stats.ratingsCount++;
      const result1 = checkAndUnlockAchievement('first-rating', stats.ratingsCount);
      const result10 = checkAndUnlockAchievement('critic-10', stats.ratingsCount);
      const result50 = checkAndUnlockAchievement('critic-50', stats.ratingsCount);
      const result100 = checkAndUnlockAchievement('critic-100', stats.ratingsCount);
      unlockedAchievement = result1.achievement || result10.achievement || result50.achievement || result100.achievement || null;
      break;
    }
    
    case 'create_collection': {
      stats.collectionsCount++;
      const result1 = checkAndUnlockAchievement('first-collection', stats.collectionsCount);
      const result5 = checkAndUnlockAchievement('collections-5', stats.collectionsCount);
      const result10 = checkAndUnlockAchievement('collections-10', stats.collectionsCount);
      unlockedAchievement = result1.achievement || result5.achievement || result10.achievement || null;
      break;
    }
    
    case 'create_party': {
      stats.partiesCount++;
      const result1 = checkAndUnlockAchievement('first-party', stats.partiesCount);
      const result5 = checkAndUnlockAchievement('parties-5', stats.partiesCount);
      unlockedAchievement = result1.achievement || result5.achievement || null;
      break;
    }
    
    case 'ai_search': {
      stats.aiSearchCount++;
      const result1 = checkAndUnlockAchievement('ai-first', stats.aiSearchCount);
      const result25 = checkAndUnlockAchievement('ai-power-user', stats.aiSearchCount);
      unlockedAchievement = result1.achievement || result25.achievement || null;
      break;
    }
    
    case 'compare_movies': {
      stats.compareCount++;
      const result = checkAndUnlockAchievement('first-compare', stats.compareCount);
      unlockedAchievement = result.achievement || null;
      break;
    }
    
    case 'random_picker': {
      stats.randomPickerCount++;
      const result = checkAndUnlockAchievement('random-winner', stats.randomPickerCount);
      unlockedAchievement = result.achievement || null;
      break;
    }
    
    case 'use_mood': {
      if (data && typeof data === 'string' && !stats.moodsUsed.includes(data)) {
        stats.moodsUsed.push(data);
        const result = checkAndUnlockAchievement('mood-master', stats.moodsUsed.length);
        unlockedAchievement = result.achievement || null;
      }
      break;
    }
    
    case 'app_visit': {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      if (stats.lastVisitDate === yesterday) {
        stats.currentStreak++;
      } else if (stats.lastVisitDate !== today) {
        stats.currentStreak = 1;
      }
      stats.lastVisitDate = today;
      
      const result3 = checkAndUnlockAchievement('streak-3', stats.currentStreak);
      const result7 = checkAndUnlockAchievement('streak-7', stats.currentStreak);
      const result30 = checkAndUnlockAchievement('streak-30', stats.currentStreak);
      unlockedAchievement = result3.achievement || result7.achievement || result30.achievement || null;
      
      // Check time-based achievements
      const hour = new Date().getHours();
      if (hour >= 0 && hour < 5) {
        const nightResult = checkAndUnlockAchievement('night-owl', 1);
        if (!unlockedAchievement) unlockedAchievement = nightResult.achievement || null;
      }
      if (hour >= 5 && hour < 6) {
        const earlyResult = checkAndUnlockAchievement('early-bird', 1);
        if (!unlockedAchievement) unlockedAchievement = earlyResult.achievement || null;
      }
      break;
    }
  }

  saveAchievementStats(stats);
  return unlockedAchievement;
}

// Get all achievement progress
export function getAllAchievementProgress(): AchievementProgress[] {
  const stats = getAchievementStats();
  const unlocked = getUnlockedAchievements();
  
  return ACHIEVEMENTS.map(achievement => {
    const userAchievement = unlocked.find(u => u.achievementId === achievement.id);
    let current = 0;
    
    // Calculate current progress based on achievement type
    if (achievement.id.includes('movie') && achievement.id !== 'first-movie') {
      current = stats.watchlistCount;
    } else if (achievement.id === 'first-movie') {
      current = Math.min(stats.watchlistCount, 1);
    } else if (achievement.id.includes('favorite')) {
      current = stats.favoritesCount;
    } else if (achievement.id.includes('critic') || achievement.id.includes('rating')) {
      current = stats.ratingsCount;
    } else if (achievement.id.includes('collection')) {
      current = stats.collectionsCount;
    } else if (achievement.id.includes('party') || achievement.id.includes('parties')) {
      current = stats.partiesCount;
    } else if (achievement.id.includes('ai')) {
      current = stats.aiSearchCount;
    } else if (achievement.id.includes('compare')) {
      current = stats.compareCount;
    } else if (achievement.id.includes('genre')) {
      current = stats.genresExplored.length;
    } else if (achievement.id.includes('mood')) {
      current = stats.moodsUsed.length;
    } else if (achievement.id.includes('streak')) {
      current = stats.currentStreak;
    } else if (achievement.id.includes('random')) {
      current = stats.randomPickerCount;
    } else if (userAchievement) {
      current = achievement.requirement;
    }
    
    return {
      achievement,
      current,
      unlocked: !!userAchievement,
      unlockedAt: userAchievement?.unlockedAt,
      percentage: Math.min((current / achievement.requirement) * 100, 100),
    };
  });
}

// Get total points
export function getTotalPoints(): number {
  const unlocked = getUnlockedAchievements();
  return unlocked.reduce((total, ua) => {
    const achievement = ACHIEVEMENTS.find(a => a.id === ua.achievementId);
    return total + (achievement?.points || 0);
  }, 0);
}

// Get user level based on points
export function getUserLevel(): { level: number; title: string; emoji: string; nextLevel: number; progress: number } {
  const points = getTotalPoints();
  
  const levels = [
    { threshold: 0, title: 'Newcomer', emoji: '🌱' },
    { threshold: 50, title: 'Movie Fan', emoji: '🎬' },
    { threshold: 150, title: 'Film Enthusiast', emoji: '🎞️' },
    { threshold: 300, title: 'Cinephile', emoji: '🎭' },
    { threshold: 500, title: 'Movie Expert', emoji: '🌟' },
    { threshold: 750, title: 'Film Scholar', emoji: '📚' },
    { threshold: 1000, title: 'Cinema Master', emoji: '👑' },
    { threshold: 1500, title: 'Movie Legend', emoji: '🏆' },
  ];
  
  let currentLevel = 0;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (points >= levels[i].threshold) {
      currentLevel = i;
      break;
    }
  }
  
  const current = levels[currentLevel];
  const next = levels[currentLevel + 1] || levels[levels.length - 1];
  const progress = currentLevel === levels.length - 1 
    ? 100 
    : ((points - current.threshold) / (next.threshold - current.threshold)) * 100;
  
  return {
    level: currentLevel + 1,
    title: current.title,
    emoji: current.emoji,
    nextLevel: next.threshold,
    progress,
  };
}
