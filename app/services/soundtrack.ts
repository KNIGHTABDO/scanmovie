/**
 * Soundtrack Service
 * ==================
 * Fetches soundtrack and music information for movies.
 * Links to Spotify, Apple Music, YouTube Music.
 */

import type { Movie } from './tmdb';

export interface SoundtrackInfo {
  movieId: number;
  movieTitle: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  youtubeMusicUrl?: string;
  amazonMusicUrl?: string;
  composer?: string;
  tracks?: SoundtrackTrack[];
}

export interface SoundtrackTrack {
  title: string;
  artist?: string;
  duration?: string;
}

/**
 * Generate search URLs for music services
 */
export function getSoundtrackUrls(movie: Movie): SoundtrackInfo {
  const searchQuery = encodeURIComponent(`${movie.title} soundtrack`);
  const year = movie.release_date?.split('-')[0] || '';
  const yearQuery = year ? ` ${year}` : '';
  const fullQuery = encodeURIComponent(`${movie.title}${yearQuery} soundtrack`);

  return {
    movieId: movie.id,
    movieTitle: movie.title,
    spotifyUrl: `https://open.spotify.com/search/${fullQuery}`,
    appleMusicUrl: `https://music.apple.com/search?term=${fullQuery}`,
    youtubeMusicUrl: `https://music.youtube.com/search?q=${fullQuery}`,
    amazonMusicUrl: `https://music.amazon.com/search/${fullQuery}`,
  };
}

/**
 * Music service icons and colors
 */
export const MUSIC_SERVICES = [
  {
    id: 'spotify',
    name: 'Spotify',
    icon: '🎵',
    color: '#1DB954',
    urlKey: 'spotifyUrl' as keyof SoundtrackInfo,
  },
  {
    id: 'apple',
    name: 'Apple Music',
    icon: '🎶',
    color: '#FA243C',
    urlKey: 'appleMusicUrl' as keyof SoundtrackInfo,
  },
  {
    id: 'youtube',
    name: 'YouTube Music',
    icon: '▶️',
    color: '#FF0000',
    urlKey: 'youtubeMusicUrl' as keyof SoundtrackInfo,
  },
  {
    id: 'amazon',
    name: 'Amazon Music',
    icon: '🎧',
    color: '#00A8E1',
    urlKey: 'amazonMusicUrl' as keyof SoundtrackInfo,
  },
] as const;

/**
 * Notable film composers for display
 */
export const NOTABLE_COMPOSERS: Record<string, string[]> = {
  'Hans Zimmer': ['Inception', 'Interstellar', 'The Dark Knight', 'Dune', 'Gladiator'],
  'John Williams': ['Star Wars', 'Jurassic Park', 'Harry Potter', 'Indiana Jones', 'Jaws'],
  'Ennio Morricone': ['The Good, the Bad and the Ugly', 'Once Upon a Time in the West', 'The Hateful Eight'],
  'Howard Shore': ['The Lord of the Rings', 'The Hobbit', 'The Silence of the Lambs'],
  'James Horner': ['Titanic', 'Avatar', 'Braveheart', 'A Beautiful Mind'],
  'Alan Silvestri': ['Back to the Future', 'Forrest Gump', 'The Avengers', 'Contact'],
  'Danny Elfman': ['Batman', 'Edward Scissorhands', 'Spider-Man', 'The Nightmare Before Christmas'],
  'Thomas Newman': ['American Beauty', 'The Shawshank Redemption', 'WALL-E', '1917'],
  'Alexandre Desplat': ['The Shape of Water', 'The Grand Budapest Hotel', 'Harry Potter'],
  'Ludwig Göransson': ['Black Panther', 'Tenet', 'The Mandalorian', 'Oppenheimer'],
  'Michael Giacchino': ['Up', 'The Incredibles', 'Ratatouille', 'Spider-Man: No Way Home'],
  'Ramin Djawadi': ['Game of Thrones', 'Westworld', 'Iron Man', 'Pacific Rim'],
};

/**
 * Get composer from movie credits if available
 */
export function getComposerFromCredits(crew: { job: string; name: string }[]): string | undefined {
  const composer = crew.find(c => 
    c.job.toLowerCase().includes('composer') || 
    c.job.toLowerCase() === 'music' ||
    c.job.toLowerCase() === 'original music composer'
  );
  return composer?.name;
}
