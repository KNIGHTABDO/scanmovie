"use client";

/**
 * Movie Detail Page
 * =================
 * USES LIQUIDGLASS for:
 * - Main movie info container
 * - Cast cards
 * - Similar movies section
 * - All interactive elements
 */

import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'framer-motion';
import { LiquidSurface } from '~/components/Liquid/LiquidSurface';
import { MovieCard } from '~/components/MovieCard';
import {
  getMovieDetails,
  getMovieCredits,
  getSimilarMovies,
  getBackdropUrl,
  getPosterUrl,
  getProfileUrl,
  type Movie,
  type Credits,
} from '~/services/tmdb';

export function MoviePage() {
  const { id } = useParams();
  const movieId = parseInt(id || '0', 10);
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!movieId) return;
    
    async function fetchMovieData() {
      setLoading(true);
      try {
        const [movieData, creditsData, similarData] = await Promise.all([
          getMovieDetails(movieId),
          getMovieCredits(movieId),
          getSimilarMovies(movieId),
        ]);
        setMovie(movieData);
        setCredits(creditsData);
        setSimilar(similarData);
      } catch (error) {
        console.error('Failed to fetch movie data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMovieData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [movieId]);

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
                    <span style={{ fontWeight: 500 }}>{director.name}</span>
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
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
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
                      <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{member.name}</p>
                      <p style={{ fontSize: '12px', opacity: 0.6 }}>{member.character}</p>
                    </div>
                  </LiquidSurface>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Similar Movies Section */}
        {similar.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
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
                <h2 style={{ fontSize: '24px', fontWeight: 600 }}>🎬 Similar Movies</h2>
              </LiquidSurface>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '24px',
              }}
            >
              {similar.slice(0, 6).map((movie, index) => (
                <MovieCard key={movie.id} movie={movie} index={index} />
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

export default MoviePage;
