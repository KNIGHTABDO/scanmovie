/**
 * Firestore User Data Service
 * ===========================
 * Cloud sync for all user movie data:
 * - Watchlist
 * - Favorites
 * - Ratings
 * - Collections
 * - Achievements
 * - Watch History
 * 
 * Replaces localStorage when user is authenticated.
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection,
  query,
  getDocs,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  arrayUnion,
  arrayRemove,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Movie } from './tmdb';

// Types for user data
export interface UserMovieData {
  watchlist: Movie[];
  favorites: Movie[];
  ratings: Record<number, number>;
  collections: MovieCollection[];
  watchHistory: WatchHistoryItem[];
  achievements: AchievementData;
  lastSyncedAt: any;
}

export interface MovieCollection {
  id: string;
  name: string;
  emoji: string;
  movieIds: number[];
  createdAt: string;
}

export interface WatchHistoryItem {
  movieId: number;
  watchedAt: string;
  rating?: number;
}

export interface AchievementData {
  unlockedAchievements: string[];
  achievementProgress: Record<string, number>;
  totalPoints: number;
  level: number;
  streakDays: number;
  lastActiveDate: string;
}

const isBrowser = typeof window !== 'undefined';

/**
 * Get user data document reference
 */
function getUserDataRef(uid: string) {
  return doc(db, 'userData', uid);
}

/**
 * Initialize user data in Firestore (empty state)
 */
export async function initializeUserData(uid: string): Promise<UserMovieData> {
  if (!isBrowser) throw new Error('Not in browser');
  
  const defaultData: UserMovieData = {
    watchlist: [],
    favorites: [],
    ratings: {},
    collections: [],
    watchHistory: [],
    achievements: {
      unlockedAchievements: [],
      achievementProgress: {},
      totalPoints: 0,
      level: 1,
      streakDays: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
    },
    lastSyncedAt: serverTimestamp(),
  };
  
  const userDataRef = getUserDataRef(uid);
  await setDoc(userDataRef, defaultData);
  
  return defaultData;
}

/**
 * Get all user data from Firestore
 */
export async function getUserData(uid: string): Promise<UserMovieData | null> {
  if (!isBrowser) return null;
  
  try {
    const userDataRef = getUserDataRef(uid);
    const snapshot = await getDoc(userDataRef);
    
    if (snapshot.exists()) {
      return snapshot.data() as UserMovieData;
    }
    
    // Initialize if doesn't exist
    return await initializeUserData(uid);
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}

/**
 * Migrate localStorage data to Firestore
 * Called on first sign-in to sync existing data
 */
export async function migrateLocalStorageToFirestore(uid: string): Promise<void> {
  if (!isBrowser) return;
  
  console.log('Starting localStorage migration to Firestore...');
  
  try {
    // Get existing localStorage data
    const watchlistStr = localStorage.getItem('scanmovie_watchlist');
    const favoritesStr = localStorage.getItem('scanmovie_favorites');
    const ratingsStr = localStorage.getItem('scanmovie_ratings');
    const collectionsStr = localStorage.getItem('scanmovie_collections');
    const achievementsStr = localStorage.getItem('scanmovie_achievements');
    const progressStr = localStorage.getItem('scanmovie_achievement_progress');
    const streakStr = localStorage.getItem('scanmovie_streak');
    
    const watchlist: Movie[] = watchlistStr ? JSON.parse(watchlistStr) : [];
    const favorites: Movie[] = favoritesStr ? JSON.parse(favoritesStr) : [];
    const ratings: Record<number, number> = ratingsStr ? JSON.parse(ratingsStr) : {};
    const collections: MovieCollection[] = collectionsStr ? JSON.parse(collectionsStr) : [];
    
    // Parse achievements - stored as UserAchievement[] objects { achievementId, unlockedAt, progress }
    const parsedAchievements = achievementsStr ? JSON.parse(achievementsStr) : [];
    const unlockedAchievements: string[] = parsedAchievements.map((a: { achievementId: string }) => a.achievementId);
    
    // Get achievement stats (the correct key is scanmovie_achievement_stats, not scanmovie_achievement_progress)
    const statsStr = localStorage.getItem('scanmovie_achievement_stats');
    const achievementStats = statsStr ? JSON.parse(statsStr) : {};
    const achievementProgress: Record<string, number> = progressStr ? JSON.parse(progressStr) : {};
    const streakData = { count: achievementStats.currentStreak || 0, lastDate: achievementStats.lastVisitDate || '' };
    
    // Check if there's any data to migrate
    const hasData = watchlist.length > 0 || 
                    favorites.length > 0 || 
                    Object.keys(ratings).length > 0 || 
                    collections.length > 0 ||
                    unlockedAchievements.length > 0;
    
    if (!hasData) {
      console.log('No localStorage data to migrate');
      return;
    }
    
    // Get existing Firestore data
    const existingData = await getUserData(uid);
    
    // Merge data (localStorage takes precedence for new data, but don't overwrite cloud)
    const mergedWatchlist = mergeMovieArrays(existingData?.watchlist || [], watchlist);
    const mergedFavorites = mergeMovieArrays(existingData?.favorites || [], favorites);
    const mergedRatings = { ...(existingData?.ratings || {}), ...ratings };
    const mergedCollections = mergeCollections(existingData?.collections || [], collections);
    const mergedAchievements = [...new Set([
      ...(existingData?.achievements?.unlockedAchievements || []),
      ...unlockedAchievements
    ])];
    
    // Merge achievement progress - use achievementStats from localStorage
    const mergedProgress = { 
      ...(existingData?.achievements?.achievementProgress || {}),
      watchlistCount: Math.max(
        existingData?.achievements?.achievementProgress?.watchlistCount || 0,
        achievementStats.watchlistCount || 0
      ),
      favoritesCount: Math.max(
        existingData?.achievements?.achievementProgress?.favoritesCount || 0,
        achievementStats.favoritesCount || 0
      ),
      ratingsCount: Math.max(
        existingData?.achievements?.achievementProgress?.ratingsCount || 0,
        achievementStats.ratingsCount || 0
      ),
      collectionsCount: Math.max(
        existingData?.achievements?.achievementProgress?.collectionsCount || 0,
        achievementStats.collectionsCount || 0
      ),
      partiesCount: Math.max(
        existingData?.achievements?.achievementProgress?.partiesCount || 0,
        achievementStats.partiesCount || 0
      ),
      aiSearchCount: Math.max(
        existingData?.achievements?.achievementProgress?.aiSearchCount || 0,
        achievementStats.aiSearchCount || 0
      ),
      genresExplored: [...new Set([
        ...(existingData?.achievements?.achievementProgress?.genresExplored || []),
        ...(achievementStats.genresExplored || [])
      ])],
      moodsUsed: [...new Set([
        ...(existingData?.achievements?.achievementProgress?.moodsUsed || []),
        ...(achievementStats.moodsUsed || [])
      ])],
    };
    
    // Calculate total points from actual achievements
    const achievementPointsMap: Record<string, number> = {
      'first-movie': 10, 'movie-explorer-10': 25, 'movie-explorer-50': 100, 'movie-explorer-100': 250,
      'first-favorite': 10, 'favorites-10': 50, 'favorites-25': 100,
      'first-rating': 10, 'critic-10': 25, 'critic-50': 100, 'critic-100': 250,
      'first-collection': 15, 'collections-5': 50, 'collections-10': 100,
      'first-party': 20, 'parties-5': 75,
      'ai-first': 15, 'ai-power-user': 75,
      'first-compare': 10, 'genre-explorer': 30, 'genre-master': 75,
      'streak-3': 25, 'streak-7': 75, 'streak-30': 200,
      'night-owl': 25, 'early-bird': 25, 'mood-master': 50, 'random-winner': 30,
    };
    const totalPoints = mergedAchievements.reduce((sum, id) => sum + (achievementPointsMap[id] || 10), 0);
    const level = Math.floor(totalPoints / 150) + 1;
    
    // Update Firestore with merged data
    const userDataRef = getUserDataRef(uid);
    await setDoc(userDataRef, {
      watchlist: mergedWatchlist,
      favorites: mergedFavorites,
      ratings: mergedRatings,
      collections: mergedCollections,
      watchHistory: existingData?.watchHistory || [],
      achievements: {
        unlockedAchievements: mergedAchievements,
        achievementProgress: mergedProgress,
        totalPoints,
        level,
        streakDays: streakData.count,
        lastActiveDate: streakData.lastDate || new Date().toISOString().split('T')[0],
      },
      lastSyncedAt: serverTimestamp(),
    }, { merge: true });
    
    console.log('Migration complete! Data synced to cloud.');
    console.log(`Migrated: ${mergedWatchlist.length} watchlist, ${mergedFavorites.length} favorites, ${Object.keys(mergedRatings).length} ratings`);
    
    // Also sync cloud data BACK to localStorage (for new devices)
    await syncCloudToLocalStorage(uid);
    
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}

/**
 * Sync cloud data TO localStorage
 * Called when signing in on a new device to download cloud data
 */
export async function syncCloudToLocalStorage(uid: string): Promise<void> {
  if (!isBrowser) return;
  
  console.log('Syncing cloud data to localStorage...');
  
  try {
    const cloudData = await getUserData(uid);
    if (!cloudData) return;
    
    // Update localStorage with cloud data
    if (cloudData.watchlist?.length > 0) {
      localStorage.setItem('scanmovie_watchlist', JSON.stringify(cloudData.watchlist));
    }
    
    if (cloudData.favorites?.length > 0) {
      localStorage.setItem('scanmovie_favorites', JSON.stringify(cloudData.favorites));
    }
    
    if (cloudData.ratings && Object.keys(cloudData.ratings).length > 0) {
      localStorage.setItem('scanmovie_ratings', JSON.stringify(cloudData.ratings));
    }
    
    if (cloudData.collections?.length > 0) {
      localStorage.setItem('scanmovie_collections', JSON.stringify(cloudData.collections));
    }
    
    // Sync achievements
    if (cloudData.achievements) {
      if (cloudData.achievements.unlockedAchievements?.length > 0) {
        // Convert to UserAchievement format
        const userAchievements = cloudData.achievements.unlockedAchievements.map(id => ({
          achievementId: id,
          unlockedAt: Date.now(),
          progress: 0,
        }));
        localStorage.setItem('scanmovie_achievements', JSON.stringify(userAchievements));
      }
      
      if (cloudData.achievements.achievementProgress) {
        // Convert achievement progress to stats format
        const stats = {
          watchlistCount: cloudData.watchlist?.length || 0,
          favoritesCount: cloudData.favorites?.length || 0,
          ratingsCount: Object.keys(cloudData.ratings || {}).length,
          collectionsCount: cloudData.collections?.length || 0,
          partiesCount: cloudData.achievements.achievementProgress.partiesCount || 0,
          aiSearchCount: cloudData.achievements.achievementProgress.aiSearchCount || 0,
          compareCount: cloudData.achievements.achievementProgress.compareCount || 0,
          randomPickerCount: cloudData.achievements.achievementProgress.randomPickerCount || 0,
          genresExplored: cloudData.achievements.achievementProgress.genresExplored || [],
          moodsUsed: cloudData.achievements.achievementProgress.moodsUsed || [],
          currentStreak: cloudData.achievements.streakDays || 0,
          lastVisitDate: cloudData.achievements.lastActiveDate || '',
        };
        localStorage.setItem('scanmovie_achievement_stats', JSON.stringify(stats));
      }
    }
    
    console.log('Cloud data synced to localStorage!');
    
  } catch (error) {
    console.error('Error syncing cloud to localStorage:', error);
  }
}

/**
 * Helper: Merge movie arrays (deduplicate by ID)
 */
function mergeMovieArrays(existing: Movie[], newMovies: Movie[]): Movie[] {
  const map = new Map<number, Movie>();
  existing.forEach(m => map.set(m.id, m));
  newMovies.forEach(m => map.set(m.id, m));
  return Array.from(map.values());
}

/**
 * Helper: Merge collections (deduplicate by ID)
 */
function mergeCollections(existing: MovieCollection[], newCollections: MovieCollection[]): MovieCollection[] {
  const map = new Map<string, MovieCollection>();
  existing.forEach(c => map.set(c.id, c));
  newCollections.forEach(c => map.set(c.id, c));
  return Array.from(map.values());
}

// ============================================
// WATCHLIST OPERATIONS
// ============================================

export async function addToWatchlistCloud(uid: string, movie: Movie): Promise<void> {
  if (!isBrowser) return;
  
  const userDataRef = getUserDataRef(uid);
  const snapshot = await getDoc(userDataRef);
  
  if (snapshot.exists()) {
    const data = snapshot.data() as UserMovieData;
    const exists = data.watchlist.some(m => m.id === movie.id);
    
    if (!exists) {
      await updateDoc(userDataRef, {
        watchlist: arrayUnion(movie),
        lastSyncedAt: serverTimestamp(),
      });
    }
  }
}

export async function removeFromWatchlistCloud(uid: string, movieId: number): Promise<void> {
  if (!isBrowser) return;
  
  const userDataRef = getUserDataRef(uid);
  const snapshot = await getDoc(userDataRef);
  
  if (snapshot.exists()) {
    const data = snapshot.data() as UserMovieData;
    const updatedWatchlist = data.watchlist.filter(m => m.id !== movieId);
    
    await updateDoc(userDataRef, {
      watchlist: updatedWatchlist,
      lastSyncedAt: serverTimestamp(),
    });
  }
}

// ============================================
// FAVORITES OPERATIONS
// ============================================

export async function addToFavoritesCloud(uid: string, movie: Movie): Promise<void> {
  if (!isBrowser) return;
  
  const userDataRef = getUserDataRef(uid);
  const snapshot = await getDoc(userDataRef);
  
  if (snapshot.exists()) {
    const data = snapshot.data() as UserMovieData;
    const exists = data.favorites.some(m => m.id === movie.id);
    
    if (!exists) {
      await updateDoc(userDataRef, {
        favorites: arrayUnion(movie),
        lastSyncedAt: serverTimestamp(),
      });
    }
  }
}

export async function removeFromFavoritesCloud(uid: string, movieId: number): Promise<void> {
  if (!isBrowser) return;
  
  const userDataRef = getUserDataRef(uid);
  const snapshot = await getDoc(userDataRef);
  
  if (snapshot.exists()) {
    const data = snapshot.data() as UserMovieData;
    const updatedFavorites = data.favorites.filter(m => m.id !== movieId);
    
    await updateDoc(userDataRef, {
      favorites: updatedFavorites,
      lastSyncedAt: serverTimestamp(),
    });
  }
}

// ============================================
// RATINGS OPERATIONS
// ============================================

export async function setRatingCloud(uid: string, movieId: number, rating: number): Promise<void> {
  if (!isBrowser) return;
  
  const userDataRef = getUserDataRef(uid);
  
  await updateDoc(userDataRef, {
    [`ratings.${movieId}`]: rating,
    lastSyncedAt: serverTimestamp(),
  });
}

export async function removeRatingCloud(uid: string, movieId: number): Promise<void> {
  if (!isBrowser) return;
  
  const userDataRef = getUserDataRef(uid);
  const snapshot = await getDoc(userDataRef);
  
  if (snapshot.exists()) {
    const data = snapshot.data() as UserMovieData;
    const { [movieId]: _, ...remainingRatings } = data.ratings;
    
    await updateDoc(userDataRef, {
      ratings: remainingRatings,
      lastSyncedAt: serverTimestamp(),
    });
  }
}

// ============================================
// COLLECTIONS OPERATIONS
// ============================================

export async function createCollectionCloud(
  uid: string, 
  name: string, 
  emoji: string
): Promise<MovieCollection> {
  if (!isBrowser) throw new Error('Not in browser');
  
  const newCollection: MovieCollection = {
    id: `col_${Date.now()}`,
    name,
    emoji,
    movieIds: [],
    createdAt: new Date().toISOString(),
  };
  
  const userDataRef = getUserDataRef(uid);
  await updateDoc(userDataRef, {
    collections: arrayUnion(newCollection),
    lastSyncedAt: serverTimestamp(),
  });
  
  return newCollection;
}

export async function addToCollectionCloud(
  uid: string, 
  collectionId: string, 
  movieId: number
): Promise<void> {
  if (!isBrowser) return;
  
  const userDataRef = getUserDataRef(uid);
  const snapshot = await getDoc(userDataRef);
  
  if (snapshot.exists()) {
    const data = snapshot.data() as UserMovieData;
    const updatedCollections = data.collections.map(c => {
      if (c.id === collectionId && !c.movieIds.includes(movieId)) {
        return { ...c, movieIds: [...c.movieIds, movieId] };
      }
      return c;
    });
    
    await updateDoc(userDataRef, {
      collections: updatedCollections,
      lastSyncedAt: serverTimestamp(),
    });
  }
}

export async function removeFromCollectionCloud(
  uid: string, 
  collectionId: string, 
  movieId: number
): Promise<void> {
  if (!isBrowser) return;
  
  const userDataRef = getUserDataRef(uid);
  const snapshot = await getDoc(userDataRef);
  
  if (snapshot.exists()) {
    const data = snapshot.data() as UserMovieData;
    const updatedCollections = data.collections.map(c => {
      if (c.id === collectionId) {
        return { ...c, movieIds: c.movieIds.filter(id => id !== movieId) };
      }
      return c;
    });
    
    await updateDoc(userDataRef, {
      collections: updatedCollections,
      lastSyncedAt: serverTimestamp(),
    });
  }
}

export async function deleteCollectionCloud(uid: string, collectionId: string): Promise<void> {
  if (!isBrowser) return;
  
  const userDataRef = getUserDataRef(uid);
  const snapshot = await getDoc(userDataRef);
  
  if (snapshot.exists()) {
    const data = snapshot.data() as UserMovieData;
    const updatedCollections = data.collections.filter(c => c.id !== collectionId);
    
    await updateDoc(userDataRef, {
      collections: updatedCollections,
      lastSyncedAt: serverTimestamp(),
    });
  }
}

// ============================================
// ACHIEVEMENTS OPERATIONS
// ============================================

export async function updateAchievementsCloud(
  uid: string, 
  achievements: AchievementData
): Promise<void> {
  if (!isBrowser) return;
  
  const userDataRef = getUserDataRef(uid);
  await updateDoc(userDataRef, {
    achievements,
    lastSyncedAt: serverTimestamp(),
  });
}

export async function unlockAchievementCloud(uid: string, achievementId: string): Promise<void> {
  if (!isBrowser) return;
  
  const userDataRef = getUserDataRef(uid);
  const snapshot = await getDoc(userDataRef);
  
  if (snapshot.exists()) {
    const data = snapshot.data() as UserMovieData;
    
    if (!data.achievements.unlockedAchievements.includes(achievementId)) {
      await updateDoc(userDataRef, {
        'achievements.unlockedAchievements': arrayUnion(achievementId),
        'achievements.totalPoints': increment(100), // Base points per achievement
        lastSyncedAt: serverTimestamp(),
      });
    }
  }
}

/**
 * Sync achievement stats from localStorage to cloud
 */
export async function syncAchievementStatsToCloud(uid: string): Promise<void> {
  if (!isBrowser) return;
  
  try {
    // Get localStorage achievement data
    const achievementsStr = localStorage.getItem('scanmovie_achievements');
    const statsStr = localStorage.getItem('scanmovie_achievement_stats');
    
    const unlockedAchievements: { achievementId: string }[] = achievementsStr ? JSON.parse(achievementsStr) : [];
    const stats = statsStr ? JSON.parse(statsStr) : {};
    
    // Calculate points based on actual achievements
    const achievementPoints: Record<string, number> = {
      'first-movie': 10, 'movie-explorer-10': 25, 'movie-explorer-50': 100, 'movie-explorer-100': 250,
      'first-favorite': 10, 'favorites-10': 50, 'favorites-25': 100,
      'first-rating': 10, 'critic-10': 25, 'critic-50': 100, 'critic-100': 250,
      'first-collection': 15, 'collections-5': 50, 'collections-10': 100,
      'first-party': 20, 'parties-5': 75,
      'ai-first': 15, 'ai-power-user': 75,
      'first-compare': 10, 'genre-explorer': 30, 'genre-master': 75,
      'streak-3': 25, 'streak-7': 75, 'streak-30': 200,
      'night-owl': 25, 'early-bird': 25, 'mood-master': 50, 'random-winner': 30,
    };
    
    const unlockedIds = unlockedAchievements.map(a => a.achievementId);
    const totalPoints = unlockedIds.reduce((sum, id) => sum + (achievementPoints[id] || 10), 0);
    const level = Math.floor(totalPoints / 150) + 1;
    
    const userDataRef = getUserDataRef(uid);
    await updateDoc(userDataRef, {
      'achievements.unlockedAchievements': unlockedIds,
      'achievements.totalPoints': totalPoints,
      'achievements.level': level,
      'achievements.achievementProgress': {
        watchlistCount: stats.watchlistCount || 0,
        favoritesCount: stats.favoritesCount || 0,
        ratingsCount: stats.ratingsCount || 0,
        collectionsCount: stats.collectionsCount || 0,
        partiesCount: stats.partiesCount || 0,
        aiSearchCount: stats.aiSearchCount || 0,
        compareCount: stats.compareCount || 0,
        randomPickerCount: stats.randomPickerCount || 0,
        genresExplored: stats.genresExplored || [],
        moodsUsed: stats.moodsUsed || [],
      },
      'achievements.streakDays': stats.currentStreak || 0,
      'achievements.lastActiveDate': stats.lastVisitDate || new Date().toISOString().split('T')[0],
      lastSyncedAt: serverTimestamp(),
    });
    
    console.log('Achievement stats synced to cloud:', { totalPoints, level, unlockedCount: unlockedIds.length });
    
  } catch (error) {
    console.error('Error syncing achievement stats to cloud:', error);
  }
}

// ============================================
// SYNC STATUS
// ============================================

export async function getLastSyncTime(uid: string): Promise<Date | null> {
  if (!isBrowser) return null;
  
  const userDataRef = getUserDataRef(uid);
  const snapshot = await getDoc(userDataRef);
  
  if (snapshot.exists()) {
    const data = snapshot.data();
    if (data.lastSyncedAt) {
      return data.lastSyncedAt.toDate();
    }
  }
  
  return null;
}
