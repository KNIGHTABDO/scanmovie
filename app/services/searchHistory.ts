/**
 * Search History Service
 * ======================
 * Manages user's search history for better UX
 * Stores recent searches in localStorage
 */

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  type: 'ai' | 'text'; // AI search or regular text search
}

const STORAGE_KEY = 'scanmovie_search_history';
const MAX_HISTORY_ITEMS = 20;

/**
 * Get all search history items
 */
export function getSearchHistory(): SearchHistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const items: SearchHistoryItem[] = JSON.parse(stored);
    // Sort by timestamp descending (newest first)
    return items.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to get search history:', error);
    return [];
  }
}

/**
 * Add a search query to history
 */
export function addToSearchHistory(query: string, type: 'ai' | 'text' = 'text'): void {
  try {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || trimmedQuery.length < 2) return;
    
    const history = getSearchHistory();
    
    // Check if this query already exists (case-insensitive)
    const existingIndex = history.findIndex(
      item => item.query.toLowerCase() === trimmedQuery.toLowerCase()
    );
    
    // If exists, remove it (we'll re-add it as most recent)
    if (existingIndex !== -1) {
      history.splice(existingIndex, 1);
    }
    
    // Add new item at the beginning
    const newItem: SearchHistoryItem = {
      id: `${Date.now()}-${Math.random()}`,
      query: trimmedQuery,
      timestamp: Date.now(),
      type,
    };
    
    history.unshift(newItem);
    
    // Keep only the most recent items
    const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Failed to add to search history:', error);
  }
}

/**
 * Remove a specific search from history
 */
export function removeFromSearchHistory(id: string): void {
  try {
    const history = getSearchHistory();
    const filtered = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove from search history:', error);
  }
}

/**
 * Clear all search history
 */
export function clearSearchHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear search history:', error);
  }
}

/**
 * Get recent searches (limited count)
 */
export function getRecentSearches(limit: number = 5): SearchHistoryItem[] {
  return getSearchHistory().slice(0, limit);
}
