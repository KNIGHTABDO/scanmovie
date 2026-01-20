"use client";

/**
 * User Data Context
 * =================
 * React context and hook for managing user data state.
 * Supports both:
 * - localStorage (offline/anonymous users)
 * - Firebase Firestore (authenticated users with cloud sync)
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Movie } from '~/services/tmdb';
import { trackAction } from '~/services/achievements';
import { useAuth } from '~/contexts/AuthContext';
import {
  getUserData,
  migrateLocalStorageToFirestore,
  addToWatchlistCloud,
  removeFromWatchlistCloud,
  addToFavoritesCloud,
  removeFromFavoritesCloud,
  setRatingCloud,
  removeRatingCloud,
  createCollectionCloud,
  addToCollectionCloud,
  removeFromCollectionCloud,
  deleteCollectionCloud,
  type UserMovieData,
} from '~/services/firestoreUserData';
import {
  type SavedMovie,
  type MovieCollection,
  type UserRating,
  type ViewHistoryItem,
  type ComparisonSlot,
  type MoodEntry,
  getAllUserData,
  addToWatchlist as storeAddToWatchlist,
  removeFromWatchlist as storeRemoveFromWatchlist,
  isInWatchlist as storeIsInWatchlist,
  addToFavorites as storeAddToFavorites,
  removeFromFavorites as storeRemoveFromFavorites,
  isFavorite as storeIsFavorite,
  toggleFavorite as storeToggleFavorite,
  createCollection as storeCreateCollection,
  deleteCollection as storeDeleteCollection,
  addToCollection as storeAddToCollection,
  removeFromCollection as storeRemoveFromCollection,
  isInCollection as storeIsInCollection,
  getUserRating as storeGetUserRating,
  setUserRating as storeSetUserRating,
  removeUserRating as storeRemoveUserRating,
  addToViewHistory as storeAddToViewHistory,
  clearViewHistory as storeClearViewHistory,
  addToComparison as storeAddToComparison,
  removeFromComparison as storeRemoveFromComparison,
  clearComparison as storeClearComparison,
  isInComparison as storeIsInComparison,
  setMood as storeSetMood,
  getStats,
  resetAllUserData as storeResetAllUserData,
} from '~/services/userDataStore';

interface UserDataContextType {
  // Data
  watchlist: SavedMovie[];
  favorites: SavedMovie[];
  collections: MovieCollection[];
  ratings: UserRating[];
  viewHistory: ViewHistoryItem[];
  comparison: ComparisonSlot[];
  lastMood: MoodEntry | null;
  stats: ReturnType<typeof getStats>;
  
  // Cloud sync status
  isSyncing: boolean;
  isCloudEnabled: boolean;
  lastSyncTime: Date | null;
  
  // Watchlist
  addToWatchlist: (movie: Movie) => void;
  removeFromWatchlist: (movieId: number) => void;
  isInWatchlist: (movieId: number) => boolean;
  
  // Favorites
  addToFavorites: (movie: Movie) => void;
  removeFromFavorites: (movieId: number) => void;
  isFavorite: (movieId: number) => boolean;
  toggleFavorite: (movie: Movie) => boolean;
  
  // Collections
  createCollection: (name: string, emoji: string, description?: string) => MovieCollection;
  deleteCollection: (collectionId: string) => void;
  addToCollection: (collectionId: string, movieId: number) => void;
  removeFromCollection: (collectionId: string, movieId: number) => void;
  isInCollection: (collectionId: string, movieId: number) => boolean;
  
  // Ratings
  getUserRating: (movieId: number) => number | null;
  setUserRating: (movieId: number, rating: number) => void;
  removeUserRating: (movieId: number) => void;
  
  // History
  addToViewHistory: (movieId: number) => void;
  clearViewHistory: () => void;
  
  // Comparison
  addToComparison: (movieId: number, slot: number) => void;
  removeFromComparison: (slot: number) => void;
  clearComparison: () => void;
  isInComparison: (movieId: number) => number;
  
  // Mood
  setMood: (mood: string, genreIds: number[]) => void;
  
  // Utils
  refreshData: () => void;
  resetAllData: () => void;
  syncToCloud: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | null>(null);

export function UserDataProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState(() => getAllUserData());
  const [cloudData, setCloudData] = useState<UserMovieData | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [hasMigrated, setHasMigrated] = useState(false);
  const [stats, setStats] = useState(() => getStats());

  // Refresh data from localStorage
  const refreshData = useCallback(() => {
    setData(getAllUserData());
    setStats(getStats());
  }, []);

  // Fetch cloud data when user signs in
  const fetchCloudData = useCallback(async () => {
    if (!user) return;
    
    setIsSyncing(true);
    try {
      const cloudUserData = await getUserData(user.uid);
      if (cloudUserData) {
        setCloudData(cloudUserData);
        setLastSyncTime(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch cloud data:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  // Migrate localStorage to Firebase on first sign-in
  useEffect(() => {
    if (user && !hasMigrated) {
      const migrate = async () => {
        setIsSyncing(true);
        try {
          await migrateLocalStorageToFirestore(user.uid);
          await fetchCloudData();
          setHasMigrated(true);
        } catch (error) {
          console.error('Migration failed:', error);
        } finally {
          setIsSyncing(false);
        }
      };
      migrate();
    }
  }, [user, hasMigrated, fetchCloudData]);

  // Sync to cloud manually
  const syncToCloud = useCallback(async () => {
    if (!user) return;
    
    setIsSyncing(true);
    try {
      await migrateLocalStorageToFirestore(user.uid);
      await fetchCloudData();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [user, fetchCloudData]);

  // Listen for storage events from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'scanmovie_user_data') {
        refreshData();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshData]);

  // Watchlist - with cloud sync
  const addToWatchlist = useCallback(async (movie: Movie) => {
    storeAddToWatchlist(movie);
    trackAction('add_to_watchlist', { genre_ids: movie.genre_ids });
    refreshData();
    
    // Sync to cloud if authenticated
    if (user) {
      try {
        await addToWatchlistCloud(user.uid, movie);
      } catch (error) {
        console.error('Failed to sync watchlist to cloud:', error);
      }
    }
  }, [refreshData, user]);

  const removeFromWatchlist = useCallback(async (movieId: number) => {
    storeRemoveFromWatchlist(movieId);
    refreshData();
    
    if (user) {
      try {
        await removeFromWatchlistCloud(user.uid, movieId);
      } catch (error) {
        console.error('Failed to sync watchlist removal to cloud:', error);
      }
    }
  }, [refreshData, user]);

  const isInWatchlist = useCallback((movieId: number) => {
    return storeIsInWatchlist(movieId);
  }, []);

  // Favorites - with cloud sync
  const addToFavorites = useCallback(async (movie: Movie) => {
    storeAddToFavorites(movie);
    trackAction('add_to_favorites');
    refreshData();
    
    if (user) {
      try {
        await addToFavoritesCloud(user.uid, movie);
      } catch (error) {
        console.error('Failed to sync favorites to cloud:', error);
      }
    }
  }, [refreshData, user]);

  const removeFromFavorites = useCallback(async (movieId: number) => {
    storeRemoveFromFavorites(movieId);
    refreshData();
    
    if (user) {
      try {
        await removeFromFavoritesCloud(user.uid, movieId);
      } catch (error) {
        console.error('Failed to sync favorites removal to cloud:', error);
      }
    }
  }, [refreshData, user]);

  const isFavorite = useCallback((movieId: number) => {
    return storeIsFavorite(movieId);
  }, []);

  const toggleFavorite = useCallback((movie: Movie) => {
    const result = storeToggleFavorite(movie);
    refreshData();
    
    // Sync to cloud
    if (user) {
      if (result) {
        addToFavoritesCloud(user.uid, movie).catch(console.error);
      } else {
        removeFromFavoritesCloud(user.uid, movie.id).catch(console.error);
      }
    }
    
    return result;
  }, [refreshData, user]);

  // Collections - with cloud sync
  const createCollection = useCallback(async (name: string, emoji: string, description?: string) => {
    const collection = storeCreateCollection(name, emoji, description || '');
    trackAction('create_collection');
    refreshData();
    
    if (user) {
      try {
        await createCollectionCloud(user.uid, name, emoji);
      } catch (error) {
        console.error('Failed to sync collection to cloud:', error);
      }
    }
    
    return collection;
  }, [refreshData, user]);

  const deleteCollection = useCallback(async (collectionId: string) => {
    storeDeleteCollection(collectionId);
    refreshData();
    
    if (user) {
      try {
        await deleteCollectionCloud(user.uid, collectionId);
      } catch (error) {
        console.error('Failed to sync collection deletion to cloud:', error);
      }
    }
  }, [refreshData, user]);

  const addToCollection = useCallback(async (collectionId: string, movieId: number) => {
    storeAddToCollection(collectionId, movieId);
    refreshData();
    
    if (user) {
      try {
        await addToCollectionCloud(user.uid, collectionId, movieId);
      } catch (error) {
        console.error('Failed to sync collection add to cloud:', error);
      }
    }
  }, [refreshData, user]);

  const removeFromCollection = useCallback(async (collectionId: string, movieId: number) => {
    storeRemoveFromCollection(collectionId, movieId);
    refreshData();
    
    if (user) {
      try {
        await removeFromCollectionCloud(user.uid, collectionId, movieId);
      } catch (error) {
        console.error('Failed to sync collection removal to cloud:', error);
      }
    }
  }, [refreshData, user]);

  const isInCollection = useCallback((collectionId: string, movieId: number) => {
    return storeIsInCollection(collectionId, movieId);
  }, []);

  // Ratings - with cloud sync
  const getUserRating = useCallback((movieId: number) => {
    return storeGetUserRating(movieId);
  }, []);

  const setUserRating = useCallback(async (movieId: number, rating: number) => {
    storeSetUserRating(movieId, rating);
    trackAction('rate_movie');
    refreshData();
    
    if (user) {
      try {
        await setRatingCloud(user.uid, movieId, rating);
      } catch (error) {
        console.error('Failed to sync rating to cloud:', error);
      }
    }
  }, [refreshData, user]);

  const removeUserRating = useCallback(async (movieId: number) => {
    storeRemoveUserRating(movieId);
    refreshData();
    
    if (user) {
      try {
        await removeRatingCloud(user.uid, movieId);
      } catch (error) {
        console.error('Failed to sync rating removal to cloud:', error);
      }
    }
  }, [refreshData, user]);

  // History
  const addToViewHistory = useCallback((movieId: number) => {
    storeAddToViewHistory(movieId);
    refreshData();
  }, [refreshData]);

  const clearViewHistory = useCallback(() => {
    storeClearViewHistory();
    refreshData();
  }, [refreshData]);

  // Comparison
  const addToComparison = useCallback((movieId: number, slot: number) => {
    storeAddToComparison(movieId, slot);
    refreshData();
  }, [refreshData]);

  const removeFromComparison = useCallback((slot: number) => {
    storeRemoveFromComparison(slot);
    refreshData();
  }, [refreshData]);

  const clearComparison = useCallback(() => {
    storeClearComparison();
    refreshData();
  }, [refreshData]);

  const isInComparison = useCallback((movieId: number) => {
    return storeIsInComparison(movieId);
  }, []);

  // Mood
  const setMood = useCallback((mood: string, genreIds: number[]) => {
    storeSetMood(mood, genreIds);
    refreshData();
  }, [refreshData]);

  // Reset
  const resetAllData = useCallback(() => {
    storeResetAllUserData();
    refreshData();
  }, [refreshData]);

  const value: UserDataContextType = {
    watchlist: data.watchlist,
    favorites: data.favorites,
    collections: data.collections,
    ratings: data.ratings,
    viewHistory: data.viewHistory,
    comparison: data.comparison,
    lastMood: data.lastMood,
    stats,
    // Cloud sync status
    isSyncing,
    isCloudEnabled: isAuthenticated,
    lastSyncTime,
    // Methods
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    createCollection,
    deleteCollection,
    addToCollection,
    removeFromCollection,
    isInCollection,
    getUserRating,
    setUserRating,
    removeUserRating,
    addToViewHistory,
    clearViewHistory,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    setMood,
    refreshData,
    resetAllData,
    syncToCloud,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
}

export default UserDataContext;
