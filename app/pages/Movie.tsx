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
import { LiquidSurface } from '~/components/Liquid/LiquidSurface';
import { MovieCard } from '~/components/MovieCard';
import { AIResponseCard } from '~/components/AIResponseCard';
import { useUserData } from '~/contexts/UserDataContext';
import { explainMovieConnections } from '~/services/ai';
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
  const [showTrailer, setShowTrailer] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // User data hooks
  const { addToViewHistory } = useUserData();

  useEffect(() => {
    if (!movieId) return;
    
    async function fetchMovieData() {
      setLoading(true);
      setAiInsight('');
      setShowTrailer(false);
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
    return <MovieLoadingScreen />;
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
          paddingTop: '120px',
          paddingBottom: '80px',
          paddingLeft: '24px',
          paddingRight: '24px',
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
            <LiquidSurface
              variant="button"
              padding="10px 20px"
              cornerRadius={50}
              displacementScale={40}
            >
              <span style={{ color: '#fff', fontWeight: 500 }}>← Back to Home</span>
            </LiquidSurface>
          </Link>
        </motion.div>

        {/* Movie Header - LIQUIDGLASS */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ marginBottom: '48px' }}
        >
          <LiquidSurface
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
                <LiquidSurface
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
                </LiquidSurface>
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
                  <LiquidSurface
                    variant="button"
                    padding="8px 16px"
                    cornerRadius={12}
                    displacementScale={35}
                  >
                    <span style={{ fontWeight: 600 }}>⭐ {movie.vote_average?.toFixed(1)}</span>
                  </LiquidSurface>
                  
                  <LiquidSurface
                    variant="button"
                    padding="8px 16px"
                    cornerRadius={12}
                    displacementScale={35}
                  >
                    <span style={{ fontWeight: 600 }}>📅 {movie.release_date?.split('-')[0]}</span>
                  </LiquidSurface>
                  
                  {movie.runtime && (
                    <LiquidSurface
                      variant="button"
                      padding="8px 16px"
                      cornerRadius={12}
                      displacementScale={35}
                    >
                      <span style={{ fontWeight: 600 }}>⏱ {movie.runtime} min</span>
                    </LiquidSurface>
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
                    <motion.button
                      onClick={() => setShowTrailer(true)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '14px 28px',
                        background: 'linear-gradient(135deg, #e50914 0%, #b81d24 100%)',
                        border: 'none',
                        borderRadius: '50px',
                        color: '#fff',
                        fontSize: '16px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 4px 20px rgba(229, 9, 20, 0.4)',
                        transition: 'box-shadow 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 6px 30px rgba(229, 9, 20, 0.6)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(229, 9, 20, 0.4)';
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>▶</span>
                      Watch Trailer
                    </motion.button>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <MovieActions movie={movie} />
              </div>
            </div>
          </LiquidSurface>
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
              <LiquidSurface
                variant="container"
                cornerRadius={20}
                padding="20px 28px"
                blurAmount={0.1}
                displacementScale={45}
                mouseContainer={containerRef}
              >
                <h2 style={{ fontSize: '24px', fontWeight: 600 }}>🎭 Top Cast</h2>
              </LiquidSurface>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
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
                    <LiquidSurface
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
                    </LiquidSurface>
                  </motion.div>
                </Link>
              ))}
            </div>
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
              <LiquidSurface
                variant="container"
                cornerRadius={20}
                padding="20px 28px"
                blurAmount={0.1}
                displacementScale={45}
                mouseContainer={containerRef}
              >
                <h2 style={{ fontSize: '24px', fontWeight: 600 }}>🤖 More Like This</h2>
              </LiquidSurface>
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
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
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

      {/* Trailer Modal */}
      <AnimatePresence>
        {showTrailer && videos.length > 0 && (
          <TrailerModal
            videos={videos}
            onClose={() => setShowTrailer(false)}
          />
        )}
      </AnimatePresence>
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
      <LiquidSurface
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
      </LiquidSurface>
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
      <LiquidSurface
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
            <LiquidSurface
              variant="button"
              padding="12px 24px"
              cornerRadius={50}
            >
              <span style={{ color: '#fff', fontWeight: 500 }}>← Back to Home</span>
            </LiquidSurface>
          </Link>
        </div>
      </LiquidSurface>
    </div>
  );
}

// ====== Trailer Modal Component ======
function TrailerModal({ videos, onClose }: { videos: Video[]; onClose: () => void }) {
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const selectedVideo = videos[selectedVideoIndex];
  
  // Lock body scroll when modal is open
  useEffect(() => {
    const scrollY = window.scrollY;
    document.documentElement.style.setProperty('--scroll-y', `${scrollY}px`);
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const getVideoIcon = (type: string) => {
    switch (type) {
      case 'Trailer': return '🎬';
      case 'Teaser': return '✨';
      case 'Clip': return '🎞️';
      case 'Behind the Scenes': return '🎥';
      case 'Featurette': return '📽️';
      default: return '▶️';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.97)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Close Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={onClose}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 10,
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          color: '#fff',
          fontSize: '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ✕
      </motion.button>

      {/* Scrollable Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          padding: '60px 20px 40px',
        }}
      >
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}>
          {/* Video Player */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              borderRadius: '20px',
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div style={{ aspectRatio: '16 / 9' }}>
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.key}?autoplay=1&rel=0&modestbranding=1`}
                title={selectedVideo.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
              />
            </div>
          </motion.div>

          {/* Video Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '20px',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '28px' }}>{getVideoIcon(selectedVideo.type)}</span>
                <div>
                  <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>
                    {selectedVideo.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                      {selectedVideo.type}
                    </span>
                    {selectedVideo.official && (
                      <span style={{
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '10px',
                        fontWeight: 600,
                        color: '#fff',
                      }}>
                        OFFICIAL
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {videos.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setSelectedVideoIndex(prev => prev > 0 ? prev - 1 : videos.length - 1)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    ←
                  </button>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', minWidth: '45px', textAlign: 'center' }}>
                    {selectedVideoIndex + 1} / {Math.min(videos.length, 8)}
                  </span>
                  <button
                    onClick={() => setSelectedVideoIndex(prev => prev < Math.min(videos.length, 8) - 1 ? prev + 1 : 0)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Video Thumbnails */}
          {videos.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '12px',
              }}
            >
              {videos.slice(0, 8).map((video, index) => (
                <motion.div
                  key={video.id}
                  onClick={() => setSelectedVideoIndex(index)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    cursor: 'pointer',
                    background: index === selectedVideoIndex 
                      ? 'rgba(229, 9, 20, 0.2)' 
                      : 'rgba(255, 255, 255, 0.05)',
                    border: index === selectedVideoIndex 
                      ? '2px solid #e50914' 
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{
                    width: '80px',
                    height: '45px',
                    borderRadius: '8px',
                    background: `url(https://img.youtube.com/vi/${video.key}/mqdefault.jpg) center/cover`,
                    flexShrink: 0,
                    position: 'relative',
                  }}>
                    {index === selectedVideoIndex && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(229, 9, 20, 0.7)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '16px',
                      }}>
                        ▶
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      color: index === selectedVideoIndex ? '#fff' : 'rgba(255,255,255,0.8)',
                      fontSize: '13px',
                      fontWeight: 500,
                      marginBottom: '2px',
                    }}>
                      {video.type}
                    </p>
                    <p style={{
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: '11px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {video.name}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Keyboard hint */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'rgba(255, 255, 255, 0.3)',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        Press <kbd style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '11px',
        }}>ESC</kbd> to close
      </div>
    </motion.div>
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
  
  const inWatchlist = isInWatchlist(movie.id);
  const isFav = isFavorite(movie.id);
  const userRating = getUserRating(movie.id);
  const comparisonSlot = isInComparison(movie.id);

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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        {/* Watchlist Button */}
        <motion.button
          onClick={() => inWatchlist ? removeFromWatchlist(movie.id) : addToWatchlist(movie)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LiquidSurface
            variant="button"
            cornerRadius={14}
            padding="12px 20px"
            style={{
              background: inWatchlist 
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.4), rgba(6, 182, 212, 0.4))'
                : undefined,
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '14px' }}>
              {inWatchlist ? '✓ In Watchlist' : '📋 Add to Watchlist'}
            </span>
          </LiquidSurface>
        </motion.button>

        {/* Favorite Button */}
        <motion.button
          onClick={() => toggleFavorite(movie)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LiquidSurface
            variant="button"
            cornerRadius={14}
            padding="12px 20px"
            style={{
              background: isFav 
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.4), rgba(236, 72, 153, 0.4))'
                : undefined,
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '14px' }}>
              {isFav ? '❤️ Favorited' : '🤍 Favorite'}
            </span>
          </LiquidSurface>
        </motion.button>

        {/* Rate Button */}
        <motion.button
          onClick={() => setShowRating(!showRating)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LiquidSurface
            variant="button"
            cornerRadius={14}
            padding="12px 20px"
            style={{
              background: userRating 
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.4), rgba(249, 115, 22, 0.4))'
                : undefined,
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '14px' }}>
              {userRating ? `⭐ ${userRating}/10` : '⭐ Rate'}
            </span>
          </LiquidSurface>
        </motion.button>

        {/* Collection Button */}
        <motion.button
          onClick={() => setShowCollections(!showCollections)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LiquidSurface variant="button" cornerRadius={14} padding="12px 20px">
            <span style={{ fontWeight: 600, fontSize: '14px' }}>📂 Add to Collection</span>
          </LiquidSurface>
        </motion.button>

        {/* Compare Button */}
        <motion.button
          onClick={handleAddToComparison}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={comparisonSlot >= 0 || getNextComparisonSlot() < 0}
          style={{ opacity: (comparisonSlot >= 0 || getNextComparisonSlot() < 0) ? 0.6 : 1 }}
        >
          <LiquidSurface
            variant="button"
            cornerRadius={14}
            padding="12px 20px"
            style={{
              background: comparisonSlot >= 0 
                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(168, 85, 247, 0.4))'
                : undefined,
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '14px' }}>
              {comparisonSlot >= 0 ? '⚖️ In Compare' : '⚖️ Compare'}
            </span>
          </LiquidSurface>
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
            <LiquidSurface variant="container" cornerRadius={16} padding="16px">
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
            </LiquidSurface>
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
            <LiquidSurface variant="container" cornerRadius={16} padding="16px">
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
                      <LiquidSurface
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
                      </LiquidSurface>
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
            </LiquidSurface>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default MoviePage;
