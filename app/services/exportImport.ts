/**
 * Export/Import Service
 * =====================
 * Handles exporting and importing user data.
 * Supports JSON, CSV formats and Letterboxd/IMDb imports.
 */

import type { Movie } from './tmdb';
import { searchMovies, getMovieDetails } from './tmdb';

// Export data structure
export interface ExportData {
  version: string;
  exportedAt: string;
  source: 'scanmovie';
  data: {
    watchlist: ExportMovie[];
    favorites: ExportMovie[];
    ratings: ExportRating[];
    collections: ExportCollection[];
    watchHistory: ExportHistoryItem[];
  };
}

export interface ExportMovie {
  id: number;
  title: string;
  year: string;
  addedAt?: string;
}

export interface ExportRating {
  movieId: number;
  title: string;
  year: string;
  rating: number;
  ratedAt?: string;
}

export interface ExportCollection {
  name: string;
  emoji: string;
  movies: ExportMovie[];
}

export interface ExportHistoryItem {
  movieId: number;
  title: string;
  watchedAt: string;
}

// Import result
export interface ImportResult {
  success: boolean;
  imported: {
    watchlist: number;
    favorites: number;
    ratings: number;
    collections: number;
  };
  errors: string[];
  warnings: string[];
}

/**
 * Export user data as JSON
 */
export function exportAsJSON(
  watchlist: Movie[],
  favorites: Movie[],
  ratings: { movieId: number; rating: number; ratedAt: string }[],
  collections: { name: string; emoji: string; movieIds: number[] }[],
  watchHistory: { movieId: number; title: string; watchedAt: string }[]
): string {
  const exportData: ExportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    source: 'scanmovie',
    data: {
      watchlist: watchlist.map(m => ({
        id: m.id,
        title: m.title,
        year: m.release_date?.split('-')[0] || '',
      })),
      favorites: favorites.map(m => ({
        id: m.id,
        title: m.title,
        year: m.release_date?.split('-')[0] || '',
      })),
      ratings: ratings.map(r => ({
        movieId: r.movieId,
        title: '', // Will be filled if needed
        year: '',
        rating: r.rating,
        ratedAt: r.ratedAt,
      })),
      collections: collections.map(c => ({
        name: c.name,
        emoji: c.emoji,
        movies: [], // Would need to fetch movie details
      })),
      watchHistory: watchHistory.map(h => ({
        movieId: h.movieId,
        title: h.title,
        watchedAt: h.watchedAt,
      })),
    },
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export as CSV (Letterboxd-compatible format)
 */
export function exportAsCSV(
  movies: Movie[],
  ratings: Record<number, number>,
  type: 'watchlist' | 'watched' | 'ratings'
): string {
  const headers = ['Title', 'Year', 'Rating10', 'tmdbID'];
  const rows = movies.map(m => {
    const rating = ratings[m.id] || '';
    return [
      `"${m.title.replace(/"/g, '""')}"`,
      m.release_date?.split('-')[0] || '',
      rating ? (rating * 2).toString() : '', // Convert 5-star to 10-star
      m.id.toString(),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Export as Letterboxd-compatible CSV
 */
export function exportForLetterboxd(
  movies: Movie[],
  ratings: Record<number, number>
): string {
  const headers = ['Title', 'Year', 'Rating'];
  const rows = movies.map(m => {
    const rating = ratings[m.id];
    return [
      `"${m.title.replace(/"/g, '""')}"`,
      m.release_date?.split('-')[0] || '',
      rating ? rating.toString() : '',
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Parse Letterboxd CSV export
 */
export async function parseLetterboxdCSV(csvContent: string): Promise<{
  movies: { title: string; year: string; rating?: number }[];
  errors: string[];
}> {
  const lines = csvContent.trim().split('\n');
  const movies: { title: string; year: string; rating?: number }[] = [];
  const errors: string[] = [];

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    try {
      // Parse CSV line (handle quoted values)
      const matches = line.match(/(".*?"|[^,]+)(?=,|$)/g);
      if (matches && matches.length >= 2) {
        const title = matches[0].replace(/^"|"$/g, '').replace(/""/g, '"');
        const year = matches[1].trim();
        const rating = matches[2] ? parseFloat(matches[2]) : undefined;

        movies.push({ title, year, rating });
      }
    } catch (e) {
      errors.push(`Line ${i + 1}: Failed to parse`);
    }
  }

  return { movies, errors };
}

/**
 * Parse IMDb CSV/TSV export
 */
export async function parseIMDbExport(content: string): Promise<{
  movies: { title: string; year: string; rating?: number; imdbId?: string }[];
  errors: string[];
}> {
  const lines = content.trim().split('\n');
  const movies: { title: string; year: string; rating?: number; imdbId?: string }[] = [];
  const errors: string[] = [];

  // Detect delimiter (comma or tab)
  const delimiter = lines[0].includes('\t') ? '\t' : ',';
  const headers = lines[0].split(delimiter).map(h => h.toLowerCase().trim());

  const titleIndex = headers.findIndex(h => h.includes('title'));
  const yearIndex = headers.findIndex(h => h.includes('year'));
  const ratingIndex = headers.findIndex(h => h.includes('your rating') || h.includes('rating'));
  const imdbIndex = headers.findIndex(h => h.includes('const') || h.includes('imdb'));

  for (let i = 1; i < lines.length; i++) {
    try {
      const cols = lines[i].split(delimiter);
      if (cols[titleIndex]) {
        movies.push({
          title: cols[titleIndex].replace(/^"|"$/g, ''),
          year: cols[yearIndex] || '',
          rating: ratingIndex >= 0 && cols[ratingIndex] ? parseFloat(cols[ratingIndex]) / 2 : undefined,
          imdbId: imdbIndex >= 0 ? cols[imdbIndex] : undefined,
        });
      }
    } catch (e) {
      errors.push(`Line ${i + 1}: Failed to parse`);
    }
  }

  return { movies, errors };
}

/**
 * Parse ScanMovie JSON export
 */
export function parseScanMovieExport(jsonContent: string): ExportData | null {
  try {
    const data = JSON.parse(jsonContent);
    if (data.source === 'scanmovie' && data.version && data.data) {
      return data as ExportData;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Match imported movies to TMDB IDs
 */
export async function matchMoviesToTMDB(
  movies: { title: string; year: string; rating?: number }[],
  onProgress?: (current: number, total: number) => void
): Promise<{
  matched: { movie: Movie; rating?: number }[];
  unmatched: { title: string; year: string }[];
}> {
  const matched: { movie: Movie; rating?: number }[] = [];
  const unmatched: { title: string; year: string }[] = [];

  for (let i = 0; i < movies.length; i++) {
    const { title, year, rating } = movies[i];
    onProgress?.(i + 1, movies.length);

    try {
      const results = await searchMovies(`${title} ${year}`);
      
      // Find best match
      const exactMatch = results.find(m => 
        m.title.toLowerCase() === title.toLowerCase() &&
        m.release_date?.startsWith(year)
      );

      const closeMatch = results.find(m =>
        m.title.toLowerCase().includes(title.toLowerCase()) ||
        title.toLowerCase().includes(m.title.toLowerCase())
      );

      const match = exactMatch || closeMatch || results[0];

      if (match) {
        matched.push({ movie: match, rating });
      } else {
        unmatched.push({ title, year });
      }

      // Rate limit - wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (e) {
      unmatched.push({ title, year });
    }
  }

  return { matched, unmatched };
}

/**
 * Download file helper
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Read file helper
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
