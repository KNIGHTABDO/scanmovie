"use client";

/**
 * Movie Night Decision Maker
 * ==========================
 * Interactive tool to help groups decide what to watch.
 * 
 * Features:
 * - Swipe Mode (Tinder-style movie selection)
 * - Group Vote Mode (everyone votes)
 * - Decision Timer (random selection with countdown)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { LiquidSurface } from '~/components/Liquid/LiquidSurface';
import { useUserData } from '~/contexts/UserDataContext';
import { getPosterUrl, getBackdropUrl, type Movie } from '~/services/tmdb';
import { useLanguage } from '~/contexts/LanguageContext';

type Mode = 'select' | 'swipe' | 'vote' | 'timer' | 'result';

interface MovieVote {
  movieId: number;
  votes: number;
  liked: boolean;
}

export function MovieNight() {
  const [mode, setMode] = useState<Mode>('select');
  const [selectedMovies, setSelectedMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votes, setVotes] = useState<MovieVote[]>([]);
  const [winner, setWinner] = useState<Movie | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(10);
  const [timerRunning, setTimerRunning] = useState(false);
  const [swipeResults, setSwipeResults] = useState<{ movieId: number; liked: boolean }[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { watchlist, favorites } = useUserData();
  const { t } = useLanguage();

  // Combine watchlist and favorites for movie pool
  const moviePool = [...watchlist, ...favorites].reduce((acc, movie) => {
    if (!acc.find(m => m.id === movie.id)) {
      acc.push(movie);
    }
    return acc;
  }, [] as Movie[]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Timer logic
  useEffect(() => {
    if (!timerRunning || timerSeconds <= 0) return;
    
    const interval = setInterval(() => {
      setTimerSeconds(s => {
        if (s <= 1) {
          setTimerRunning(false);
          // Pick random winner from selected movies
          const randomIndex = Math.floor(Math.random() * selectedMovies.length);
          setWinner(selectedMovies[randomIndex]);
          setMode('result');
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds, selectedMovies]);

  const toggleMovieSelection = (movie: Movie) => {
    setSelectedMovies(prev => {
      const exists = prev.find(m => m.id === movie.id);
      if (exists) {
        return prev.filter(m => m.id !== movie.id);
      }
      return [...prev, movie];
    });
  };

  const startSwipeMode = () => {
    if (selectedMovies.length < 2) return;
    setCurrentIndex(0);
    setSwipeResults([]);
    setMode('swipe');
  };

  const startVoteMode = () => {
    if (selectedMovies.length < 2) return;
    setVotes(selectedMovies.map(m => ({ movieId: m.id, votes: 0, liked: false })));
    setMode('vote');
  };

  const startTimerMode = () => {
    if (selectedMovies.length < 2) return;
    setTimerSeconds(10);
    setTimerRunning(true);
    setMode('timer');
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    const currentMovie = selectedMovies[currentIndex];
    const liked = direction === 'right';
    
    setSwipeResults(prev => [...prev, { movieId: currentMovie.id, liked }]);
    
    if (currentIndex < selectedMovies.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Calculate winner from swipe results
      const likedMovies = swipeResults
        .filter(r => r.liked)
        .concat(liked ? [{ movieId: currentMovie.id, liked: true }] : []);
      
      if (likedMovies.length > 0) {
        const randomIndex = Math.floor(Math.random() * likedMovies.length);
        const winnerMovie = selectedMovies.find(m => m.id === likedMovies[randomIndex].movieId);
        setWinner(winnerMovie || null);
      } else {
        // No likes, pick random
        const randomIndex = Math.floor(Math.random() * selectedMovies.length);
        setWinner(selectedMovies[randomIndex]);
      }
      setMode('result');
    }
  };

  const handleVote = (movieId: number) => {
    setVotes(prev => prev.map(v => 
      v.movieId === movieId 
        ? { ...v, votes: v.votes + 1, liked: !v.liked }
        : v
    ));
  };

  const finishVoting = () => {
    const maxVotes = Math.max(...votes.map(v => v.votes));
    const topMovies = votes.filter(v => v.votes === maxVotes);
    const randomIndex = Math.floor(Math.random() * topMovies.length);
    const winnerMovie = selectedMovies.find(m => m.id === topMovies[randomIndex].movieId);
    setWinner(winnerMovie || null);
    setMode('result');
  };

  const resetGame = () => {
    setMode('select');
    setSelectedMovies([]);
    setCurrentIndex(0);
    setVotes([]);
    setWinner(null);
    setSwipeResults([]);
    setTimerSeconds(10);
    setTimerRunning(false);
  };

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
        paddingTop: '100px',
        paddingBottom: '100px',
      }}
    >
      {/* Background */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(236, 72, 153, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.15) 0%, transparent 40%)
          `,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <main
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '800px',
          margin: '0 auto',
          padding: isMobile ? '0 16px' : '0 24px',
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '32px', textAlign: 'center' }}
        >
          <h1 style={{
            fontSize: isMobile ? '28px' : '36px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px',
          }}>
            🎬 {t('movieNight.title')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px' }}>
            {t('movieNight.subtitle')}
          </p>
        </motion.div>

        {/* Mode: Select Movies */}
        {mode === 'select' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Mode Selection */}
            <LiquidSurface variant="container" cornerRadius={20} padding={isMobile ? '16px' : '24px'}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#fff' }}>
                Choose a Mode
              </h2>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <ModeButton
                  emoji="👆"
                  label={t('movieNight.swipeMode')}
                  description="Swipe right to like, left to skip"
                  onClick={startSwipeMode}
                  disabled={selectedMovies.length < 2}
                  color="#ec4899"
                />
                <ModeButton
                  emoji="🗳️"
                  label={t('movieNight.voteMode')}
                  description="Everyone votes for favorites"
                  onClick={startVoteMode}
                  disabled={selectedMovies.length < 2}
                  color="#8b5cf6"
                />
                <ModeButton
                  emoji="⏱️"
                  label={t('movieNight.timerMode')}
                  description="Random pick when time runs out"
                  onClick={startTimerMode}
                  disabled={selectedMovies.length < 2}
                  color="#f59e0b"
                />
              </div>
            </LiquidSurface>

            {/* Movie Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{ marginTop: '24px' }}
            >
              <LiquidSurface variant="container" cornerRadius={20} padding={isMobile ? '16px' : '24px'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>
                    Select Movies ({selectedMovies.length} selected)
                  </h2>
                  {selectedMovies.length > 0 && (
                    <button
                      onClick={() => setSelectedMovies([])}
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        color: '#f87171',
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {moviePool.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.5)' }}>
                    <p style={{ fontSize: '48px', marginBottom: '16px' }}>📭</p>
                    <p style={{ marginBottom: '8px' }}>{t('movieNight.addMovies')}</p>
                    <Link
                      to="/library"
                      style={{
                        color: '#8b5cf6',
                        textDecoration: 'underline',
                      }}
                    >
                      Go to Library
                    </Link>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '80px' : '100px'}, 1fr))`,
                    gap: '12px',
                  }}>
                    {moviePool.map(movie => (
                      <MovieSelectCard
                        key={movie.id}
                        movie={movie}
                        selected={!!selectedMovies.find(m => m.id === movie.id)}
                        onClick={() => toggleMovieSelection(movie)}
                        isMobile={isMobile}
                      />
                    ))}
                  </div>
                )}
              </LiquidSurface>
            </motion.div>
          </motion.div>
        )}

        {/* Mode: Swipe */}
        {mode === 'swipe' && (
          <SwipeMode
            movies={selectedMovies}
            currentIndex={currentIndex}
            onSwipe={handleSwipe}
            isMobile={isMobile}
            t={t}
          />
        )}

        {/* Mode: Vote */}
        {mode === 'vote' && (
          <VoteMode
            movies={selectedMovies}
            votes={votes}
            onVote={handleVote}
            onFinish={finishVoting}
            isMobile={isMobile}
            t={t}
          />
        )}

        {/* Mode: Timer */}
        {mode === 'timer' && (
          <TimerMode
            movies={selectedMovies}
            seconds={timerSeconds}
            isMobile={isMobile}
            t={t}
          />
        )}

        {/* Mode: Result */}
        {mode === 'result' && winner && (
          <ResultMode
            winner={winner}
            onReset={resetGame}
            isMobile={isMobile}
            t={t}
          />
        )}
      </main>
    </div>
  );
}

// Sub-components

function ModeButton({ 
  emoji, 
  label, 
  description, 
  onClick, 
  disabled, 
  color 
}: {
  emoji: string;
  label: string;
  description: string;
  onClick: () => void;
  disabled: boolean;
  color: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: '1 1 200px',
        background: disabled 
          ? 'rgba(255,255,255,0.05)' 
          : `linear-gradient(135deg, ${color}20, ${color}10)`,
        border: `1px solid ${disabled ? 'rgba(255,255,255,0.1)' : color + '40'}`,
        borderRadius: '16px',
        padding: '20px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>{emoji}</div>
      <div style={{ color: '#fff', fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
        {description}
      </div>
    </motion.button>
  );
}

function MovieSelectCard({
  movie,
  selected,
  onClick,
  isMobile,
}: {
  movie: Movie;
  selected: boolean;
  onClick: () => void;
  isMobile: boolean;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        position: 'relative',
        aspectRatio: '2/3',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        border: selected ? '3px solid #8b5cf6' : '3px solid transparent',
        boxShadow: selected ? '0 0 20px rgba(139, 92, 246, 0.3)' : 'none',
      }}
    >
      <img
        src={getPosterUrl(movie.poster_path, 'w185')}
        alt={movie.title}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: '#8b5cf6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '16px',
          }}
        >
          ✓
        </motion.div>
      )}
    </motion.div>
  );
}

function SwipeMode({
  movies,
  currentIndex,
  onSwipe,
  isMobile,
  t,
}: {
  movies: Movie[];
  currentIndex: number;
  onSwipe: (direction: 'left' | 'right') => void;
  isMobile: boolean;
  t: (key: string) => string;
}) {
  const movie = movies[currentIndex];
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipe('right');
    } else if (info.offset.x < -100) {
      onSwipe('left');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
      {/* Progress */}
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
        {currentIndex + 1} / {movies.length}
      </div>

      {/* Card */}
      <motion.div
        key={movie.id}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        style={{
          x,
          rotate,
          opacity,
          width: isMobile ? '280px' : '320px',
          cursor: 'grab',
        }}
        whileDrag={{ cursor: 'grabbing' }}
      >
        <LiquidSurface variant="container" cornerRadius={24} padding="0" style={{ overflow: 'hidden' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={getPosterUrl(movie.poster_path, 'w500')}
              alt={movie.title}
              style={{
                width: '100%',
                aspectRatio: '2/3',
                objectFit: 'cover',
                display: 'block',
              }}
              draggable={false}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '40px 20px 20px',
              background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
            }}>
              <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
                {movie.title}
              </h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                <span>⭐ {movie.vote_average?.toFixed(1)}</span>
                <span>•</span>
                <span>{movie.release_date?.split('-')[0]}</span>
              </div>
            </div>
          </div>
        </LiquidSurface>
      </motion.div>

      {/* Swipe Buttons */}
      <div style={{ display: 'flex', gap: '24px' }}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onSwipe('left')}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            border: 'none',
            cursor: 'pointer',
            fontSize: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
          }}
        >
          ✕
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onSwipe('right')}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            border: 'none',
            cursor: 'pointer',
            fontSize: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
          }}
        >
          ♥
        </motion.button>
      </div>

      <div style={{ display: 'flex', gap: '32px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
        <span>← {t('movieNight.swipeLeft')}</span>
        <span>{t('movieNight.swipeRight')} →</span>
      </div>
    </div>
  );
}

function VoteMode({
  movies,
  votes,
  onVote,
  onFinish,
  isMobile,
  t,
}: {
  movies: Movie[];
  votes: MovieVote[];
  onVote: (movieId: number) => void;
  onFinish: () => void;
  isMobile: boolean;
  t: (key: string) => string;
}) {
  const totalVotes = votes.reduce((sum, v) => sum + v.votes, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <LiquidSurface variant="container" cornerRadius={20} padding={isMobile ? '16px' : '24px'}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 600 }}>
            {t('movieNight.vote')} ({totalVotes} votes)
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onFinish}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 20px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Finish Voting
          </motion.button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
          {movies.map(movie => {
            const vote = votes.find(v => v.movieId === movie.id);
            const voteCount = vote?.votes || 0;
            const isLiked = vote?.liked || false;

            return (
              <motion.div
                key={movie.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onVote(movie.id)}
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '16px',
                  background: isLiked ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${isLiked ? '#8b5cf6' : 'transparent'}`,
                  cursor: 'pointer',
                }}
              >
                <img
                  src={getPosterUrl(movie.poster_path, 'w92')}
                  alt={movie.title}
                  style={{
                    width: '60px',
                    height: '90px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>
                    {movie.title}
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                    {movie.release_date?.split('-')[0]}
                  </p>
                  <div style={{
                    marginTop: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <span style={{
                      background: 'rgba(139, 92, 246, 0.3)',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      color: '#c4b5fd',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}>
                      {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </LiquidSurface>
    </div>
  );
}

function TimerMode({
  movies,
  seconds,
  isMobile,
  t,
}: {
  movies: Movie[];
  seconds: number;
  isMobile: boolean;
  t: (key: string) => string;
}) {
  const [highlightIndex, setHighlightIndex] = useState(0);

  // Rapidly cycle through movies
  useEffect(() => {
    if (seconds <= 0) return;
    const interval = setInterval(() => {
      setHighlightIndex(prev => (prev + 1) % movies.length);
    }, 100);
    return () => clearInterval(interval);
  }, [seconds, movies.length]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
      {/* Timer */}
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 40px rgba(245, 158, 11, 0.5)',
        }}
      >
        <span style={{ fontSize: '48px', fontWeight: 800, color: '#fff' }}>
          {seconds}
        </span>
      </motion.div>

      {/* Cycling movies */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(movies.length, 4)}, 1fr)`,
        gap: '12px',
        maxWidth: '400px',
      }}>
        {movies.map((movie, index) => (
          <motion.div
            key={movie.id}
            animate={{
              scale: index === highlightIndex ? 1.15 : 0.9,
              opacity: index === highlightIndex ? 1 : 0.4,
            }}
            transition={{ duration: 0.1 }}
            style={{
              borderRadius: '12px',
              overflow: 'hidden',
              border: index === highlightIndex ? '3px solid #f59e0b' : '3px solid transparent',
            }}
          >
            <img
              src={getPosterUrl(movie.poster_path, 'w154')}
              alt={movie.title}
              style={{
                width: '100%',
                aspectRatio: '2/3',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ResultMode({
  winner,
  onReset,
  isMobile,
  t,
}: {
  winner: Movie;
  onReset: () => void;
  isMobile: boolean;
  t: (key: string) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', duration: 0.6 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{ fontSize: '64px' }}
      >
        🎉
      </motion.div>

      <h2 style={{
        fontSize: '24px',
        fontWeight: 700,
        color: '#fff',
        textAlign: 'center',
      }}>
        {t('movieNight.winner')}
      </h2>

      <LiquidSurface variant="container" cornerRadius={24} padding="0" style={{ overflow: 'hidden', maxWidth: '320px' }}>
        <img
          src={getPosterUrl(winner.poster_path, 'w500')}
          alt={winner.title}
          style={{
            width: '100%',
            aspectRatio: '2/3',
            objectFit: 'cover',
            display: 'block',
          }}
        />
        <div style={{ padding: '20px' }}>
          <h3 style={{ color: '#fff', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
            {winner.title}
          </h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
            <span>⭐ {winner.vote_average?.toFixed(1)}</span>
            <span>•</span>
            <span>{winner.release_date?.split('-')[0]}</span>
          </div>
        </div>
      </LiquidSurface>

      <div style={{ display: 'flex', gap: '12px' }}>
        <Link to={`/movie/${winner.id}`}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 28px',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            View Movie
          </motion.button>
        </Link>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReset}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '14px 28px',
            color: '#fff',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Play Again
        </motion.button>
      </div>
    </motion.div>
  );
}
