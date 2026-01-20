"use client";

/**
 * User Data Context
 * =================
 * React context and hook for managing user data state.
 * Provides reactive updates when localStorage changes.
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Movie } from '~/services/tmdb';
import { trackAction } from '~/services/achievements';
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
}

const UserDataContext = createContext<UserDataContextType | null>(null);

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(() => getAllUserData());
  const [stats, setStats] = useState(() => getStats());

  // Refresh data from localStorage
  const refreshData = useCallback(() => {
    setData(getAllUserData());
    setStats(getStats());
  }, []);

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

  // Watchlist
  const addToWatchlist = useCallback((movie: Movie) => {
    storeAddToWatchlist(movie);
    trackAction('add_to_watchlist', { genre_ids: movie.genre_ids });
    refreshData();
  }, [refreshData]);

  const removeFromWatchlist = useCallback((movieId: number) => {
    storeRemoveFromWatchlist(movieId);
    refreshData();
  }, [refreshData]);

  const isInWatchlist = useCallback((movieId: number) => {
    return storeIsInWatchlist(movieId);
  }, []);

  // Favorites
  const addToFavorites = useCallback((movie: Movie) => {
    storeAddToFavorites(movie);
    trackAction('add_to_favorites');
    refreshData();
  }, [refreshData]);

  const removeFromFavorites = useCallback((movieId: number) => {
    storeRemoveFromFavorites(movieId);
    refreshData();
  }, [refreshData]);

  const isFavorite = useCallback((movieId: number) => {
    return storeIsFavorite(movieId);
  }, []);

  const toggleFavorite = useCallback((movie: Movie) => {
    const result = storeToggleFavorite(movie);
    refreshData();
    return result;
  }, [refreshData]);

  // Collections
  const createCollection = useCallback((name: string, emoji: string, description?: string) => {
    const collection = storeCreateCollection(name, emoji, description || '');
    trackAction('create_collection');
    refreshData();
    return collection;
  }, [refreshData]);

  const deleteCollection = useCallback((collectionId: string) => {
    storeDeleteCollection(collectionId);
    refreshData();
  }, [refreshData]);

  const addToCollection = useCallback((collectionId: string, movieId: number) => {
    storeAddToCollection(collectionId, movieId);
    refreshData();
  }, [refreshData]);

  const removeFromCollection = useCallback((collectionId: string, movieId: number) => {
    storeRemoveFromCollection(collectionId, movieId);
    refreshData();
  }, [refreshData]);

  const isInCollection = useCallback((collectionId: string, movieId: number) => {
    return storeIsInCollection(collectionId, movieId);
  }, []);

  // Ratings
  const getUserRating = useCallback((movieId: number) => {
    return storeGetUserRating(movieId);
  }, []);

  const setUserRating = useCallback((movieId: number, rating: number) => {
    storeSetUserRating(movieId, rating);
    trackAction('rate_movie');
    refreshData();
  }, [refreshData]);

  const removeUserRating = useCallback((movieId: number) => {
    storeRemoveUserRating(movieId);
    refreshData();
  }, [refreshData]);

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
