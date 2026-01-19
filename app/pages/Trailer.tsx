"use client";

/**
 * Trailer Page
 * ============
 * Dedicated page for watching movie trailers and videos
 */

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router';
import { motion } from 'framer-motion';
import { LiquidSurface } from '~/components/Liquid/LiquidSurface';
import {
  getMovieDetails,
  getMovieVideos,
  getBackdropUrl,
  type Movie,
  type Video,
} from '~/services/tmdb';

export function TrailerPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const movieId = parseInt(id || '0', 10);
  const initialVideoIndex = parseInt(searchParams.get('v') || '0', 10);

  const [movie, setMovie] = useState<Movie | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(initialVideoIndex);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!movieId) return;

    async function fetchData() {
      setLoading(true);
      try {
        const [movieData, videosData] = await Promise.all([
          getMovieDetails(movieId),
          getMovieVideos(movieId),
        ]);
        setMovie(movieData);
        setVideos(videosData);
      } catch (error) {
        console.error('Failed to fetch trailer data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [movieId]);

  const selectedVideo = videos[selectedVideoIndex];

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

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <LiquidSurface variant="modal" cornerRadius={24} padding="40px">
          <div style={{ textAlign: 'center' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              style={{ fontSize: '48px', marginBottom: '16px' }}
            >
              🎬
            </motion.div>
            <p style={{ color: '#fff', fontSize: '18px' }}>Loading trailers...</p>
          </div>
        </LiquidSurface>
      </div>
    );
  }

  if (!movie || videos.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <LiquidSurface variant="modal" cornerRadius={24} padding="40px">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div>
            <h2 style={{ color: '#fff', fontSize: '24px', marginBottom: '8px' }}>No Videos Found</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>
              No trailers or clips are available for this movie.
            </p>
            <Link to={`/movie/${movieId}`} style={{ textDecoration: 'none' }}>
              <LiquidSurface variant="button" padding="12px 24px" cornerRadius={50}>
                <span style={{ color: '#fff', fontWeight: 500 }}>← Back to Movie</span>
              </LiquidSurface>
            </Link>
          </div>
        </LiquidSurface>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#fff',
    }}>
      {/* Background */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `url(${getBackdropUrl(movie.backdrop_path, 'w1280')})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.15,
        filter: 'blur(20px)',
      }} />
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(10,10,10,0.5) 0%, #0a0a0a 100%)',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '80px 20px 40px',
      }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <Link to={`/movie/${movieId}`} style={{ textDecoration: 'none' }}>
            <LiquidSurface variant="button" padding="10px 20px" cornerRadius={50} displacementScale={40}>
              <span style={{ color: '#fff', fontWeight: 500 }}>← Back to {movie.title}</span>
            </LiquidSurface>
          </Link>

          <h1 style={{ fontSize: '24px', fontWeight: 600 }}>
            Videos & Trailers
          </h1>
        </motion.div>

        {/* Video Player */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ marginBottom: '24px' }}
        >
          <LiquidSurface
            variant="modal"
            padding="12px"
            cornerRadius={28}
            displacementScale={70}
            aberrationIntensity={3}
          >
            <div style={{
              aspectRatio: '16 / 9',
              borderRadius: '20px',
              overflow: 'hidden',
              background: '#000',
            }}>
              <iframe
                key={selectedVideo.key}
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
          </LiquidSurface>
        </motion.div>

        {/* Current Video Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginBottom: '32px' }}
        >
          <LiquidSurface
            variant="container"
            padding="24px"
            cornerRadius={20}
            displacementScale={50}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}>
              <span style={{ fontSize: '36px' }}>{getVideoIcon(selectedVideo.type)}</span>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '6px' }}>
                  {selectedVideo.name}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}>
                    {selectedVideo.type}
                  </span>
                  {selectedVideo.official && (
                    <span style={{
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}>
                      Official
                    </span>
                  )}
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                    {selectedVideoIndex + 1} of {videos.length} videos
                  </span>
                </div>
              </div>

              {/* Navigation Buttons */}
              {videos.length > 1 && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <motion.button
                    onClick={() => setSelectedVideoIndex(prev => prev > 0 ? prev - 1 : videos.length - 1)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      fontSize: '18px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ←
                  </motion.button>
                  <motion.button
                    onClick={() => setSelectedVideoIndex(prev => prev < videos.length - 1 ? prev + 1 : 0)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      fontSize: '18px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    →
                  </motion.button>
                </div>
              )}
            </div>
          </LiquidSurface>
        </motion.div>

        {/* Video List */}
        {videos.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>
              All Videos ({videos.length})
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '16px',
            }}>
              {videos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedVideoIndex(index)}
                  style={{ cursor: 'pointer' }}
                >
                  <LiquidSurface
                    variant="card"
                    padding="16px"
                    cornerRadius={20}
                    displacementScale={index === selectedVideoIndex ? 60 : 45}
                  >
                    <div style={{ display: 'flex', gap: '16px' }}>
                      {/* Thumbnail */}
                      <div style={{
                        width: '140px',
                        height: '80px',
                        borderRadius: '12px',
                        background: `url(https://img.youtube.com/vi/${video.key}/mqdefault.jpg) center/cover`,
                        flexShrink: 0,
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: index === selectedVideoIndex
                          ? '0 0 0 3px #e50914, 0 8px 20px rgba(229, 9, 20, 0.3)'
                          : '0 4px 12px rgba(0,0,0,0.3)',
                      }}>
                        {index === selectedVideoIndex ? (
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(229, 9, 20, 0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                              style={{ fontSize: '24px' }}
                            >
                              ▶
                            </motion.div>
                          </div>
                        ) : (
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transition: 'opacity 0.2s',
                          }}
                          className="play-overlay"
                          >
                            <span style={{ fontSize: '24px' }}>▶</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span style={{ fontSize: '20px' }}>{getVideoIcon(video.type)}</span>
                          <span style={{
                            color: index === selectedVideoIndex ? '#e50914' : 'rgba(255,255,255,0.7)',
                            fontSize: '13px',
                            fontWeight: 600,
                          }}>
                            {video.type}
                          </span>
                          {video.official && (
                            <span style={{
                              background: 'rgba(102, 126, 234, 0.3)',
                              color: '#a5b4fc',
                              padding: '2px 6px',
                              borderRadius: '6px',
                              fontSize: '9px',
                              fontWeight: 600,
                            }}>
                              OFFICIAL
                            </span>
                          )}
                        </div>
                        <p style={{
                          color: index === selectedVideoIndex ? '#fff' : 'rgba(255,255,255,0.85)',
                          fontSize: '14px',
                          fontWeight: index === selectedVideoIndex ? 600 : 500,
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          {video.name}
                        </p>
                      </div>
                    </div>
                  </LiquidSurface>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
