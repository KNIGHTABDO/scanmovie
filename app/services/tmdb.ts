/**
 * TMDB API Service
 * Handles all movie data fetching from The Movie Database API
 */

// Using API key directly as query parameter (most reliable method)
const TMDB_API_KEY = '926f46968b21a2856b40b4bf9af55847';
const BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Helper to append API key to URLs
function withApiKey(url: string): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}api_key=${TMDB_API_KEY}`;
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: Genre[];
  runtime?: number;
  tagline?: string;
  status?: string;
  budget?: number;
  revenue?: number;
  production_companies?: ProductionCompany[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
}

export interface VideoResponse {
  id: number;
  results: Video[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

/**
 * Fetch trending movies (daily or weekly)
 */
export async function getTrending(timeWindow: 'day' | 'week' = 'week'): Promise<Movie[]> {
  const url = withApiKey(`${BASE_URL}/trending/movie/${timeWindow}?language=en-US`);
  const response = await fetch(url);
  if (!response.ok) {
    console.error('getTrending failed:', response.status, await response.text());
    throw new Error('Failed to fetch trending movies');
  }
  const data: MovieResponse = await response.json();
  return data.results;
}

/**
 * Fetch now playing movies (new releases)
 */
export async function getNowPlaying(): Promise<Movie[]> {
  const url = withApiKey(`${BASE_URL}/movie/now_playing?language=en-US&page=1`);
  const response = await fetch(url);
  if (!response.ok) {
    console.error('getNowPlaying failed:', response.status, await response.text());
    throw new Error('Failed to fetch now playing movies');
  }
  const data: MovieResponse = await response.json();
  return data.results;
}

/**
 * Fetch upcoming movies
 */
export async function getUpcoming(): Promise<Movie[]> {
  const url = withApiKey(`${BASE_URL}/movie/upcoming?language=en-US&page=1`);
  const response = await fetch(url);
  if (!response.ok) {
    console.error('getUpcoming failed:', response.status, await response.text());
    throw new Error('Failed to fetch upcoming movies');
  }
  const data: MovieResponse = await response.json();
  return data.results;
}

/**
 * Fetch top rated movies
 */
export async function getTopRated(): Promise<Movie[]> {
  const url = withApiKey(`${BASE_URL}/movie/top_rated?language=en-US&page=1`);
  const response = await fetch(url);
  if (!response.ok) {
    console.error('getTopRated failed:', response.status, await response.text());
    throw new Error('Failed to fetch top rated movies');
  }
  const data: MovieResponse = await response.json();
  return data.results;
}

/**
 * Search for movies by query
 */
export async function searchMovies(query: string): Promise<Movie[]> {
  if (!query.trim()) return [];
  const url = withApiKey(`${BASE_URL}/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1`);
  const response = await fetch(url);
  if (!response.ok) {
    console.error('searchMovies failed:', response.status, await response.text());
    throw new Error('Failed to search movies');
  }
  const data: MovieResponse = await response.json();
  return data.results;
}

/**
 * Discover movies with filters (genre, year, sorting)
 * This is the smart discovery endpoint - better for genre/mood searches
 */
export async function discoverMovies(
  genreIds?: string,
  yearGte?: string,
  yearLte?: string,
  sortBy: string = 'popularity.desc',
  page: string = '1',
  voteAverageGte?: string,
  voteCountGte?: string,
  voteCountLte?: string
): Promise<Movie[]> {
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY,
    include_adult: 'false',
    include_video: 'false',
    language: 'en-US',
    page: page,
    sort_by: sortBy,
  });

  // Only add vote_count.gte filter if not looking for hidden gems
  if (!voteCountLte) {
    params.append('vote_count.gte', voteCountGte || '100');
  }

  if (genreIds) params.append('with_genres', genreIds);
  if (yearGte) params.append('primary_release_date.gte', `${yearGte}-01-01`);
  if (yearLte) params.append('primary_release_date.lte', `${yearLte}-12-31`);
  if (voteAverageGte) params.append('vote_average.gte', voteAverageGte);
  if (voteCountGte) params.append('vote_count.gte', voteCountGte);
  if (voteCountLte) params.append('vote_count.lte', voteCountLte);

  const response = await fetch(`${BASE_URL}/discover/movie?${params.toString()}`);
  if (!response.ok) {
    console.error('discoverMovies failed:', response.status, await response.text());
    throw new Error('Failed to discover movies');
  }
  const data: MovieResponse = await response.json();
  return data.results;
}

/**
 * Fetch movie details by ID
 */
export async function getMovieDetails(movieId: number): Promise<Movie> {
  const url = withApiKey(`${BASE_URL}/movie/${movieId}?language=en-US`);
  const response = await fetch(url);
  if (!response.ok) {
    console.error('getMovieDetails failed:', response.status, await response.text());
    throw new Error('Failed to fetch movie details');
  }
  return response.json();
}

/**
 * Fetch movie credits (cast & crew)
 */
export async function getMovieCredits(movieId: number): Promise<Credits> {
  const url = withApiKey(`${BASE_URL}/movie/${movieId}/credits?language=en-US`);
  const response = await fetch(url);
  if (!response.ok) {
    console.error('getMovieCredits failed:', response.status, await response.text());
    throw new Error('Failed to fetch movie credits');
  }
  return response.json();
}

/**
 * Fetch similar movies
 */
export async function getSimilarMovies(movieId: number): Promise<Movie[]> {
  const url = withApiKey(`${BASE_URL}/movie/${movieId}/similar?language=en-US&page=1`);
  const response = await fetch(url);
  if (!response.ok) {
    console.error('getSimilarMovies failed:', response.status, await response.text());
    throw new Error('Failed to fetch similar movies');
  }
  const data: MovieResponse = await response.json();
  return data.results;
}

/**
 * Fetch movie videos (trailers, teasers, clips, etc.)
 * Returns videos sorted by: Official trailers first, then by publish date
 */
export async function getMovieVideos(movieId: number): Promise<Video[]> {
  const url = withApiKey(`${BASE_URL}/movie/${movieId}/videos?language=en-US`);
  const response = await fetch(url);
  if (!response.ok) {
    console.error('getMovieVideos failed:', response.status, await response.text());
    throw new Error('Failed to fetch movie videos');
  }
  const data: VideoResponse = await response.json();
  
  // Filter for YouTube videos and sort: official trailers first, then by date
  return data.results
    .filter(video => video.site === 'YouTube')
    .sort((a, b) => {
      // Prioritize trailers over other types
      const aIsTrailer = a.type === 'Trailer' ? 1 : 0;
      const bIsTrailer = b.type === 'Trailer' ? 1 : 0;
      if (bIsTrailer !== aIsTrailer) return bIsTrailer - aIsTrailer;
      
      // Then prioritize official videos
      const aOfficial = a.official ? 1 : 0;
      const bOfficial = b.official ? 1 : 0;
      if (bOfficial !== aOfficial) return bOfficial - aOfficial;
      
      // Finally sort by publish date (newest first)
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    });
}

/**
 * Get the main trailer for a movie (best quality official trailer)
 */
export async function getMovieTrailer(movieId: number): Promise<Video | null> {
  const videos = await getMovieVideos(movieId);
  return videos.length > 0 ? videos[0] : null;
}

/**
 * Get full image URL for posters
 */
export function getPosterUrl(path: string | null, size: 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string {
  if (!path) return '/placeholder-poster.jpg';
  return `${IMAGE_BASE_URL}/${size}${path}`;
}

/**
 * Get full image URL for backdrops
 */
export function getBackdropUrl(path: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string {
  if (!path) return '/placeholder-backdrop.jpg';
  return `${IMAGE_BASE_URL}/${size}${path}`;
}

/**
 * Get full image URL for profile pictures
 */
export function getProfileUrl(path: string | null, size: 'w45' | 'w185' | 'h632' | 'original' = 'w185'): string {
  if (!path) return '/placeholder-profile.jpg';
  return `${IMAGE_BASE_URL}/${size}${path}`;
}

// ============================================================
// PERSON / CAST MEMBER APIs
// ============================================================

export interface Person {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  also_known_as: string[];
  gender: number;
  homepage: string | null;
}

export interface PersonMovieCredit {
  id: number;
  title: string;
  character?: string;
  job?: string;
  department?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  overview: string;
  credit_id: string;
}

export interface PersonCredits {
  cast: PersonMovieCredit[];
  crew: PersonMovieCredit[];
}

export interface PersonImages {
  profiles: {
    file_path: string;
    width: number;
    height: number;
    aspect_ratio: number;
    vote_average: number;
  }[];
}

/**
 * Fetch person details by ID
 */
export async function getPersonDetails(personId: number): Promise<Person> {
  const url = withApiKey(`${BASE_URL}/person/${personId}?language=en-US`);
  const response = await fetch(url);
  if (!response.ok) {
    console.error('getPersonDetails failed:', response.status, await response.text());
    throw new Error('Failed to fetch person details');
  }
  return response.json();
}

/**
 * Fetch person's movie credits (as cast and crew)
 */
export async function getPersonMovieCredits(personId: number): Promise<PersonCredits> {
  const url = withApiKey(`${BASE_URL}/person/${personId}/movie_credits?language=en-US`);
  const response = await fetch(url);
  if (!response.ok) {
    console.error('getPersonMovieCredits failed:', response.status, await response.text());
    throw new Error('Failed to fetch person movie credits');
  }
  return response.json();
}

/**
 * Fetch person's images/photos
 */
export async function getPersonImages(personId: number): Promise<PersonImages> {
  const url = withApiKey(`${BASE_URL}/person/${personId}/images`);
  const response = await fetch(url);
  if (!response.ok) {
    console.error('getPersonImages failed:', response.status, await response.text());
    throw new Error('Failed to fetch person images');
  }
  return response.json();
}

/**
 * Search for people by name
 */
export async function searchPeople(query: string): Promise<Person[]> {
  if (!query.trim()) return [];
  const url = withApiKey(`${BASE_URL}/search/person?query=${encodeURIComponent(query)}&language=en-US&page=1`);
  const response = await fetch(url);
  if (!response.ok) {
    console.error('searchPeople failed:', response.status, await response.text());
    throw new Error('Failed to search people');
  }
  const data = await response.json();
  return data.results;
}
