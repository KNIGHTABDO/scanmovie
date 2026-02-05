
/**
 * Recommendations Page
 * ====================
 * Personalized "For You" feed based on watch history and ratings
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Surface } from '~/components/Surface';
import { MovieCard } from '~/components/MovieCard';
import { SkeletonMovieGrid } from '~/components/SkeletonLoading';
import { useUserData } from '~/contexts/UserDataContext';
import { generateRecommendations } from '~/services/recommendations';
import { type Movie } from '~/services/tmdb';

export function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  
  const { viewHistory, ratings, favorites } = useUserData();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  useEffect(() => {
    async function fetchRecommendations() {
      setLoading(true);
      setError('');
      
      try {
        const recs = await generateRecommendations(viewHistory, ratings, favorites, 24);
        setRecommendations(recs);
      } catch (err) {
        console.error('Failed to generate recommendations:', err);
        setError('Failed to generate recommendations. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchRecommendations();
  }, [viewHistory, ratings, favorites]);
  
  const hasUserData = viewHistory.length > 0 || ratings.length > 0 || favorites.length > 0;
  
  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #1a0a2e 50%, #0a0a0f 100%)',
      paddingTop: isMobile ? '80px' : '100px',
      paddingBottom: '60px',
      paddingLeft: '16px',
      paddingRight: '16px',
    }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          maxWidth: '1400px',
          margin: '0 auto 32px auto',
        }}
      >
        <h1 style={{
          fontSize: '36px',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #fff 0%, #c4b5fd 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px',
        }}>
          <span style={{ marginRight: '12px' }}>✨</span>
          For You
        </h1>
        <p style={{
          fontSize: '16px',
          color: 'rgba(255,255,255,0.6)',
          maxWidth: '600px',
        }}>
          {hasUserData 
            ? 'Personalized recommendations based on your watch history and ratings'
            : 'Start rating movies to get personalized recommendations'
          }
        </p>
      </motion.div>
      
      {/* Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {loading ? (
          <SkeletonMovieGrid count={12} />
        ) : error ? (
          <Surface style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px' }}>
              {error}
            </p>
          </Surface>
        ) : recommendations.length === 0 ? (
          <Surface style={{ padding: '60px 40px', textAlign: 'center' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎬</div>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: 600, 
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '12px',
              }}>
                No recommendations yet
              </h2>
              <p style={{ 
                fontSize: '16px', 
                color: 'rgba(255,255,255,0.5)',
                maxWidth: '500px',
                margin: '0 auto',
              }}>
                Start exploring movies, add them to your watchlist, or rate movies you've seen.
                We'll use this to create personalized recommendations just for you!
              </p>
            </motion.div>
          </Surface>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '20px',
            }}
          >
            {recommendations.map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MovieCard 
                  movie={movie}
                  badge={index < 3 ? `#${index + 1} For You` : undefined}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      
      {/* Info Card */}
      {!loading && recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            maxWidth: '1400px',
            margin: '40px auto 0 auto',
          }}
        >
          <Surface style={{ padding: '24px' }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span>💡</span>
              <span>How recommendations work</span>
            </h3>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.6,
            }}>
              We analyze your watch history, ratings, and favorite movies to understand your taste.
              The more you interact with movies on ScanMovie, the better your recommendations become.
              Try rating movies you've seen to improve your personalized feed!
            </p>
          </Surface>
        </motion.div>
      )}
    </div>
  );
}
