"use client";

/**
 * Movie Card with Hover Preview
 * ==============================
 * Enhanced movie card with trailer preview on hover.
 * Shows streaming availability and quick actions.
 */

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { LiquidSurface } from './Liquid/LiquidSurface';
import { StreamingBadge } from './StreamingAvailability';
import { getPosterUrl, getMovieVideos, type Movie, type Video } from '~/services/tmdb';
import { useUserData } from '~/contexts/UserDataContext';

interface EnhancedMovieCardProps {
  movie: Movie;
  index?: number;
  showPreview?: boolean;
  showStreamingBadge?: boolean;
  showQuickActions?: boolean;
}

export function EnhancedMovieCard({ 
  movie, 
  index = 0,
  showPreview = true,
  showStreamingBadge = true,
  showQuickActions = true,
}: EnhancedMovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  
  const { 
    isInWatchlist, 
    addToWatchlist, 
    removeFromWatchlist,
    isFavorite,
    toggleFavorite,
  } = useUserData();

  const inWatchlist = isInWatchlist(movie.id);
  const isFav = isFavorite(movie.id);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch trailer when hovered
  useEffect(() => {
    if (isHovered && showPreview && !isMobile && !trailerKey) {
      getMovieVideos(movie.id)
        .then(videos => {
          const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube') ||
                          videos.find(v => v.site === 'YouTube');
          if (trailer) {
            setTrailerKey(trailer.key);
          }
        })
        .catch(() => {});
    }
  }, [isHovered, movie.id, showPreview, isMobile, trailerKey]);

  // Handle hover with delay for preview
  const handleMouseEnter = () => {
    if (isMobile) return;
    setIsHovered(true);
    
    if (showPreview) {
      hoverTimeoutRef.current = setTimeout(() => {
        setShowTrailer(true);
      }, 800); // Show trailer after 800ms hover
    }
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    setIsHovered(false);
    setShowTrailer(false);
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const rating = movie.vote_average?.toFixed(1) || 'N/A';
  const year = movie.release_date?.split('-')[0] || 'N/A';

  const handleQuickAction = (e: React.MouseEvent, action: 'watchlist' | 'favorite') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (action === 'watchlist') {
      if (inWatchlist) {
        removeFromWatchlist(movie.id);
      } else {
        addToWatchlist(movie);
      }
    } else {
      toggleFavorite(movie);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={isMobile ? undefined : { scale: 1.03, y: -8 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        width: '100%',
      }}
    >
      <Link to={`/movie/${movie.id}`} style={{ textDecoration: 'none', display: 'block', width: '100%' }}>
        <LiquidSurface
          variant="card"
          cornerRadius={isMobile ? 14 : 20}
          padding="0"
          minHeight={isMobile ? '240px' : '320px'}
          displacementScale={isHovered ? 75 : 60}
          aberrationIntensity={isHovered ? 3.5 : 2.5}
          elasticity={isHovered ? 0.25 : 0.2}
        >
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            width: '100%',
            overflow: 'hidden',
            borderRadius: isMobile ? '14px' : '20px',
          }}>
            {/* Poster Image / Trailer Preview */}
            <div style={{
              position: 'relative',
              aspectRatio: '2/3',
              overflow: 'hidden',
              width: '100%',
              backgroundColor: '#1a1a25',
            }}>
              {/* Streaming Badge */}
              {showStreamingBadge && <StreamingBadge movieId={movie.id} />}
              
              {/* Poster Image */}
              <motion.img
                src={getPosterUrl(movie.poster_path, isMobile ? 'w342' : 'w500')}
                alt={movie.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: imageLoaded ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                onLoad={() => setImageLoaded(true)}
              />
              
              {/* Loading Skeleton */}
              {!imageLoaded && (
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 100%)',
                  }}
                />
              )}
              
              {/* Trailer Preview Overlay */}
              <AnimatePresence>
                {showTrailer && trailerKey && !isMobile && (
                  <motion.div
                    ref={previewRef}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: '#000',
                    }}
                  >
                    <iframe
                      src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}&modestbranding=1`}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                      }}
                      allow="autoplay"
                    />
                    {/* Play indicator */}
                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      background: 'rgba(0,0,0,0.7)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: '#ef4444',
                        }}
                      />
                      Preview
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Hover Overlay with Quick Actions */}
              <AnimatePresence>
                {isHovered && showQuickActions && !showTrailer && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      padding: '12px',
                    }}
                  >
                    {/* Quick Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleQuickAction(e, 'watchlist')}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: inWatchlist 
                            ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                            : 'rgba(0,0,0,0.6)',
                          border: '2px solid rgba(255,255,255,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '18px',
                        }}
                        title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                      >
                        {inWatchlist ? '✓' : '+'}
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleQuickAction(e, 'favorite')}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: isFav 
                            ? 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)'
                            : 'rgba(0,0,0,0.6)',
                          border: '2px solid rgba(255,255,255,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '18px',
                        }}
                        title={isFav ? 'Remove from Favorites' : 'Add to Favorites'}
                      >
                        {isFav ? '❤️' : '🤍'}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Rating Badge */}
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%)',
                backdropFilter: 'blur(8px)',
                padding: '4px 8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <span style={{ fontSize: '12px' }}>⭐</span>
                <span style={{ 
                  fontSize: '12px', 
                  fontWeight: 600, 
                  color: '#fff',
                }}>
                  {rating}
                </span>
              </div>
            </div>
            
            {/* Movie Info */}
            <div style={{
              padding: isMobile ? '12px' : '16px',
              background: 'rgba(10, 10, 20, 0.6)',
            }}>
              <h3 style={{
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: 600,
                color: '#fff',
                marginBottom: '6px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {movie.title}
              </h3>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: isMobile ? '11px' : '12px',
                color: 'rgba(255,255,255,0.6)',
              }}>
                <span>{year}</span>
                <span style={{ opacity: 0.3 }}>•</span>
                <span>{movie.vote_count?.toLocaleString()} votes</span>
              </div>
            </div>
          </div>
        </LiquidSurface>
      </Link>
    </motion.div>
  );
}

// Export as default alternative to original MovieCard
export default EnhancedMovieCard;
