"use client";

/**
 * MovieCard Component
 * ===================
 * USES LIQUIDGLASS for movie card surfaces.
 * Mobile-optimized with responsive sizing.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { LiquidSurface } from './Liquid/LiquidSurface';
import { getPosterUrl, type Movie } from '~/services/tmdb';

interface MovieCardProps {
  movie: Movie;
  index?: number;
}

export function MovieCard({ movie, index = 0 }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const rating = movie.vote_average?.toFixed(1) || 'N/A';
  const year = movie.release_date?.split('-')[0] || 'N/A';

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
      onHoverStart={() => !isMobile && setIsHovered(true)}
      onHoverEnd={() => !isMobile && setIsHovered(false)}
      style={{
        position: 'relative',
        width: '100%',
      }}
    >
      <Link to={`/movie/${movie.id}`} style={{ textDecoration: 'none', display: 'block', width: '100%' }}>
        {/* LIQUIDGLASS MOVIE CARD SURFACE */}
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
            {/* Poster Image */}
            <div style={{
              position: 'relative',
              aspectRatio: '2/3',
              overflow: 'hidden',
              width: '100%',
              backgroundColor: '#1a1a25',
            }}>
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
              {!imageLoaded && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#1a1a25',
                }}>
                  <span style={{ fontSize: isMobile ? '32px' : '48px', opacity: 0.3 }}>🎬</span>
                </div>
              )}
              
              {/* Rating Badge */}
              <div style={{
                position: 'absolute',
                top: isMobile ? '8px' : '12px',
                right: isMobile ? '8px' : '12px',
              }}>
                <LiquidSurface
                  variant="button"
                  cornerRadius={isMobile ? 8 : 12}
                  padding={isMobile ? '3px 8px' : '4px 10px'}
                  displacementScale={35}
                  blurAmount={0.08}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span style={{ fontSize: isMobile ? '10px' : '12px' }}>⭐</span>
                    <span style={{ fontSize: isMobile ? '11px' : '13px', fontWeight: 600 }}>{rating}</span>
                  </span>
                </LiquidSurface>
              </div>
            </div>

            {/* Movie Info */}
            <div style={{ padding: isMobile ? '10px' : '16px' }}>
              <h3 style={{
                fontSize: isMobile ? '13px' : '15px',
                fontWeight: 600,
                color: '#fff',
                marginBottom: '2px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineClamp: 2,
                margin: 0,
                lineHeight: 1.3,
              }}>
                {movie.title}
              </h3>
              <p style={{
                fontSize: isMobile ? '11px' : '13px',
                color: 'rgba(255,255,255,0.5)',
                margin: 0,
              }}>
                {year}
              </p>
              
              {/* Hover overlay with overview - Desktop only */}
              {!isMobile && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ 
                    opacity: isHovered ? 1 : 0,
                    height: isHovered ? 'auto' : 0
                  }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                >
                  <p style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.7)',
                    lineHeight: 1.5,
                    marginTop: '8px',
                    margin: 0,
                  }}>
                    {movie.overview?.slice(0, 120)}
                    {(movie.overview?.length || 0) > 120 ? '...' : ''}
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </LiquidSurface>
      </Link>
    </motion.div>
  );
}

export default MovieCard;
