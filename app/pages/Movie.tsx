"use client";

/**
 * Movie Detail Page
 * =================
 * USES LIQUIDGLASS for:
 * - Main movie info container
 * - Cast cards
 * - Similar movies section
 * - All interactive elements
 * 
 * Now includes:
 * - Add to Watchlist / Favorites
 * - Personal Rating
 * - Add to Collection
 * - Add to Comparison
 * - AI-powered "More Like This" insights
 */

import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Surface } from '~/components/Surface';
import { MovieCard } from '~/components/MovieCard';
import { AIResponseCard } from '~/components/AIResponseCard';
import { StreamingAvailability } from '~/components/StreamingAvailability';
import { SoundtrackLinks } from '~/components/SoundtrackLinks';
import { CalendarButton } from '~/components/CalendarButton';
import { MovieReviews } from '~/components/MovieReviews';
import { SkeletonMovieDetail } from '~/components/SkeletonLoading';
import { useUserData } from '~/contexts/UserDataContext';
import { explainMovieConnections } from '~/services/ai';
import { getComposerFromCredits } from '~/services/soundtrack';
import {
  getMovieDetails,
  getMovieCredits,
  getSimilarMovies,
  getMovieVideos,
  getBackdropUrl,
  getPosterUrl,
  getProfileUrl,
  type Movie,
  type Credits,
  type Video,
} from '~/services/tmdb';


export function MoviePage() {
  const { id } = useParams();
  const movieId = parseInt(id || '0', 10);
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [aiInsightLoading, setAiInsightLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // User data hooks
  const { addToViewHistory } = useUserData();

  useEffect(() => {
    if (!movieId) return;
    
    async function fetchMovieData() {
      setLoading(true);
      setAiInsight('');
      try {
        const [movieData, creditsData, similarData, videosData] = await Promise.all([
          getMovieDetails(movieId),
          getMovieCredits(movieId),
          getSimilarMovies(movieId),
          getMovieVideos(movieId),
        ]);
        setMovie(movieData);
        setCredits(creditsData);
        setSimilar(similarData);
        setVideos(videosData);
        
        // Track in view history
        addToViewHistory(movieId);
        
        // Fetch AI insight for similar movies (non-blocking)
        if (similarData.length > 0) {
          setAiInsightLoading(true);
          explainMovieConnections(movieData, similarData.slice(0, 4))
            .then(insight => setAiInsight(insight))
            .catch(() => setAiInsight(''))
            .finally(() => setAiInsightLoading(false));
        }
      } catch (error) {
        console.error('Failed to fetch movie data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMovieData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [movieId, addToViewHistory]);

  if (loading) {
    return (
      <div style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        background: '#0a0a0a',
        color: '#fff',
      }}>
        <SkeletonMovieDetail />
      </div>
    );
  }

  if (!movie) {
    return <MovieNotFound />;
  }

  const director = credits?.crew.find((c) => c.job === 'Director');
  const topCast = credits?.cast.slice(0, 8) || [];
  const genres = movie.genres?.map((g) => g.name).join(', ') || 'N/A';

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        background: '#0a0a0a',
        color: '#fff',
        overflow: 'hidden',
      }}
    >
      {/* Backdrop Background */}
      <motion.div
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${getBackdropUrl(movie.backdrop_path, 'original')})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
        }}
      />
      
      {/* Gradient Overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(10,10,10,0.8) 50%, #0a0a0a 100%)',
          zIndex: 1,
        }}
      />

      {/* Main Content */}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          paddingTop: isMobile ? '80px' : '120px',
          paddingBottom: 'max(80px, calc(80px + env(safe-area-inset-bottom)))',
          paddingLeft: 'max(24px, env(safe-area-inset-left))',
          paddingRight: 'max(24px, env(safe-area-inset-right))',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginBottom: '32px' }}
        >
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <Surface
              variant="button"
              padding="10px 20px"
              cornerRadius={50}
              displacementScale={40}
            >
              <span style={{ color: '#fff', fontWeight: 500 }}>← Back to Home</span>
            </Surface>
          </Link>
        </motion.div>

        {/* Movie Header - LIQUIDGLASS */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ marginBottom: '48px' }}
        >
          <Surface
            variant="modal"
            cornerRadius={32}
            padding="40px"
            displacementScale={70}
            aberrationIntensity={3}
            mouseContainer={containerRef}
          >
            <div
              style={{
                display: 'flex',
                gap: '40px',
                flexWrap: 'wrap',
              }}
            >
              {/* Poster */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                style={{ flexShrink: 0 }}
              >
                <Surface
                  variant="card"
                  cornerRadius={20}
                  padding="0"
                >
                  <img
                    src={getPosterUrl(movie.poster_path, 'w500')}
                    alt={movie.title}
                    style={{
                      width: '300px',
                      height: 'auto',
                      borderRadius: '16px',
                      display: 'block',
                    }}
                  />
                </Surface>
              </motion.div>

              {/* Movie Info */}
              <div style={{ flex: 1, minWidth: '300px' }}>
                {/* Title & Tagline */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h1 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>
                    {movie.title}
                  </h1>
                  {movie.tagline && (
                    <p style={{ fontSize: '18px', fontStyle: 'italic', opacity: 0.7, marginBottom: '24px' }}>
                      "{movie.tagline}"
                    </p>
                  )}
                </motion.div>

                {/* Meta Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}
                >
                  <Surface
                    variant="button"
                    padding="8px 16px"
                    cornerRadius={12}
                    displacementScale={35}
                  >
                    <span style={{ fontWeight: 600 }}>⭐ {movie.vote_average?.toFixed(1)}</span>
                  </Surface>
                  
                  <Surface
                    variant="button"
                    padding="8px 16px"
                    cornerRadius={12}
                    displacementScale={35}
                  >
                    <span style={{ fontWeight: 600 }}>📅 {movie.release_date?.split('-')[0]}</span>
                  </Surface>
                  
                  {movie.runtime && (
                    <Surface
                      variant="button"
                      padding="8px 16px"
                      cornerRadius={12}
                      displacementScale={35}
                    >
                      <span style={{ fontWeight: 600 }}>⏱ {movie.runtime} min</span>
                    </Surface>
                  )}
                </motion.div>

                {/* Genres */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                  style={{ marginBottom: '16px' }}
                >
                  <span style={{ opacity: 0.6, marginRight: '8px' }}>Genres:</span>
                  <span style={{ fontWeight: 500 }}>{genres}</span>
                </motion.div>

                {/* Director */}
                {director && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    style={{ marginBottom: '24px' }}
                  >
                    <span style={{ opacity: 0.6, marginRight: '8px' }}>Director:</span>
                    <Link
                      to={`/person/${director.id}`}
                      style={{
                        fontWeight: 500,
                        color: '#fff',
                        textDecoration: 'none',
                        borderBottom: '1px solid rgba(255,255,255,0.3)',
                        transition: 'border-color 0.2s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#667eea')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)')}
                    >
                      {director.name}
                    </Link>
                  </motion.div>
                )}

                {/* Overview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 }}
                >
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>Overview</h3>
                  <p style={{ lineHeight: 1.7, opacity: 0.85 }}>{movie.overview}</p>
                </motion.div>

                {/* Watch Trailer Button */}
                {videos.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    style={{ marginTop: '24px' }}
                  >
                    <Link to={`/movie/${movieId}/trailer`} style={{ textDecoration: 'none' }}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '14px 28px',
                          background: 'linear-gradient(135deg, #e50914 0%, #b81d24 100%)',
                          borderRadius: '50px',
                          color: '#fff',
                          fontSize: '16px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          boxShadow: '0 4px 20px rgba(229, 9, 20, 0.4)',
                        }}
                      >
                        <span style={{ fontSize: '20px' }}>▶</span>
                        Watch Trailer
                      </motion.div>
                    </Link>
                  </motion.div>
                )}

                {/* Streaming Availability */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85 }}
                >
                  <StreamingAvailability movieId={movieId} variant="default" />
                </motion.div>

                {/* Soundtrack Links */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <SoundtrackLinks 
                    movie={movie} 
                    composer={credits ? getComposerFromCredits(credits.crew) : undefined}
                    variant="default" 
                  />
                </motion.div>

                {/* Calendar - for upcoming movies */}
                {movie.release_date && new Date(movie.release_date) > new Date() && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.95 }}
                  >
                    <CalendarButton movie={movie} variant="release" />
                  </motion.div>
                )}

                {/* Action Buttons */}
                <MovieActions movie={movie} />
              </div>
            </div>
          </Surface>
        </motion.section>

        {/* Cast Section - LIQUIDGLASS */}
        {topCast.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '48px' }}
          >
            <div style={{ marginBottom: '24px', display: 'inline-block' }}>
              <Surface
                variant="container"
                cornerRadius={20}
                padding="20px 28px"
                blurAmount={0.1}
                displacementScale={45}
                mouseContainer={containerRef}
              >
                <h2 style={{ fontSize: '24px', fontWeight: 600 }}>🎭 Top Cast</h2>
              </Surface>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(160px, 45vw), 1fr))',
                gap: '20px',
              }}
            >
              {topCast.map((member, index) => (
                <Link
                  key={member.id}
                  to={`/person/${member.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    style={{ cursor: 'pointer' }}
                  >
                    <Surface
                      variant="card"
                      cornerRadius={16}
                      padding="12px"
                      displacementScale={50}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            margin: '0 auto 12px',
                          }}
                        >
                          <img
                            src={getProfileUrl(member.profile_path, 'w185')}
                            alt={member.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23333" width="100" height="100"/><text x="50" y="55" font-size="40" text-anchor="middle" fill="%23666">👤</text></svg>';
                            }}
                          />
                        </div>
                        <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px', color: '#fff' }}>{member.name}</p>
                        <p style={{ fontSize: '12px', opacity: 0.6, color: '#fff' }}>{member.character}</p>
                      </div>
                    </Surface>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {/* Movie Reviews Section */}
        {movie && (
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '60px' }}
          >
            <MovieReviews movieId={movieId} movieTitle={movie.title} />
          </motion.section>
        )}

        {/* Similar Movies Section - Enhanced with AI Insights */}
        {similar.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <Surface
                variant="container"
                cornerRadius={20}
                padding="20px 28px"
                blurAmount={0.1}
                displacementScale={45}
                mouseContainer={containerRef}
              >
                <h2 style={{ fontSize: '24px', fontWeight: 600 }}>🤖 More Like This</h2>
              </Surface>
            </div>

            {/* AI Insight Card */}
            <AnimatePresence>
              {(aiInsight || aiInsightLoading) && (
                <div style={{ marginBottom: '28px' }}>
                  <AIResponseCard
                    content={aiInsight}
                    isLoading={aiInsightLoading}
                    variant="compact"
                    containerRef={containerRef}
                  />
                </div>
              )}
            </AnimatePresence>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 45vw), 1fr))',
                gap: '24px',
              }}
            >
              {similar.slice(0, 6).map((m, index) => (
                <MovieCard key={m.id} movie={m} index={index} />
              ))}
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
}

function MovieLoadingScreen() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0a0a0a',
      }}
    >
      <Surface
        variant="modal"
        cornerRadius={24}
        padding="40px"
      >
        <div style={{ textAlign: 'center' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            style={{ fontSize: '48px', marginBottom: '16px' }}
          >
            🎬
          </motion.div>
          <p style={{ color: '#fff', fontSize: '18px' }}>Loading movie details...</p>
        </div>
      </Surface>
    </div>
  );
}

function MovieNotFound() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0a0a0a',
      }}
    >
      <Surface
        variant="modal"
        cornerRadius={24}
        padding="40px"
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div>
          <h2 style={{ color: '#fff', fontSize: '24px', marginBottom: '8px' }}>Movie Not Found</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>
            We couldn't find the movie you're looking for.
          </p>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <Surface
              variant="button"
              padding="12px 24px"
              cornerRadius={50}
            >
              <span style={{ color: '#fff', fontWeight: 500 }}>← Back to Home</span>
            </Surface>
          </Link>
        </div>
      </Surface>
    </div>
  );
}

// ====== Movie Actions Component ======
function MovieActions({ movie }: { movie: Movie }) {
  const {
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    isFavorite,
    toggleFavorite,
    getUserRating,
    setUserRating,
    collections,
    addToCollection,
    removeFromCollection,
    isInCollection,
    addToComparison,
    isInComparison,
    comparison,
  } = useUserData();

  const [showRating, setShowRating] = useState(false);
  const [showCollections, setShowCollections] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  const inWatchlist = isInWatchlist(movie.id);
  const isFav = isFavorite(movie.id);
  const userRating = getUserRating(movie.id);
  const comparisonSlot = isInComparison(movie.id);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Find next available comparison slot
  const getNextComparisonSlot = () => {
    for (let i = 0; i < 3; i++) {
      if (!comparison[i].movieId) return i;
    }
    return -1;
  };

  const handleAddToComparison = () => {
    if (comparisonSlot >= 0) return; // Already in comparison
    const slot = getNextComparisonSlot();
    if (slot >= 0) {
      addToComparison(movie.id, slot);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      style={{ marginTop: '28px' }}
    >
      {/* Primary Actions */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(160px, 1fr))', 
        gap: '12px', 
        marginBottom: '16px' 
      }}>
        {/* Watchlist Button */}
        <motion.button
          onClick={() => inWatchlist ? removeFromWatchlist(movie.id) : addToWatchlist(movie)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Surface
            variant="button"
            cornerRadius={14}
            padding="14px 20px"
            style={{
              background: inWatchlist 
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.4), rgba(6, 182, 212, 0.4))'
                : undefined,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '14px' }}>
              {inWatchlist ? '✓ In Watchlist' : '📋 Add to Watchlist'}
            </span>
          </Surface>
        </motion.button>

        {/* Favorite Button */}
        <motion.button
          onClick={() => toggleFavorite(movie)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Surface
            variant="button"
            cornerRadius={14}
            padding="14px 20px"
            style={{
              background: isFav 
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.4), rgba(236, 72, 153, 0.4))'
                : undefined,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '14px' }}>
              {isFav ? '❤️ Favorited' : '🤍 Favorite'}
            </span>
          </Surface>
        </motion.button>

        {/* Rate Button */}
        <motion.button
          onClick={() => setShowRating(!showRating)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Surface
            variant="button"
            cornerRadius={14}
            padding="14px 20px"
            style={{
              background: userRating 
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.4), rgba(249, 115, 22, 0.4))'
                : undefined,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '14px' }}>
              {userRating ? `⭐ ${userRating}/10` : '⭐ Rate'}
            </span>
          </Surface>
        </motion.button>

        {/* Collection Button */}
        <motion.button
          onClick={() => setShowCollections(!showCollections)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Surface 
            variant="button" 
            cornerRadius={14} 
            padding="14px 20px"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '14px' }}>📂 Add to Collection</span>
          </Surface>
        </motion.button>

        {/* Compare Button */}
        <motion.button
          onClick={handleAddToComparison}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={comparisonSlot >= 0 || getNextComparisonSlot() < 0}
          style={{ opacity: (comparisonSlot >= 0 || getNextComparisonSlot() < 0) ? 0.6 : 1 }}
        >
          <Surface
            variant="button"
            cornerRadius={14}
            padding="14px 20px"
            style={{
              background: comparisonSlot >= 0 
                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(168, 85, 247, 0.4))'
                : undefined,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '14px' }}>
              {comparisonSlot >= 0 ? '⚖️ In Compare' : '⚖️ Compare'}
            </span>
          </Surface>
        </motion.button>
      </div>

      {/* Rating Picker */}
      <AnimatePresence>
        {showRating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginBottom: '16px' }}
          >
            <Surface variant="container" cornerRadius={16} padding="16px">
              <p style={{ fontSize: '14px', marginBottom: '12px', color: 'rgba(255,255,255,0.7)' }}>
                How would you rate this movie?
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((rating) => (
                  <motion.button
                    key={rating}
                    onClick={() => {
                      setUserRating(movie.id, rating);
                      setShowRating(false);
                    }}
                    onMouseEnter={() => setHoveredRating(rating)}
                    onMouseLeave={() => setHoveredRating(null)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      border: 'none',
                      background: (hoveredRating !== null ? rating <= hoveredRating : rating <= (userRating || 0))
                        ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
                        : 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    {rating}
                  </motion.button>
                ))}
              </div>
            </Surface>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collection Picker */}
      <AnimatePresence>
        {showCollections && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Surface variant="container" cornerRadius={16} padding="16px">
              <p style={{ fontSize: '14px', marginBottom: '12px', color: 'rgba(255,255,255,0.7)' }}>
                Add to a collection:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {collections.map((collection) => {
                  const inCollection = isInCollection(collection.id, movie.id);
                  return (
                    <motion.button
                      key={collection.id}
                      onClick={() => {
                        if (inCollection) {
                          removeFromCollection(collection.id, movie.id);
                        } else {
                          addToCollection(collection.id, movie.id);
                        }
                      }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Surface
                        variant="button"
                        cornerRadius={10}
                        padding="8px 14px"
                        style={{
                          background: inCollection 
                            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(168, 85, 247, 0.4))'
                            : undefined,
                        }}
                      >
                        <span style={{ fontSize: '13px' }}>
                          {collection.emoji} {collection.name}
                          {inCollection && ' ✓'}
                        </span>
                      </Surface>
                    </motion.button>
                  );
                })}
              </div>
              <Link 
                to="/library" 
                style={{ 
                  display: 'inline-block', 
                  marginTop: '12px', 
                  fontSize: '13px', 
                  color: 'rgba(255,255,255,0.5)',
                  textDecoration: 'underline',
                }}
              >
                Manage collections →
              </Link>
            </Surface>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default MoviePage;
