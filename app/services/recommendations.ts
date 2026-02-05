/**
 * Personalized Recommendations Service
 * =====================================
 * Generates movie recommendations based on user's watch history, ratings, and favorites
 */

import { type Movie, discoverMovies, getMovieDetails, searchMovies } from './tmdb';
import { type ViewHistoryItem, type UserRating, type SavedMovie } from './userDataStore';

interface RecommendationScore {
  movie: Movie;
  score: number;
  reasons: string[];
}

/**
 * Extract genre preferences from user data
 */
function extractGenrePreferences(
  viewHistory: ViewHistoryItem[],
  ratings: UserRating[],
  favorites: SavedMovie[]
): Map<number, number> {
  const genreScores = new Map<number, number>();
  
  // Weight favorites highest
  favorites.forEach(movie => {
    if (movie.genre_ids) {
      movie.genre_ids.forEach(genreId => {
        genreScores.set(genreId, (genreScores.get(genreId) || 0) + 3);
      });
    }
  });
  
  // Weight high ratings
  ratings.forEach(rating => {
    if (rating.rating >= 8 && rating.genre_ids) {
      rating.genre_ids.forEach(genreId => {
        genreScores.set(genreId, (genreScores.get(genreId) || 0) + 2);
      });
    }
  });
  
  // Weight view history (less important)
  viewHistory.slice(0, 30).forEach(item => {
    if (item.genre_ids) {
      item.genre_ids.forEach(genreId => {
        genreScores.set(genreId, (genreScores.get(genreId) || 0) + 1);
      });
    }
  });
  
  return genreScores;
}

/**
 * Get top preferred genres
 */
function getTopGenres(genreScores: Map<number, number>, limit: number = 3): number[] {
  return Array.from(genreScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([genreId]) => genreId);
}

/**
 * Calculate a recommendation score for a movie
 */
function calculateRecommendationScore(
  movie: Movie,
  genrePreferences: Map<number, number>,
  viewHistory: ViewHistoryItem[],
  ratings: UserRating[],
  favorites: SavedMovie[]
): RecommendationScore {
  let score = 0;
  const reasons: string[] = [];
  
  // Already watched/in watchlist/favorites? Skip
  const alreadySeen = viewHistory.some(h => h.movieId === movie.id);
  const alreadyRated = ratings.some(r => r.movieId === movie.id);
  const alreadyFavorited = favorites.some(f => f.id === movie.id);
  
  if (alreadySeen || alreadyRated || alreadyFavorited) {
    return { movie, score: -1000, reasons: ['Already watched'] };
  }
  
  // Genre match (most important)
  if (movie.genre_ids) {
    movie.genre_ids.forEach(genreId => {
      const genreScore = genrePreferences.get(genreId) || 0;
      if (genreScore > 0) {
        score += genreScore * 10;
        reasons.push('Matches your favorite genres');
      }
    });
  }
  
  // High quality (TMDB rating)
  if (movie.vote_average >= 7.5 && movie.vote_count > 1000) {
    score += 15;
    reasons.push('Highly rated');
  } else if (movie.vote_average >= 7.0 && movie.vote_count > 500) {
    score += 10;
  }
  
  // Popularity (but not too much weight)
  if (movie.vote_count > 5000) {
    score += 5;
  }
  
  // Recent releases (slight preference)
  const releaseYear = new Date(movie.release_date).getFullYear();
  const currentYear = new Date().getFullYear();
  if (currentYear - releaseYear <= 3) {
    score += 5;
    reasons.push('Recent release');
  }
  
  return { movie, score, reasons: Array.from(new Set(reasons)) };
}

/**
 * Generate personalized recommendations
 */
export async function generateRecommendations(
  viewHistory: ViewHistoryItem[],
  ratings: UserRating[],
  favorites: SavedMovie[],
  count: number = 20
): Promise<Movie[]> {
  try {
    // Need some data to make recommendations
    if (viewHistory.length === 0 && ratings.length === 0 && favorites.length === 0) {
      // Fallback to trending movies for new users
      return discoverMovies([], undefined, undefined, 'popularity.desc', '1', 7.0);
    }
    
    // Extract genre preferences
    const genrePreferences = extractGenrePreferences(viewHistory, ratings, favorites);
    const topGenres = getTopGenres(genrePreferences, 3);
    
    // Fetch candidate movies from multiple sources
    const candidateMovies: Movie[] = [];
    
    // 1. Fetch movies from top genres
    for (const genreId of topGenres) {
      const genreMovies = await discoverMovies(
        [genreId],
        undefined,
        undefined,
        'vote_average.desc',
        '1',
        7.0,
        1000
      );
      candidateMovies.push(...genreMovies.slice(0, 15));
    }
    
    // 2. Fetch popular quality movies
    const popularMovies = await discoverMovies(
      [],
      undefined,
      undefined,
      'popularity.desc',
      '1',
      7.5,
      2000
    );
    candidateMovies.push(...popularMovies.slice(0, 10));
    
    // 3. Fetch recent quality releases
    const currentYear = new Date().getFullYear();
    const recentMovies = await discoverMovies(
      topGenres.length > 0 ? [topGenres[0]] : [],
      currentYear - 2,
      currentYear,
      'vote_average.desc',
      '1',
      7.0,
      500
    );
    candidateMovies.push(...recentMovies.slice(0, 10));
    
    // Remove duplicates
    const uniqueMovies = Array.from(
      new Map(candidateMovies.map(m => [m.id, m])).values()
    );
    
    // Score and rank all candidates
    const scoredMovies = uniqueMovies
      .map(movie => calculateRecommendationScore(movie, genrePreferences, viewHistory, ratings, favorites))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);
    
    // Return top recommendations
    return scoredMovies.slice(0, count).map(item => item.movie);
  } catch (error) {
    console.error('Failed to generate recommendations:', error);
    // Fallback to trending
    return discoverMovies([], undefined, undefined, 'popularity.desc', '1', 7.0);
  }
}

/**
 * Get recommendation reason text for UI
 */
export function getRecommendationReason(
  movie: Movie,
  genrePreferences: Map<number, number>,
  viewHistory: ViewHistoryItem[]
): string {
  const reasons: string[] = [];
  
  // Check genre match
  if (movie.genre_ids) {
    const matchingGenres = movie.genre_ids.filter(id => genrePreferences.has(id));
    if (matchingGenres.length > 0) {
      reasons.push('Based on your taste');
    }
  }
  
  // Check quality
  if (movie.vote_average >= 8.0) {
    reasons.push('Critically acclaimed');
  } else if (movie.vote_average >= 7.5) {
    reasons.push('Highly rated');
  }
  
  // Check recency
  const releaseYear = new Date(movie.release_date).getFullYear();
  const currentYear = new Date().getFullYear();
  if (currentYear - releaseYear <= 1) {
    reasons.push('New release');
  }
  
  return reasons.length > 0 ? reasons[0] : 'Recommended for you';
}
