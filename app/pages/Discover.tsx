"use client";

/**
 * Discover Page
 * =============
 * Features:
 * - Random Movie Picker with spin wheel animation
 * - Mood-Based Discovery with AI integration
 * - Genre exploration
 * 
 * Beautiful liquid glass styling throughout!
 */

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Surface } from '~/components/Surface';
import { OptimizedImage } from '~/components/OptimizedImage';
import { useUserData } from '~/contexts/UserDataContext';
import { useInfiniteScroll } from '~/hooks/useInfiniteScroll';
import { 
  discoverMovies, 
  getTopRated, 
  getTrending, 
  getPosterUrl, 
  getBackdropUrl,
  type Movie 
} from '~/services/tmdb';
import { getAIResponse, GENRES } from '~/services/ai';
import { trackAction } from '~/services/achievements';

// Mood configurations with genres and descriptions
const MOODS = [
  { 
    id: 'adventurous', 
    emoji: '🚀', 
    label: 'Adventurous', 
    description: 'Ready for an epic journey',
    genreIds: [12, 28, 878], // Adventure, Action, Sci-Fi
    color: '#f59e0b',
  },
  { 
    id: 'romantic', 
    emoji: '💕', 
    label: 'Romantic', 
    description: 'In the mood for love',
    genreIds: [10749, 35], // Romance, Comedy
    color: '#ec4899',
  },
  { 
    id: 'scared', 
    emoji: '😱', 
    label: 'Scared', 
    description: 'Bring on the thrills',
    genreIds: [27, 53], // Horror, Thriller
    color: '#ef4444',
  },
  { 
    id: 'thoughtful', 
    emoji: '🤔', 
    label: 'Thoughtful', 
    description: 'Want something deep',
    genreIds: [18, 99], // Drama, Documentary
    color: '#8b5cf6',
  },
  { 
    id: 'happy', 
    emoji: '😊', 
    label: 'Happy', 
    description: 'Need a good laugh',
    genreIds: [35, 10751], // Comedy, Family
    color: '#10b981',
  },
  { 
    id: 'mysterious', 
    emoji: '🔮', 
    label: 'Mysterious', 
    description: 'Love a good puzzle',
    genreIds: [9648, 80], // Mystery, Crime
    color: '#6366f1',
  },
  { 
    id: 'nostalgic', 
    emoji: '✨', 
    label: 'Nostalgic', 
    description: 'Classic vibes only',
    genreIds: [18, 10749], // Drama, Romance (+ year filter)
    color: '#f97316',
  },
  { 
    id: 'lazy', 
    emoji: '😴', 
    label: 'Lazy', 
    description: 'Easy watching',
    genreIds: [16, 10751, 35], // Animation, Family, Comedy
    color: '#14b8a6',
  },
];

// Genre icons for random picker filters
const GENRE_FILTERS = [
  { id: '28', label: 'Action', emoji: '💥' },
  { id: '35', label: 'Comedy', emoji: '😂' },
  { id: '27', label: 'Horror', emoji: '👻' },
  { id: '878', label: 'Sci-Fi', emoji: '🚀' },
  { id: '10749', label: 'Romance', emoji: '💕' },
  { id: '53', label: 'Thriller', emoji: '😰' },
  { id: '18', label: 'Drama', emoji: '🎭' },
  { id: '16', label: 'Animation', emoji: '🎨' },
];

export function Discover() {
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
        paddingTop: isMobile ? '80px' : '100px',
        paddingBottom: '60px',
      }}
    >
      {/* Animated Background */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 90% 80%, rgba(236, 72, 153, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 60%)
          `,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <main
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1400px',
          margin: '0 auto',
          padding: isMobile ? '0 16px' : '0 24px',
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '40px' }}
        >
          <Surface
            variant="container"
            cornerRadius={24}
            padding={isMobile ? '24px' : '32px'}
          >
            <h1 style={{ 
              fontSize: isMobile ? '28px' : '40px', 
              fontWeight: 800,
              background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px',
            }}>
              🎲 Discover Movies
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px' }}>
              Let fate decide your next favorite film, or explore by mood
            </p>
          </Surface>
        </motion.div>

        {/* Random Movie Picker */}
        <RandomMoviePicker isMobile={isMobile} />

        {/* Mood-Based Discovery */}
        <MoodDiscovery isMobile={isMobile} />
      </main>
    </div>
  );
}

// ====== Random Movie Picker ======
function RandomMoviePicker({ isMobile }: { isMobile: boolean }) {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [minRating, setMinRating] = useState(6);
  const [isSpinning, setIsSpinning] = useState(false);
  const [pickedMovie, setPickedMovie] = useState<Movie | null>(null);
  const [moviePool, setMoviePool] = useState<Movie[]>([]);

  const handleSpin = async () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setPickedMovie(null);

    try {
      // Fetch movies based on filters
      let movies: Movie[];
      
      if (selectedGenre) {
        movies = await discoverMovies(selectedGenre, undefined, 'vote_average.desc');
      } else {
        movies = await getTrending('week');
      }
      
      // Filter by minimum rating
      const filtered = movies.filter(m => m.vote_average >= minRating);
      setMoviePool(filtered);
      
      if (filtered.length === 0) {
        setIsSpinning(false);
        return;
      }

      // Optimized animation: only set final movie after delay
      // This avoids 10 re-renders during the spinning animation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Final pick
      const finalIndex = Math.floor(Math.random() * filtered.length);
      setPickedMovie(filtered[finalIndex]);
      
      // Track for achievements
      trackAction('random_picker');
    } catch (error) {
      console.error('Failed to pick movie:', error);
    }
    
    setIsSpinning(false);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      style={{ marginBottom: '60px' }}
    >
      <Surface variant="modal" cornerRadius={28} padding={isMobile ? '24px' : '40px'}>
        <h2 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 700, marginBottom: '24px' }}>
          🎰 Random Movie Picker
        </h2>

        {/* Filters */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '16px', fontSize: '14px' }}>
            Filter by genre (optional):
          </p>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '10px',
            marginBottom: '24px',
          }}>
            <motion.button
              onClick={() => setSelectedGenre(null)}
              whileTap={{ scale: 0.95 }}
            >
              <Surface 
                variant="button" 
                cornerRadius={12} 
                padding="10px 16px"
                style={{
                  background: !selectedGenre 
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.5), rgba(168, 85, 247, 0.5))'
                    : undefined,
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 500 }}>🎬 Any</span>
              </Surface>
            </motion.button>
            {GENRE_FILTERS.map((genre) => (
              <motion.button
                key={genre.id}
                onClick={() => setSelectedGenre(genre.id)}
                whileTap={{ scale: 0.95 }}
              >
                <Surface 
                  variant="button" 
                  cornerRadius={12} 
                  padding="10px 16px"
                  style={{
                    background: selectedGenre === genre.id 
                      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.5), rgba(168, 85, 247, 0.5))'
                      : undefined,
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 500 }}>
                    {genre.emoji} {genre.label}
                  </span>
                </Surface>
              </motion.button>
            ))}
          </div>

          {/* Min Rating Slider */}
          <div style={{ maxWidth: '300px' }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '8px', fontSize: '14px' }}>
              Minimum Rating: ⭐ {minRating}+
            </p>
            <input
              type="range"
              min="1"
              max="9"
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                background: 'linear-gradient(90deg, #ef4444, #f59e0b, #10b981)',
                appearance: 'none',
                cursor: 'pointer',
              }}
            />
          </div>
        </div>

        {/* Spin Button & Result */}
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          gap: '32px', 
          alignItems: isMobile ? 'center' : 'flex-start',
        }}>
          {/* Spin Button */}
          <motion.button
            onClick={handleSpin}
            disabled={isSpinning}
            whileHover={!isSpinning ? { scale: 1.05 } : {}}
            whileTap={!isSpinning ? { scale: 0.95 } : {}}
            style={{ flexShrink: 0 }}
          >
            <Surface
              variant="button"
              cornerRadius={100}
              padding="0"
              style={{
                width: isMobile ? '150px' : '180px',
                height: isMobile ? '150px' : '180px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isSpinning 
                  ? 'conic-gradient(from 0deg, #6366f1, #a855f7, #ec4899, #6366f1)'
                  : 'linear-gradient(135deg, #6366f1, #a855f7)',
                cursor: isSpinning ? 'wait' : 'pointer',
              }}
            >
              <motion.div
                animate={isSpinning ? { rotate: 360 } : { rotate: 0 }}
                transition={isSpinning ? { repeat: Infinity, duration: 0.5, ease: 'linear' } : {}}
                style={{ textAlign: 'center' }}
              >
                <span style={{ fontSize: isMobile ? '40px' : '50px' }}>🎲</span>
                <p style={{ 
                  fontSize: isMobile ? '14px' : '16px', 
                  fontWeight: 700, 
                  marginTop: '8px',
                  color: '#fff',
                }}>
                  {isSpinning ? 'Spinning...' : 'SPIN!'}
                </p>
              </motion.div>
            </Surface>
          </motion.button>

          {/* Result */}
          <AnimatePresence mode="wait">
            {pickedMovie && (
              <motion.div
                key={pickedMovie.id}
                initial={{ opacity: 0, scale: 0.8, x: 50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -50 }}
                style={{ flex: 1, width: '100%' }}
              >
                <Surface variant="card" cornerRadius={20} padding="16px">
                  <div style={{ 
                    display: 'flex', 
                    gap: '16px',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'center' : 'flex-start',
                  }}>
                    <OptimizedImage
                      src={getPosterUrl(pickedMovie.poster_path, 'w342')}
                      alt={pickedMovie.title}
                      style={{
                        width: isMobile ? '120px' : '140px',
                        borderRadius: '12px',
                        aspectRatio: '2/3',
                      }}
                      priority={true}
                    />
                    <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
                        🎉 {pickedMovie.title}
                      </h3>
                      <p style={{ 
                        fontSize: '14px', 
                        color: 'rgba(255,255,255,0.7)',
                        marginBottom: '12px',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {pickedMovie.overview}
                      </p>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                        <span style={{ fontSize: '14px' }}>⭐ {pickedMovie.vote_average?.toFixed(1)}</span>
                        <span style={{ fontSize: '14px' }}>📅 {pickedMovie.release_date?.split('-')[0]}</span>
                      </div>
                      <Link 
                        to={`/movie/${pickedMovie.id}`}
                        style={{ textDecoration: 'none', display: 'inline-block', marginTop: '16px' }}
                      >
                        <Surface variant="button" cornerRadius={12} padding="10px 20px">
                          <span style={{ fontWeight: 600 }}>View Details →</span>
                        </Surface>
                      </Link>
                    </div>
                  </div>
                </Surface>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Surface>
    </motion.section>
  );
}

// ====== Mood-Based Discovery ======
function MoodDiscovery({ isMobile }: { isMobile: boolean }) {
  const { setMood: saveMood, lastMood } = useUserData();
  const [selectedMood, setSelectedMood] = useState<typeof MOODS[0] | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState<string>('');

  // Infinite scroll for mood-based discovery
  const loadMoreMovies = async (page: number): Promise<boolean> => {
    if (!selectedMood) return false;

    try {
      const primaryGenre = selectedMood.genreIds[0].toString();
      const fetchedMovies = await discoverMovies(
        primaryGenre,
        selectedMood.id === 'nostalgic' ? '1995' : undefined,
        undefined,
        'vote_average.desc',
        page.toString()
      );

      if (fetchedMovies.length > 0) {
        setMovies((prev) => [...prev, ...fetchedMovies]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load more movies:', error);
      return false;
    }
  };

  const {
    page,
    hasMore,
    isLoadingMore,
    reset: resetPagination,
    observerRef,
  } = useInfiniteScroll(loadMoreMovies, { enabled: !!selectedMood && !loading });

  const handleMoodSelect = async (mood: typeof MOODS[0]) => {
    setSelectedMood(mood);
    setLoading(true);
    setAiMessage('');
    setMovies([]); // Clear previous movies
    resetPagination(); // Reset pagination

    try {
      // Save mood to localStorage
      saveMood(mood.id, mood.genreIds);
      
      // Track for achievements
      trackAction('use_mood', mood.id);

      // Get AI commentary (non-blocking)
      getAIResponse([{ 
        role: 'user', 
        content: `I'm feeling ${mood.label.toLowerCase()}. Give me a short, enthusiastic one-liner about what movies I should watch (don't list specific titles, just describe the vibe).`
      }]).then(response => {
        if (response.content) {
          setAiMessage(response.content);
        }
      }).catch(() => {});

      // Fetch initial movies for this mood
      const primaryGenre = mood.genreIds[0].toString();
      let fetchedMovies = await discoverMovies(
        primaryGenre, 
        mood.id === 'nostalgic' ? '1995' : undefined,
        undefined,
        'vote_average.desc',
        '1'
      );

      setMovies(fetchedMovies);
    } catch (error) {
      console.error('Failed to fetch mood movies:', error);
    }

    setLoading(false);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Surface variant="modal" cornerRadius={28} padding={isMobile ? '24px' : '40px'}>
        <h2 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 700, marginBottom: '8px' }}>
          😊 How Are You Feeling?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px' }}>
          Select your mood and we'll find the perfect movies for you
        </p>

        {/* Mood Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '32px',
        }}>
          {MOODS.map((mood, index) => (
            <motion.button
              key={mood.id}
              onClick={() => handleMoodSelect(mood)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              disabled={loading}
            >
              <Surface 
                variant="card" 
                cornerRadius={16} 
                padding="20px"
                style={{
                  background: selectedMood?.id === mood.id 
                    ? `linear-gradient(135deg, ${mood.color}40, ${mood.color}20)`
                    : undefined,
                  border: selectedMood?.id === mood.id 
                    ? `2px solid ${mood.color}80`
                    : undefined,
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '36px' }}>{mood.emoji}</span>
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: 600, 
                    marginTop: '8px',
                    color: selectedMood?.id === mood.id ? mood.color : '#fff',
                  }}>
                    {mood.label}
                  </h4>
                  <p style={{ 
                    fontSize: '12px', 
                    color: 'rgba(255,255,255,0.5)', 
                    marginTop: '4px' 
                  }}>
                    {mood.description}
                  </p>
                </div>
              </Surface>
            </motion.button>
          ))}
        </div>

        {/* AI Message */}
        <AnimatePresence>
          {aiMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ marginBottom: '24px' }}
            >
              <Surface variant="container" cornerRadius={16} padding="16px 20px">
                <p style={{ 
                  fontSize: '15px', 
                  fontStyle: 'italic',
                  background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  ✨ {aiMessage}
                </p>
              </Surface>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              style={{ fontSize: '48px', display: 'inline-block' }}
            >
              {selectedMood?.emoji || '🎬'}
            </motion.div>
            <p style={{ marginTop: '16px', color: 'rgba(255,255,255,0.6)' }}>
              Finding perfect movies for your mood...
            </p>
          </div>
        )}

        {/* Movies Grid */}
        {!loading && movies.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>
              {selectedMood?.emoji} Movies for when you're {selectedMood?.label.toLowerCase()}:
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(min(160px, 45vw), 1fr))',
              gap: isMobile ? '12px' : '16px',
            }}>
              {movies.map((movie, index) => (
                <motion.div
                  key={`${movie.id}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.5) }}
                >
                  <Link to={`/movie/${movie.id}`} style={{ textDecoration: 'none' }}>
                    <Surface variant="card" cornerRadius={14} padding="0">
                      <div style={{ position: 'relative' }}>
                        <OptimizedImage
                          src={getPosterUrl(movie.poster_path, 'w342')}
                          alt={movie.title}
                          style={{
                            width: '100%',
                            aspectRatio: '2/3',
                            objectFit: 'cover',
                            borderRadius: '14px 14px 0 0',
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          background: 'rgba(0,0,0,0.7)',
                          borderRadius: '6px',
                          padding: '2px 8px',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}>
                          ⭐ {movie.vote_average?.toFixed(1)}
                        </div>
                      </div>
                      <div style={{ padding: '12px' }}>
                        <h4 style={{ 
                          fontSize: '13px', 
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {movie.title}
                        </h4>
                        <p style={{ 
                          fontSize: '11px', 
                          color: 'rgba(255,255,255,0.5)', 
                          marginTop: '4px' 
                        }}>
                          {movie.release_date?.split('-')[0]}
                        </p>
                      </div>
                    </Surface>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Infinite scroll trigger and loading indicator */}
            {hasMore && (
              <div 
                ref={observerRef} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  padding: '40px 0',
                  minHeight: '100px',
                }}
              >
                {isLoadingMore && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    style={{ fontSize: '32px' }}
                  >
                    {selectedMood?.emoji || '🎬'}
                  </motion.div>
                )}
              </div>
            )}

            {/* End of results message */}
            {!hasMore && movies.length > 20 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 0',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '14px',
              }}>
                ✨ That's all the {selectedMood?.label.toLowerCase()} movies we found!
              </div>
            )}
          </motion.div>
        )}
      </Surface>
    </motion.section>
  );
}

export default Discover;
