"use client";

/**
 * Home Page
 * =========
 * USES LIQUIDGLASS for:
 * - Section containers
 * - Movie cards (via MovieCard component)
 * - Hero section
 * 
 * VERIFICATION: Multiple LiquidGlass layers create depth.
 * Background visually bends through all glass surfaces.
 */

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiquidSurface } from '~/components/Liquid/LiquidSurface';
import { MovieCard } from '~/components/MovieCard';
import { SkeletonHero, SkeletonSection } from '~/components/SkeletonLoading';
import { getTrending, getNowPlaying, getUpcoming, getBackdropUrl, type Movie } from '~/services/tmdb';
import { trackAction } from '~/services/achievements';

export function Home() {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check breakpoints on mount and resize
  useEffect(() => {
    const checkBreakpoints = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    checkBreakpoints();
    window.addEventListener('resize', checkBreakpoints);
    return () => window.removeEventListener('resize', checkBreakpoints);
  }, []);

  useEffect(() => {
    async function fetchMovies() {
      try {
        const [trendingData, nowPlayingData, upcomingData] = await Promise.all([
          getTrending('week'),
          getNowPlaying(),
          getUpcoming(),
        ]);
        setTrending(trendingData);
        setNowPlaying(nowPlayingData);
        setUpcoming(upcomingData);
        
        // Track app visit for streak achievements
        trackAction('app_visit');
      } catch (error) {
        console.error('Failed to fetch movies:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();
  }, []);

  // Rotate featured movie every 8 seconds
  useEffect(() => {
    if (trending.length === 0) return;
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % Math.min(trending.length, 5));
    }, 8000);
    return () => clearInterval(interval);
  }, [trending.length]);

  const featuredMovie = trending[featuredIndex];

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%)',
        paddingTop: '120px',
        paddingLeft: '24px',
        paddingRight: '24px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <SkeletonHero isMobile={isMobile} />
          <div style={{ marginTop: '60px' }}>
            <SkeletonSection title={true} cardCount={6} isMobile={isMobile} />
          </div>
          <SkeletonSection title={true} cardCount={6} isMobile={isMobile} />
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ 
      minHeight: '100vh', 
      position: 'relative',
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'hidden',
      background: 'transparent',
    }}>
      {/* Background Image - Movie Backdrop (4K Original) */}
      <AnimatePresence mode="wait">
        {featuredMovie?.backdrop_path && (
          <motion.div
            key={featuredMovie.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 0,
              pointerEvents: 'none',
            }}
          >
            {/* Cinematic slow zoom animation */}
            <motion.img
              src={`https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path}`}
              alt=""
              initial={{ scale: 1 }}
              animate={{ scale: 1.08 }}
              transition={{ 
                duration: 25, 
                ease: 'linear',
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              style={{
                position: 'absolute',
                top: '-4%',
                left: '-4%',
                width: '108%',
                height: '108%',
                objectFit: 'cover',
                opacity: 0.45,
                filter: 'blur(1px) saturate(1.2)',
              }}
            />
            
            {/* Cinematic Vignette Overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.6) 100%)',
              pointerEvents: 'none',
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gradient Overlay for text readability */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(to bottom, rgba(10, 10, 15, 0.2) 0%, rgba(10, 10, 15, 0.5) 40%, rgba(10, 10, 15, 0.8) 70%, rgba(10, 10, 15, 0.95) 100%)',
        zIndex: 1,
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <main style={{
        position: 'relative',
        zIndex: 10,
        paddingTop: isMobile ? '100px' : '120px',
        paddingBottom: isMobile ? '40px' : '80px',
        width: '100%',
        maxWidth: '1200px',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: isMobile ? '16px' : (isTablet ? '32px' : '24px'),
        paddingRight: isMobile ? '16px' : (isTablet ? '32px' : '24px'),
        boxSizing: 'border-box',
      }}>
        {/* Hero Section - LIQUIDGLASS CONTAINER */}
        <section style={{ marginBottom: isMobile ? '40px' : '60px', width: '100%' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={featuredMovie?.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              style={{ 
                width: '100%',
                maxWidth: isMobile ? '100%' : (isTablet ? '90%' : '700px'),
              }}
            >
              <LiquidSurface
                variant="container"
                cornerRadius={isMobile ? 20 : (isTablet ? 28 : 32)}
                padding={isMobile ? '24px' : (isTablet ? '32px' : '40px')}
                displacementScale={65}
                aberrationIntensity={2.5}
                mouseContainer={containerRef}
                width="100%"
              >
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: isMobile ? '12px' : '16px',
                  width: '100%',
                }}>
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: 600, color: '#6366f1' }}
                  >
                    🔥 Featured Today
                  </motion.span>
                  
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{ 
                      fontSize: isMobile ? '28px' : (isTablet ? '38px' : '48px'), 
                      fontWeight: 800, 
                      lineHeight: 1.1,
                      background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      margin: 0,
                      wordBreak: 'break-word',
                    }}
                  >
                    {featuredMovie?.title}
                  </motion.h1>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{ 
                      fontSize: isMobile ? '14px' : (isTablet ? '15px' : '16px'), 
                      color: 'rgba(255,255,255,0.7)', 
                      lineHeight: 1.6, 
                      margin: 0 
                    }}
                  >
                    {featuredMovie?.overview?.slice(0, isMobile ? 120 : (isTablet ? 180 : 200))}
                    {(featuredMovie?.overview?.length || 0) > (isMobile ? 120 : (isTablet ? 180 : 200)) ? '...' : ''}
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{ 
                      display: 'flex', 
                      gap: isMobile ? '16px' : '20px', 
                      fontSize: isMobile ? '14px' : '15px', 
                      color: 'rgba(255,255,255,0.7)' 
                    }}
                  >
                    <span>⭐ {featuredMovie?.vote_average?.toFixed(1)}</span>
                    <span>📅 {featuredMovie?.release_date?.split('-')[0]}</span>
                  </motion.div>

                  <motion.a
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    href={`/movie/${featuredMovie?.id}`}
                    style={{ 
                      display: 'inline-block', 
                      marginTop: '8px', 
                      textDecoration: 'none', 
                      maxWidth: 'fit-content' 
                    }}
                  >
                    <LiquidSurface
                      variant="button"
                      padding={isMobile ? '16px 28px' : '14px 32px'}
                      cornerRadius={50}
                      displacementScale={50}
                      aberrationIntensity={3}
                      elasticity={0.3}
                      minHeight="48px"
                    >
                      <span style={{ 
                        fontWeight: 600, 
                        fontSize: isMobile ? '14px' : '15px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}>
                        View Details →
                      </span>
                    </LiquidSurface>
                  </motion.a>
                </div>
              </LiquidSurface>
            </motion.div>
          </AnimatePresence>

          {/* Hero Indicators */}
          <div style={{ 
            display: 'flex', 
            gap: isMobile ? '8px' : '10px', 
            marginTop: isMobile ? '20px' : '24px',
            marginBottom: isMobile ? '16px' : '0px',
            justifyContent: isMobile ? 'center' : 'flex-start',
            width: '100%',
            alignItems: 'center',
          }}>
            {trending.slice(0, 5).map((_, idx) => (
              <motion.button
                key={idx}
                onClick={() => setFeaturedIndex(idx)}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: idx === featuredIndex 
                    ? (isMobile ? '20px' : '28px') 
                    : (isMobile ? '6px' : '8px'),
                  height: isMobile ? '6px' : '8px',
                  borderRadius: idx === featuredIndex ? '4px' : '50%',
                  background: idx === featuredIndex ? '#6366f1' : 'rgba(255, 255, 255, 0.35)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </section>

        {/* Trending Section */}
        <MovieSection
          title="🔥 Trending This Week"
          movies={trending}
          containerRef={containerRef}
          isMobile={isMobile}
          isTablet={isTablet}
        />

        {/* Now Playing Section */}
        <MovieSection
          title="🎬 Now Playing"
          movies={nowPlaying}
          containerRef={containerRef}
          isMobile={isMobile}
          isTablet={isTablet}
        />

        {/* Upcoming Section */}
        <MovieSection
          title="📅 Coming Soon"
          movies={upcoming}
          containerRef={containerRef}
          isMobile={isMobile}
          isTablet={isTablet}
        />
      </main>
    </div>
  );
}

interface MovieSectionProps {
  title: string;
  movies: Movie[];
  containerRef: React.RefObject<HTMLDivElement | null>;
  isMobile: boolean;
  isTablet: boolean;
}

function MovieSection({ title, movies, containerRef, isMobile, isTablet }: MovieSectionProps) {
  // Determine grid columns: mobile=2, tablet=3, desktop=4+
  const getGridColumns = () => {
    if (isMobile) return 'repeat(2, 1fr)';
    if (isTablet) return 'repeat(3, 1fr)';
    return 'repeat(auto-fill, minmax(200px, 1fr))';
  };

  // Determine number of movies to show
  const getMovieCount = () => {
    if (isMobile) return 6;
    if (isTablet) return 6;
    return 8;
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
      style={{ marginBottom: isMobile ? '40px' : '60px', width: '100%' }}
    >
      {/* Section Header - LIQUIDGLASS */}
      <div style={{ marginBottom: isMobile ? '16px' : '24px', display: 'inline-block' }}>
        <LiquidSurface
          variant="container"
          cornerRadius={isMobile ? 14 : (isTablet ? 18 : 20)}
          padding={isMobile ? '14px 20px' : (isTablet ? '16px 24px' : '20px 28px')}
          blurAmount={0.1}
          displacementScale={45}
          mouseContainer={containerRef}
        >
          <h2 style={{ 
            fontSize: isMobile ? '18px' : (isTablet ? '20px' : '24px'), 
            fontWeight: 700, 
            color: '#fff',
            margin: 0,
          }}>
            {title}
          </h2>
        </LiquidSurface>
      </div>

      {/* Movie Grid - Responsive columns: 2 (mobile) -> 3 (tablet) -> 4+ (desktop) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: getGridColumns(),
        gap: isMobile ? '12px' : (isTablet ? '16px' : '24px'),
        width: '100%',
      }}>
        {movies.slice(0, getMovieCount()).map((movie, index) => (
          <MovieCard key={movie.id} movie={movie} index={index} />
        ))}
      </div>
    </motion.section>
  );
}

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0f',
    }}>
      <div style={{ textAlign: 'center' }}>
        <LiquidSurface
          variant="modal"
          cornerRadius={24}
          padding="40px"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            style={{ fontSize: '64px', marginBottom: '20px' }}
          >
            🎬
          </motion.div>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
            Loading cinematic experience...
          </p>
        </LiquidSurface>
      </div>
    </div>
  );
}

export default Home;
