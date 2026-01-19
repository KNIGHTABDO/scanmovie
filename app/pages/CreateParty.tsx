"use client";

/**
 * Create Party Page
 * =================
 * Full page for creating a watch party.
 * Uses LiquidGlass styling consistent with the app.
 */

import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'framer-motion';
import { LiquidSurface } from '~/components/Liquid/LiquidSurface';
import { getPosterUrl } from '~/services/tmdb';
import { createWatchParty } from '~/services/userDataStore';
import { useUserData } from '~/contexts/UserDataContext';

const PARTY_EMOJIS = ['🎬', '🍿', '🎭', '🎪', '🌙', '🎉', '👻', '❤️', '🔥', '✨', '🎮', '🚀'];

export function CreatePartyPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Form state
  const [newPartyName, setNewPartyName] = useState('');
  const [newPartyEmoji, setNewPartyEmoji] = useState('🎬');
  const [selectedMovieIds, setSelectedMovieIds] = useState<number[]>([]);
  
  // User data for movie selection
  const { watchlist, favorites } = useUserData();

  const handleCreateParty = async () => {
    if (!newPartyName.trim() || selectedMovieIds.length === 0) return;
    
    createWatchParty(
      newPartyName.trim(),
      newPartyEmoji,
      selectedMovieIds,
      'You'
    );
    
    // Navigate back to watch party page
    navigate('/watch-party');
  };

  const toggleMovieSelection = (movieId: number) => {
    setSelectedMovieIds(prev =>
      prev.includes(movieId)
        ? prev.filter(id => id !== movieId)
        : [...prev, movieId]
    );
  };

  // Combine watchlist and favorites for selection (deduplicated)
  const availableMovies = [...watchlist, ...favorites].filter(
    (movie, index, self) => self.findIndex(m => m.id === movie.id) === index
  );

  const canCreate = newPartyName.trim() && selectedMovieIds.length > 0;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        background: '#0a0a0a',
        color: '#fff',
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
          background: 'radial-gradient(ellipse 120% 80% at 50% 0%, #1e1b4b 0%, #0f172a 40%, #0a0a0f 100%)',
          zIndex: 0,
        }}
      />

      {/* Main Content */}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          paddingTop: '100px',
          paddingBottom: '120px',
          paddingLeft: '20px',
          paddingRight: '20px',
          maxWidth: '700px',
          margin: '0 auto',
        }}
      >
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ marginBottom: '24px' }}
        >
          <Link 
            to="/watch-party" 
            style={{ 
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'color 0.2s',
            }}
          >
            <span style={{ fontSize: '18px' }}>←</span>
            Back to Watch Parties
          </Link>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <LiquidSurface
            variant="modal"
            cornerRadius={32}
            padding="0"
            displacementScale={60}
            mouseContainer={containerRef}
          >
            {/* Header */}
            <div
              style={{
                padding: '32px 32px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                background: 'linear-gradient(180deg, rgba(102,126,234,0.15) 0%, transparent 100%)',
                borderRadius: '32px 32px 0 0',
              }}
            >
              <h1 style={{ 
                fontSize: '28px', 
                fontWeight: 700, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '14px',
                marginBottom: '8px',
              }}>
                <span style={{ fontSize: '36px' }}>✨</span>
                Create Watch Party
              </h1>
              <p style={{ fontSize: '15px', opacity: 0.6 }}>
                Curate the perfect movie night for your friends
              </p>
            </div>

            {/* Form Content */}
            <div style={{ padding: '28px 32px 36px' }}>
              {/* Party Name */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{ 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  marginBottom: '12px', 
                  display: 'block', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px', 
                  opacity: 0.7 
                }}>
                  Party Name
                </label>
                <input
                  type="text"
                  value={newPartyName}
                  onChange={e => setNewPartyName(e.target.value)}
                  placeholder="Friday Night Horror Marathon"
                  style={{
                    width: '100%',
                    padding: '18px 22px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '2px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '17px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'rgba(102,126,234,0.5)';
                    e.target.style.background = 'rgba(102,126,234,0.08)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.target.style.background = 'rgba(255,255,255,0.06)';
                  }}
                />
              </div>

              {/* Emoji Picker */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{ 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  marginBottom: '14px', 
                  display: 'block', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px', 
                  opacity: 0.7 
                }}>
                  Choose an Emoji
                </label>
                <LiquidSurface
                  variant="card"
                  cornerRadius={20}
                  padding="20px"
                  displacementScale={30}
                  mouseContainer={containerRef}
                >
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {PARTY_EMOJIS.map(emoji => (
                      <motion.button
                        key={emoji}
                        whileHover={{ scale: 1.15, y: -3 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setNewPartyEmoji(emoji)}
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '16px',
                          background: newPartyEmoji === emoji
                            ? 'linear-gradient(135deg, #667eea, #764ba2)'
                            : 'rgba(255,255,255,0.06)',
                          border: newPartyEmoji === emoji ? '2px solid rgba(102,126,234,0.5)' : '2px solid transparent',
                          cursor: 'pointer',
                          fontSize: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease',
                          boxShadow: newPartyEmoji === emoji ? '0 4px 20px rgba(102,126,234,0.4)' : 'none',
                        }}
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </LiquidSurface>
              </div>

              {/* Movie Selection */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{ 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  marginBottom: '14px', 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '10px',
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px', 
                  opacity: 0.7 
                }}>
                  Select Movies
                  {selectedMovieIds.length > 0 && (
                    <span style={{ 
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      padding: '5px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'none',
                      letterSpacing: 'normal',
                      opacity: 1,
                    }}>
                      {selectedMovieIds.length} selected
                    </span>
                  )}
                </label>
                
                {availableMovies.length > 0 ? (
                  <LiquidSurface
                    variant="card"
                    cornerRadius={20}
                    padding="16px"
                    displacementScale={30}
                    mouseContainer={containerRef}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                        gap: '16px',
                      }}
                    >
                      {availableMovies.map(movie => (
                        <motion.div
                          key={movie.id}
                          whileHover={{ scale: 1.05, y: -3 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleMovieSelection(movie.id)}
                          style={{
                            position: 'relative',
                            cursor: 'pointer',
                            borderRadius: '14px',
                            overflow: 'hidden',
                            border: selectedMovieIds.includes(movie.id)
                              ? '3px solid #667eea'
                              : '3px solid transparent',
                            boxShadow: selectedMovieIds.includes(movie.id) 
                              ? '0 4px 20px rgba(102,126,234,0.5)' 
                              : 'none',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <img
                            src={getPosterUrl(movie.poster_path, 'w185')}
                            alt={movie.title}
                            style={{
                              width: '100%',
                              aspectRatio: '2/3',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />
                          {selectedMovieIds.includes(movie.id) && (
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
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px',
                                fontWeight: 700,
                                boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
                              }}
                            >
                              ✓
                            </motion.div>
                          )}
                          <div 
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              padding: '24px 8px 8px',
                              background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                            }}
                          >
                            <p style={{ 
                              fontSize: '11px', 
                              fontWeight: 600, 
                              lineHeight: 1.2,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                              {movie.title}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </LiquidSurface>
                ) : (
                  <LiquidSurface
                    variant="card"
                    cornerRadius={20}
                    padding="48px 24px"
                    displacementScale={30}
                    mouseContainer={containerRef}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>📚</span>
                      <p style={{ opacity: 0.8, fontSize: '16px', marginBottom: '8px', fontWeight: 500 }}>
                        No movies in your library yet
                      </p>
                      <p style={{ opacity: 0.5, fontSize: '14px', marginBottom: '20px' }}>
                        Add movies to your watchlist or favorites first!
                      </p>
                      <Link to="/discover" style={{ textDecoration: 'none' }}>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          style={{
                            padding: '12px 24px',
                            borderRadius: '50px',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            border: 'none',
                            color: '#fff',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          🎬 Discover Movies
                        </motion.button>
                      </Link>
                    </div>
                  </LiquidSurface>
                )}
              </div>

              {/* Actions */}
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  paddingTop: '20px',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Link to="/watch-party" style={{ flex: 1, textDecoration: 'none' }}>
                  <motion.button
                    whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.12)' }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      width: '100%',
                      padding: '16px 28px',
                      borderRadius: '50px',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: '16px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Cancel
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={canCreate ? { scale: 1.02, boxShadow: '0 8px 30px rgba(102,126,234,0.5)' } : {}}
                  whileTap={canCreate ? { scale: 0.98 } : {}}
                  onClick={handleCreateParty}
                  disabled={!canCreate}
                  style={{
                    flex: 1,
                    padding: '16px 32px',
                    borderRadius: '50px',
                    background: canCreate
                      ? 'linear-gradient(135deg, #667eea, #764ba2)'
                      : 'rgba(255,255,255,0.08)',
                    border: 'none',
                    color: '#fff',
                    cursor: canCreate ? 'pointer' : 'not-allowed',
                    fontWeight: 600,
                    fontSize: '16px',
                    opacity: canCreate ? 1 : 0.5,
                    transition: 'all 0.2s ease',
                    boxShadow: canCreate 
                      ? '0 4px 20px rgba(102,126,234,0.4)' 
                      : 'none',
                  }}
                >
                  Create Party ✨
                </motion.button>
              </div>
            </div>
          </LiquidSurface>
        </motion.div>
      </main>
    </div>
  );
}
