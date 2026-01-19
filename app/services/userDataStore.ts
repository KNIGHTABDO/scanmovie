/**
 * User Data Store Service
 * =======================
 * Manages all user data in localStorage without requiring authentication.
 * Handles: Watchlist, Favorites, Collections, History, Ratings, Comparisons
 */

import type { Movie } from './tmdb';

// ====== Type Definitions ======

export interface SavedMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  overview: string;
  savedAt: number; // timestamp
}

export interface UserRating {
  movieId: number;
  rating: number; // 1-10
  ratedAt: number;
}

export interface MovieCollection {
  id: string;
  name: string;
  emoji: string;
  description: string;
  movieIds: number[];
  createdAt: number;
  updatedAt: number;
}

export interface ViewHistoryItem {
  movieId: number;
  viewedAt: number;
  duration?: number; // seconds spent on page
}

export interface ComparisonSlot {
  movieId: number | null;
}

export interface MoodEntry {
  mood: string;
  genreIds: number[];
  selectedAt: number;
}

export interface UserData {
  watchlist: SavedMovie[];
  favorites: SavedMovie[];
  collections: MovieCollection[];
  ratings: UserRating[];
  viewHistory: ViewHistoryItem[];
  comparison: ComparisonSlot[];
  lastMood: MoodEntry | null;
  stats: {
    totalMoviesDiscovered: number;
    totalTimeSpent: number; // seconds
    favoriteGenres: Record<number, number>; // genreId -> count
  };
}

// ====== LocalStorage Keys ======
const STORAGE_KEY = 'scanmovie_user_data';
const STORAGE_VERSION = 1;

// ====== Default Data ======
const defaultUserData: UserData = {
  watchlist: [],
  favorites: [],
  collections: [
    {
      id: 'date-night',
      name: 'Date Night',
      emoji: '💕',
      description: 'Perfect movies for a romantic evening',
      movieIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'feel-good',
      name: 'Feel Good',
      emoji: '😊',
      description: 'Movies to lift your spirits',
      movieIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'movie-marathon',
      name: 'Movie Marathon',
      emoji: '🍿',
      description: 'For when you have all day',
      movieIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ],
  ratings: [],
  viewHistory: [],
  comparison: [{ movieId: null }, { movieId: null }, { movieId: null }],
  lastMood: null,
  stats: {
    totalMoviesDiscovered: 0,
    totalTimeSpent: 0,
    favoriteGenres: {},
  },
};

// ====== Storage Helpers ======

function getStoredData(): UserData {
  if (typeof window === 'undefined') return defaultUserData;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...defaultUserData };
    
    const parsed = JSON.parse(stored);
    // Merge with defaults to ensure all fields exist
    return {
      ...defaultUserData,
      ...parsed,
      stats: { ...defaultUserData.stats, ...parsed.stats },
      collections: parsed.collections?.length > 0 ? parsed.collections : defaultUserData.collections,
      comparison: parsed.comparison?.length === 3 ? parsed.comparison : defaultUserData.comparison,
    };
  } catch (error) {
    console.error('Failed to parse user data:', error);
    return { ...defaultUserData };
  }
}

function saveData(data: UserData): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, _version: STORAGE_VERSION }));
  } catch (error) {
    console.error('Failed to save user data:', error);
  }
}

// ====== Movie Conversion Helper ======
export function movieToSavedMovie(movie: Movie): SavedMovie {
  return {
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    vote_average: movie.vote_average,
    release_date: movie.release_date,
    overview: movie.overview,
    savedAt: Date.now(),
  };
}

// ====== Watchlist Functions ======

export function getWatchlist(): SavedMovie[] {
  return getStoredData().watchlist;
}

export function addToWatchlist(movie: Movie): void {
  const data = getStoredData();
  if (data.watchlist.some(m => m.id === movie.id)) return;
  
  data.watchlist.unshift(movieToSavedMovie(movie));
  saveData(data);
}

export function removeFromWatchlist(movieId: number): void {
  const data = getStoredData();
  data.watchlist = data.watchlist.filter(m => m.id !== movieId);
  saveData(data);
}

export function isInWatchlist(movieId: number): boolean {
  return getStoredData().watchlist.some(m => m.id === movieId);
}

// ====== Favorites Functions ======

export function getFavorites(): SavedMovie[] {
  return getStoredData().favorites;
}

export function addToFavorites(movie: Movie): void {
  const data = getStoredData();
  if (data.favorites.some(m => m.id === movie.id)) return;
  
  data.favorites.unshift(movieToSavedMovie(movie));
  saveData(data);
}

export function removeFromFavorites(movieId: number): void {
  const data = getStoredData();
  data.favorites = data.favorites.filter(m => m.id !== movieId);
  saveData(data);
}

export function isFavorite(movieId: number): boolean {
  return getStoredData().favorites.some(m => m.id === movieId);
}

export function toggleFavorite(movie: Movie): boolean {
  if (isFavorite(movie.id)) {
    removeFromFavorites(movie.id);
    return false;
  } else {
    addToFavorites(movie);
    return true;
  }
}

// ====== Collections Functions ======

export function getCollections(): MovieCollection[] {
  return getStoredData().collections;
}

export function createCollection(name: string, emoji: string, description: string = ''): MovieCollection {
  const data = getStoredData();
  const newCollection: MovieCollection = {
    id: `collection-${Date.now()}`,
    name,
    emoji,
    description,
    movieIds: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  data.collections.push(newCollection);
  saveData(data);
  return newCollection;
}

export function deleteCollection(collectionId: string): void {
  const data = getStoredData();
  data.collections = data.collections.filter(c => c.id !== collectionId);
  saveData(data);
}

export function addToCollection(collectionId: string, movieId: number): void {
  const data = getStoredData();
  const collection = data.collections.find(c => c.id === collectionId);
  if (collection && !collection.movieIds.includes(movieId)) {
    collection.movieIds.push(movieId);
    collection.updatedAt = Date.now();
    saveData(data);
  }
}

export function removeFromCollection(collectionId: string, movieId: number): void {
  const data = getStoredData();
  const collection = data.collections.find(c => c.id === collectionId);
  if (collection) {
    collection.movieIds = collection.movieIds.filter(id => id !== movieId);
    collection.updatedAt = Date.now();
    saveData(data);
  }
}

export function isInCollection(collectionId: string, movieId: number): boolean {
  const collection = getStoredData().collections.find(c => c.id === collectionId);
  return collection?.movieIds.includes(movieId) ?? false;
}

// ====== Ratings Functions ======

export function getRatings(): UserRating[] {
  return getStoredData().ratings;
}

export function getUserRating(movieId: number): number | null {
  const rating = getStoredData().ratings.find(r => r.movieId === movieId);
  return rating?.rating ?? null;
}

export function setUserRating(movieId: number, rating: number): void {
  const data = getStoredData();
  const existingIndex = data.ratings.findIndex(r => r.movieId === movieId);
  
  if (existingIndex >= 0) {
    data.ratings[existingIndex].rating = rating;
    data.ratings[existingIndex].ratedAt = Date.now();
  } else {
    data.ratings.push({ movieId, rating, ratedAt: Date.now() });
  }
  saveData(data);
}

export function removeUserRating(movieId: number): void {
  const data = getStoredData();
  data.ratings = data.ratings.filter(r => r.movieId !== movieId);
  saveData(data);
}

// ====== View History Functions ======

export function getViewHistory(): ViewHistoryItem[] {
  return getStoredData().viewHistory;
}

export function addToViewHistory(movieId: number): void {
  const data = getStoredData();
  
  // Remove duplicate if exists
  data.viewHistory = data.viewHistory.filter(h => h.movieId !== movieId);
  
  // Add to front
  data.viewHistory.unshift({ movieId, viewedAt: Date.now() });
  
  // Keep only last 100
  data.viewHistory = data.viewHistory.slice(0, 100);
  
  // Update stats
  data.stats.totalMoviesDiscovered = new Set(data.viewHistory.map(h => h.movieId)).size;
  
  saveData(data);
}

export function clearViewHistory(): void {
  const data = getStoredData();
  data.viewHistory = [];
  saveData(data);
}

// ====== Comparison Functions ======

export function getComparison(): ComparisonSlot[] {
  return getStoredData().comparison;
}

export function addToComparison(movieId: number, slot: number): void {
  const data = getStoredData();
  if (slot >= 0 && slot < 3) {
    data.comparison[slot] = { movieId };
    saveData(data);
  }
}

export function removeFromComparison(slot: number): void {
  const data = getStoredData();
  if (slot >= 0 && slot < 3) {
    data.comparison[slot] = { movieId: null };
    saveData(data);
  }
}

export function clearComparison(): void {
  const data = getStoredData();
  data.comparison = [{ movieId: null }, { movieId: null }, { movieId: null }];
  saveData(data);
}

export function isInComparison(movieId: number): number {
  const comparison = getStoredData().comparison;
  return comparison.findIndex(c => c.movieId === movieId);
}

// ====== Mood Functions ======

export function getLastMood(): MoodEntry | null {
  return getStoredData().lastMood;
}

export function setMood(mood: string, genreIds: number[]): void {
  const data = getStoredData();
  data.lastMood = { mood, genreIds, selectedAt: Date.now() };
  saveData(data);
}

// ====== Stats Functions ======

export function getStats() {
  const data = getStoredData();
  return {
    ...data.stats,
    watchlistCount: data.watchlist.length,
    favoritesCount: data.favorites.length,
    ratingsCount: data.ratings.length,
    collectionsCount: data.collections.length,
    historyCount: data.viewHistory.length,
    averageRating: data.ratings.length > 0 
      ? data.ratings.reduce((sum, r) => sum + r.rating, 0) / data.ratings.length 
      : 0,
  };
}

export function updateGenreStats(genreIds: number[]): void {
  const data = getStoredData();
  genreIds.forEach(id => {
    data.stats.favoriteGenres[id] = (data.stats.favoriteGenres[id] || 0) + 1;
  });
  saveData(data);
}

// ====== Full Data Access ======

export function getAllUserData(): UserData {
  return getStoredData();
}

export function resetAllUserData(): void {
  saveData({ ...defaultUserData });
}
