"use client";

/**
 * Library Page
 * ============
 * Your personal movie collection hub with:
 * - Watchlist & Favorites
 * - Custom Collections
 * - Personal Ratings
 * - Watch History & Stats
 * - Movie Comparison Tool
 * 
 * All with beautiful liquid glass styling!
 */

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { LiquidSurface } from '~/components/Liquid/LiquidSurface';
import { useUserData } from '~/contexts/UserDataContext';
import { getMovieDetails, getPosterUrl, type Movie } from '~/services/tmdb';

type TabType = 'watchlist' | 'favorites' | 'collections' | 'ratings' | 'history' | 'stats' | 'compare';

const TABS: { id: TabType; label: string; emoji: string }[] = [
  { id: 'watchlist', label: 'Watchlist', emoji: '📋' },
  { id: 'favorites', label: 'Favorites', emoji: '❤️' },
  { id: 'collections', label: 'Collections', emoji: '📂' },
  { id: 'ratings', label: 'My Ratings', emoji: '⭐' },
  { id: 'history', label: 'History', emoji: '🕐' },
  { id: 'stats', label: 'Stats', emoji: '📊' },
  { id: 'compare', label: 'Compare', emoji: '⚖️' },
];

export function Library() {
  const [activeTab, setActiveTab] = useState<TabType>('watchlist');
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
        paddingTop: '100px',
        paddingBottom: '60px',
      }}
    >
      {/* Background Pattern */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 80% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)`,
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
          style={{ marginBottom: '32px' }}
        >
          <LiquidSurface
            variant="container"
            cornerRadius={24}
            padding={isMobile ? '20px' : '32px'}
          >
            <h1 style={{ 
              fontSize: isMobile ? '28px' : '36px', 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px',
            }}>
              📚 My Library
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px' }}>
              Your personal movie collection, all in one place
            </p>
          </LiquidSurface>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ 
            marginBottom: '32px',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
          className="hide-scrollbar"
        >
          <div style={{ 
            display: 'flex', 
            gap: isMobile ? '8px' : '12px',
            minWidth: 'max-content',
            padding: '4px',
          }}>
            {TABS.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LiquidSurface
                  variant="button"
                  cornerRadius={16}
                  padding={isMobile ? '10px 16px' : '12px 20px'}
                  style={{
                    background: activeTab === tab.id 
                      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.4) 0%, rgba(168, 85, 247, 0.4) 100%)'
                      : undefined,
                    border: activeTab === tab.id 
                      ? '1px solid rgba(99, 102, 241, 0.5)' 
                      : undefined,
                  }}
                >
                  <span style={{ 
                    fontSize: isMobile ? '13px' : '14px', 
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}>
                    {tab.emoji} {tab.label}
                  </span>
                </LiquidSurface>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'watchlist' && <WatchlistTab isMobile={isMobile} />}
            {activeTab === 'favorites' && <FavoritesTab isMobile={isMobile} />}
            {activeTab === 'collections' && <CollectionsTab isMobile={isMobile} />}
            {activeTab === 'ratings' && <RatingsTab isMobile={isMobile} />}
            {activeTab === 'history' && <HistoryTab isMobile={isMobile} />}
            {activeTab === 'stats' && <StatsTab isMobile={isMobile} />}
            {activeTab === 'compare' && <CompareTab isMobile={isMobile} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// ====== Watchlist Tab ======
function WatchlistTab({ isMobile }: { isMobile: boolean }) {
  const { watchlist, removeFromWatchlist } = useUserData();

  if (watchlist.length === 0) {
    return <EmptyState emoji="📋" title="Your watchlist is empty" subtitle="Add movies you want to watch later!" />;
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: isMobile ? '12px' : '20px',
    }}>
      {watchlist.map((movie, index) => (
        <MovieGridCard
          key={movie.id}
          movie={movie}
          index={index}
          isMobile={isMobile}
          onRemove={() => removeFromWatchlist(movie.id)}
          removeLabel="Remove"
        />
      ))}
    </div>
  );
}

// ====== Favorites Tab ======
function FavoritesTab({ isMobile }: { isMobile: boolean }) {
  const { favorites, removeFromFavorites } = useUserData();

  if (favorites.length === 0) {
    return <EmptyState emoji="❤️" title="No favorites yet" subtitle="Heart movies you love to save them here!" />;
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: isMobile ? '12px' : '20px',
    }}>
      {favorites.map((movie, index) => (
        <MovieGridCard
          key={movie.id}
          movie={movie}
          index={index}
          isMobile={isMobile}
          onRemove={() => removeFromFavorites(movie.id)}
          removeLabel="Unfavorite"
          showHeart
        />
      ))}
    </div>
  );
}

// ====== Collections Tab ======
function CollectionsTab({ isMobile }: { isMobile: boolean }) {
  const { collections, createCollection, deleteCollection } = useUserData();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('🎬');
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  const handleCreate = () => {
    if (newName.trim()) {
      createCollection(newName.trim(), newEmoji, '');
      setNewName('');
      setNewEmoji('🎬');
      setShowCreate(false);
    }
  };

  const selectedCol = collections.find(c => c.id === selectedCollection);

  return (
    <div>
      {/* Create New Collection Button */}
      <div style={{ marginBottom: '24px' }}>
        <motion.button
          onClick={() => setShowCreate(!showCreate)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <LiquidSurface variant="button" cornerRadius={16} padding="14px 24px">
            <span style={{ fontWeight: 600 }}>➕ Create New Collection</span>
          </LiquidSurface>
        </motion.button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginBottom: '24px' }}
          >
            <LiquidSurface variant="container" cornerRadius={20} padding="24px">
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                  value={newEmoji}
                  onChange={(e) => setNewEmoji(e.target.value)}
                  style={{
                    padding: '12px',
                    fontSize: '24px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  {['🎬', '💕', '😊', '🍿', '🎭', '🔥', '⚡', '🌙', '🎪', '🏆'].map(e => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Collection name..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: '200px',
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '16px',
                    outline: 'none',
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
                <motion.button onClick={handleCreate} whileTap={{ scale: 0.95 }}>
                  <LiquidSurface 
                    variant="button" 
                    cornerRadius={12} 
                    padding="12px 20px"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
                  >
                    <span style={{ fontWeight: 600 }}>Create</span>
                  </LiquidSurface>
                </motion.button>
              </div>
            </LiquidSurface>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collection Grid or Selected Collection */}
      {selectedCollection && selectedCol ? (
        <CollectionDetail
          collection={selectedCol}
          isMobile={isMobile}
          onBack={() => setSelectedCollection(null)}
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}>
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <LiquidSurface variant="card" cornerRadius={20} padding="20px">
                <div 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedCollection(collection.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '32px' }}>{collection.emoji}</span>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{collection.name}</h3>
                      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
                        {collection.movieIds.length} movies
                      </p>
                    </div>
                  </div>
                  {collection.description && (
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                      {collection.description}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <motion.button
                    onClick={() => setSelectedCollection(collection.id)}
                    whileTap={{ scale: 0.95 }}
                    style={{ flex: 1 }}
                  >
                    <LiquidSurface variant="button" cornerRadius={10} padding="8px 16px">
                      <span style={{ fontSize: '13px' }}>View →</span>
                    </LiquidSurface>
                  </motion.button>
                  {!['date-night', 'feel-good', 'movie-marathon'].includes(collection.id) && (
                    <motion.button
                      onClick={(e) => { e.stopPropagation(); deleteCollection(collection.id); }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <LiquidSurface 
                        variant="button" 
                        cornerRadius={10} 
                        padding="8px 12px"
                        style={{ background: 'rgba(239, 68, 68, 0.2)' }}
                      >
                        <span style={{ fontSize: '13px' }}>🗑️</span>
                      </LiquidSurface>
                    </motion.button>
                  )}
                </div>
              </LiquidSurface>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ====== Collection Detail View ======
function CollectionDetail({ 
  collection, 
  isMobile, 
  onBack 
}: { 
  collection: { id: string; name: string; emoji: string; movieIds: number[] }; 
  isMobile: boolean;
  onBack: () => void;
}) {
  const { removeFromCollection } = useUserData();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovies() {
      setLoading(true);
      try {
        const moviePromises = collection.movieIds.map(id => getMovieDetails(id));
        const results = await Promise.all(moviePromises);
        setMovies(results);
      } catch (error) {
        console.error('Failed to fetch collection movies:', error);
      }
      setLoading(false);
    }
    if (collection.movieIds.length > 0) {
      fetchMovies();
    } else {
      setLoading(false);
    }
  }, [collection.movieIds]);

  return (
    <div>
      <motion.button
        onClick={onBack}
        style={{ marginBottom: '20px' }}
        whileTap={{ scale: 0.95 }}
      >
        <LiquidSurface variant="button" cornerRadius={12} padding="10px 20px">
          <span>← Back to Collections</span>
        </LiquidSurface>
      </motion.button>

      <LiquidSurface variant="container" cornerRadius={24} padding="24px" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700 }}>
          {collection.emoji} {collection.name}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>
          {collection.movieIds.length} movies in this collection
        </p>
      </LiquidSurface>

      {loading ? (
        <LoadingState />
      ) : movies.length === 0 ? (
        <EmptyState emoji={collection.emoji} title="Collection is empty" subtitle="Add movies from their detail pages!" />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: isMobile ? '12px' : '20px',
        }}>
          {movies.map((movie, index) => (
            <MovieGridCard
              key={movie.id}
              movie={movie}
              index={index}
              isMobile={isMobile}
              onRemove={() => removeFromCollection(collection.id, movie.id)}
              removeLabel="Remove"
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ====== Ratings Tab ======
function RatingsTab({ isMobile }: { isMobile: boolean }) {
  const { ratings, removeUserRating } = useUserData();
  const [movies, setMovies] = useState<(Movie & { userRating: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRatedMovies() {
      setLoading(true);
      try {
        const moviePromises = ratings.map(async (r) => {
          const movie = await getMovieDetails(r.movieId);
          return { ...movie, userRating: r.rating };
        });
        const results = await Promise.all(moviePromises);
        // Sort by rating descending
        results.sort((a, b) => b.userRating - a.userRating);
        setMovies(results);
      } catch (error) {
        console.error('Failed to fetch rated movies:', error);
      }
      setLoading(false);
    }
    if (ratings.length > 0) {
      fetchRatedMovies();
    } else {
      setLoading(false);
    }
  }, [ratings]);

  if (loading) return <LoadingState />;

  if (movies.length === 0) {
    return <EmptyState emoji="⭐" title="No ratings yet" subtitle="Rate movies you've watched to track your opinions!" />;
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: isMobile ? '12px' : '20px',
    }}>
      {movies.map((movie, index) => (
        <motion.div
          key={movie.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
        >
          <Link to={`/movie/${movie.id}`} style={{ textDecoration: 'none' }}>
            <LiquidSurface variant="card" cornerRadius={isMobile ? 14 : 18} padding="0">
              <div style={{ position: 'relative' }}>
                <img
                  src={getPosterUrl(movie.poster_path, 'w342')}
                  alt={movie.title}
                  style={{
                    width: '100%',
                    aspectRatio: '2/3',
                    objectFit: 'cover',
                    borderRadius: isMobile ? '14px 14px 0 0' : '18px 18px 0 0',
                  }}
                />
                {/* Your Rating Badge */}
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  fontWeight: 700,
                  fontSize: '14px',
                }}>
                  ⭐ {movie.userRating}/10
                </div>
              </div>
              <div style={{ padding: isMobile ? '10px' : '14px' }}>
                <h4 style={{ 
                  fontSize: isMobile ? '13px' : '14px', 
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {movie.title}
                </h4>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                  TMDB: {movie.vote_average?.toFixed(1)}
                </p>
              </div>
            </LiquidSurface>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

// ====== History Tab ======
function HistoryTab({ isMobile }: { isMobile: boolean }) {
  const { viewHistory, clearViewHistory } = useUserData();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistoryMovies() {
      setLoading(true);
      try {
        const moviePromises = viewHistory.slice(0, 50).map(h => getMovieDetails(h.movieId));
        const results = await Promise.all(moviePromises);
        setMovies(results);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      }
      setLoading(false);
    }
    if (viewHistory.length > 0) {
      fetchHistoryMovies();
    } else {
      setLoading(false);
    }
  }, [viewHistory]);

  if (loading) return <LoadingState />;

  if (movies.length === 0) {
    return <EmptyState emoji="🕐" title="No watch history" subtitle="Movies you view will appear here!" />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <motion.button onClick={clearViewHistory} whileTap={{ scale: 0.95 }}>
          <LiquidSurface 
            variant="button" 
            cornerRadius={12} 
            padding="10px 16px"
            style={{ background: 'rgba(239, 68, 68, 0.2)' }}
          >
            <span style={{ fontSize: '14px' }}>🗑️ Clear History</span>
          </LiquidSurface>
        </motion.button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: isMobile ? '12px' : '20px',
      }}>
        {movies.map((movie, index) => (
          <MovieGridCard
            key={movie.id}
            movie={movie}
            index={index}
            isMobile={isMobile}
          />
        ))}
      </div>
    </div>
  );
}

// ====== Stats Tab ======
function StatsTab({ isMobile }: { isMobile: boolean }) {
  const { stats, ratings, favorites, watchlist, viewHistory } = useUserData();

  const statCards = [
    { label: 'Movies Discovered', value: stats.totalMoviesDiscovered, emoji: '🎬', color: '#6366f1' },
    { label: 'In Watchlist', value: stats.watchlistCount, emoji: '📋', color: '#10b981' },
    { label: 'Favorites', value: stats.favoritesCount, emoji: '❤️', color: '#ef4444' },
    { label: 'Movies Rated', value: stats.ratingsCount, emoji: '⭐', color: '#f59e0b' },
    { label: 'Avg Rating', value: stats.averageRating.toFixed(1), emoji: '📊', color: '#8b5cf6' },
    { label: 'Collections', value: stats.collectionsCount, emoji: '📂', color: '#ec4899' },
  ];

  return (
    <div>
      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <LiquidSurface variant="card" cornerRadius={20} padding="24px">
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '40px' }}>{stat.emoji}</span>
                <h3 style={{ 
                  fontSize: '36px', 
                  fontWeight: 800, 
                  color: stat.color,
                  marginTop: '8px',
                }}>
                  {stat.value}
                </h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
                  {stat.label}
                </p>
              </div>
            </LiquidSurface>
          </motion.div>
        ))}
      </div>

      {/* Rating Distribution */}
      {ratings.length > 0 && (
        <LiquidSurface variant="container" cornerRadius={24} padding="24px">
          <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>
            📈 Your Rating Distribution
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '150px' }}>
            {Array.from({ length: 10 }, (_, i) => {
              const rating = i + 1;
              const count = ratings.filter(r => Math.round(r.rating) === rating).length;
              const maxCount = Math.max(...Array.from({ length: 10 }, (_, j) => 
                ratings.filter(r => Math.round(r.rating) === j + 1).length
              ));
              const height = maxCount > 0 ? (count / maxCount) * 120 : 0;
              
              return (
                <div key={rating} style={{ flex: 1, textAlign: 'center' }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(height, 4)}px` }}
                    transition={{ delay: 0.3 + rating * 0.05 }}
                    style={{
                      background: `linear-gradient(to top, rgba(99, 102, 241, ${0.3 + (rating / 10) * 0.7}), rgba(168, 85, 247, ${0.3 + (rating / 10) * 0.7}))`,
                      borderRadius: '4px 4px 0 0',
                      marginBottom: '8px',
                    }}
                  />
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{rating}</span>
                  {count > 0 && (
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                      ({count})
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </LiquidSurface>
      )}
    </div>
  );
}

// ====== Compare Tab ======
function CompareTab({ isMobile }: { isMobile: boolean }) {
  const { comparison, clearComparison, removeFromComparison } = useUserData();
  const [movies, setMovies] = useState<(Movie | null)[]>([null, null, null]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchComparisonMovies() {
      setLoading(true);
      try {
        const moviePromises = comparison.map(async (slot) => {
          if (slot.movieId) {
            return getMovieDetails(slot.movieId);
          }
          return null;
        });
        const results = await Promise.all(moviePromises);
        setMovies(results);
      } catch (error) {
        console.error('Failed to fetch comparison movies:', error);
      }
      setLoading(false);
    }
    fetchComparisonMovies();
  }, [comparison]);

  const filledSlots = movies.filter(m => m !== null).length;

  return (
    <div>
      <LiquidSurface variant="container" cornerRadius={24} padding="24px" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600 }}>⚖️ Movie Comparison</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginTop: '4px' }}>
              Compare up to 3 movies side by side. Add movies from their detail pages!
            </p>
          </div>
          {filledSlots > 0 && (
            <motion.button onClick={clearComparison} whileTap={{ scale: 0.95 }}>
              <LiquidSurface variant="button" cornerRadius={12} padding="10px 16px">
                <span style={{ fontSize: '14px' }}>Clear All</span>
              </LiquidSurface>
            </motion.button>
          )}
        </div>
      </LiquidSurface>

      {loading ? (
        <LoadingState />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: '20px',
        }}>
          {movies.map((movie, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {movie ? (
                <LiquidSurface variant="card" cornerRadius={24} padding="20px">
                  <div style={{ position: 'relative' }}>
                    <motion.button
                      onClick={() => removeFromComparison(index)}
                      style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        zIndex: 10,
                        background: 'rgba(239, 68, 68, 0.9)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ✕
                    </motion.button>
                    <img
                      src={getPosterUrl(movie.poster_path, 'w342')}
                      alt={movie.title}
                      style={{
                        width: '100%',
                        aspectRatio: '2/3',
                        objectFit: 'cover',
                        borderRadius: '16px',
                        marginBottom: '16px',
                      }}
                    />
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>
                      {movie.title}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <ComparisonRow label="Rating" value={`⭐ ${movie.vote_average?.toFixed(1)}`} />
                      <ComparisonRow label="Year" value={movie.release_date?.split('-')[0]} />
                      <ComparisonRow label="Runtime" value={movie.runtime ? `${movie.runtime} min` : 'N/A'} />
                      <ComparisonRow label="Genres" value={movie.genres?.slice(0, 2).map(g => g.name).join(', ') || 'N/A'} />
                    </div>
                  </div>
                </LiquidSurface>
              ) : (
                <LiquidSurface 
                  variant="card" 
                  cornerRadius={24} 
                  padding="40px"
                  style={{ 
                    minHeight: isMobile ? '200px' : '400px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                    <span style={{ fontSize: '48px' }}>➕</span>
                    <p style={{ marginTop: '12px', fontSize: '14px' }}>Slot {index + 1}</p>
                    <p style={{ fontSize: '12px', marginTop: '4px' }}>Add from movie page</p>
                  </div>
                </LiquidSurface>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ====== Shared Components ======

function MovieGridCard({ 
  movie, 
  index, 
  isMobile, 
  onRemove,
  removeLabel,
  showHeart
}: { 
  movie: { id: number; title: string; poster_path: string | null; vote_average?: number };
  index: number;
  isMobile: boolean;
  onRemove?: () => void;
  removeLabel?: string;
  showHeart?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <LiquidSurface variant="card" cornerRadius={isMobile ? 14 : 18} padding="0">
        <div style={{ position: 'relative' }}>
          <Link to={`/movie/${movie.id}`}>
            <img
              src={getPosterUrl(movie.poster_path, 'w342')}
              alt={movie.title}
              style={{
                width: '100%',
                aspectRatio: '2/3',
                objectFit: 'cover',
                borderRadius: isMobile ? '14px 14px 0 0' : '18px 18px 0 0',
              }}
            />
            {showHeart && (
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                fontSize: '20px',
              }}>
                ❤️
              </div>
            )}
            {movie.vote_average && (
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
                ⭐ {movie.vote_average.toFixed(1)}
              </div>
            )}
          </Link>
        </div>
        <div style={{ padding: isMobile ? '10px' : '14px' }}>
          <Link to={`/movie/${movie.id}`} style={{ textDecoration: 'none' }}>
            <h4 style={{ 
              fontSize: isMobile ? '13px' : '14px', 
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: '#fff',
            }}>
              {movie.title}
            </h4>
          </Link>
          {onRemove && (
            <motion.button
              onClick={onRemove}
              style={{
                marginTop: '8px',
                width: '100%',
                padding: '6px',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#fca5a5',
                fontSize: '12px',
                cursor: 'pointer',
              }}
              whileTap={{ scale: 0.95 }}
            >
              {removeLabel || 'Remove'}
            </motion.button>
          )}
        </div>
      </LiquidSurface>
    </motion.div>
  );
}

function ComparisonRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
      <span style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function EmptyState({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
  return (
    <LiquidSurface variant="container" cornerRadius={24} padding="60px 40px">
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '64px' }}>{emoji}</span>
        <h3 style={{ fontSize: '24px', fontWeight: 600, marginTop: '16px' }}>{title}</h3>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>{subtitle}</p>
        <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '24px' }}>
          <LiquidSurface variant="button" cornerRadius={16} padding="14px 28px">
            <span style={{ fontWeight: 600 }}>🎬 Browse Movies</span>
          </LiquidSurface>
        </Link>
      </div>
    </LiquidSurface>
  );
}

function LoadingState() {
  return (
    <LiquidSurface variant="container" cornerRadius={24} padding="60px">
      <div style={{ textAlign: 'center' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          style={{ fontSize: '48px', display: 'inline-block' }}
        >
          🎬
        </motion.div>
        <p style={{ marginTop: '16px', color: 'rgba(255,255,255,0.6)' }}>Loading...</p>
      </div>
    </LiquidSurface>
  );
}

export default Library;
