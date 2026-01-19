"use client";

/**
 * Watch Party Page
 * ================
 * Create and share movie watch parties with friends.
 * Uses LiquidGlass styling consistent with the app.
 * 
 * Features:
 * - Create watch parties from watchlist/favorites
 * - Generate shareable links
 * - Import friend's watch parties
 * - AI-generated party descriptions
 */

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { LiquidSurface } from '~/components/Liquid/LiquidSurface';
import { MovieCard } from '~/components/MovieCard';
import { generateWatchPartyDescription } from '~/services/ai';
import {
  getMovieDetails,
  getPosterUrl,
  type Movie,
} from '~/services/tmdb';
import {
  getWatchParties,
  createWatchParty,
  deleteWatchParty,
  generateShareableLink,
  importWatchParty,
  type WatchParty,
} from '~/services/userDataStore';
import { useUserData } from '~/contexts/UserDataContext';

const PARTY_EMOJIS = ['🎬', '🍿', '🎭', '🎪', '🌙', '🎉', '👻', '❤️', '🔥', '✨', '🎮', '🚀'];

export function WatchPartyPage() {
  const [searchParams] = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State
  const [parties, setParties] = useState<WatchParty[]>([]);
  const [selectedParty, setSelectedParty] = useState<WatchParty | null>(null);
  const [partyMovies, setPartyMovies] = useState<Movie[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [aiDescription, setAiDescription] = useState('');
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  
  // New party form state
  const [newPartyName, setNewPartyName] = useState('');
  const [newPartyEmoji, setNewPartyEmoji] = useState('🎬');
  const [selectedMovieIds, setSelectedMovieIds] = useState<number[]>([]);
  
  // User data for movie selection
  const { watchlist, favorites } = useUserData();

  // Load parties and check for shared import
  useEffect(() => {
    setParties(getWatchParties());
    
    // Check for share parameter in URL
    const shareCode = searchParams.get('share');
    if (shareCode) {
      const imported = importWatchParty(shareCode);
      if (imported) {
        setParties(getWatchParties());
        setSelectedParty(imported);
        showNotification('🎉 Watch party imported successfully!');
      }
    }
  }, [searchParams]);

  // Load movies when a party is selected
  useEffect(() => {
    if (!selectedParty) {
      setPartyMovies([]);
      return;
    }

    async function loadPartyMovies() {
      const movies = await Promise.all(
        selectedParty!.movieIds.map(id => getMovieDetails(id).catch(() => null))
      );
      setPartyMovies(movies.filter(Boolean) as Movie[]);
    }
    
    loadPartyMovies();
  }, [selectedParty]);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateParty = async () => {
    if (!newPartyName.trim() || selectedMovieIds.length === 0) return;
    
    const party = createWatchParty(
      newPartyName.trim(),
      newPartyEmoji,
      selectedMovieIds,
      'You'
    );
    
    setParties(getWatchParties());
    setSelectedParty(party);
    setIsCreating(false);
    setNewPartyName('');
    setNewPartyEmoji('🎬');
    setSelectedMovieIds([]);
    showNotification('🎉 Watch party created!');
  };

  const handleDeleteParty = (partyId: string) => {
    deleteWatchParty(partyId);
    setParties(getWatchParties());
    if (selectedParty?.id === partyId) {
      setSelectedParty(null);
    }
    showNotification('Party deleted');
  };

  const handleShare = async (party: WatchParty) => {
    const link = generateShareableLink(party);
    setShareLink(link);
    setShowShareModal(true);
    
    // Generate AI description
    if (partyMovies.length > 0) {
      setIsGeneratingDesc(true);
      const desc = await generateWatchPartyDescription(partyMovies, party.name);
      setAiDescription(desc);
      setIsGeneratingDesc(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showNotification('📋 Copied to clipboard!');
    } catch {
      showNotification('Failed to copy');
    }
  };

  const handleImport = () => {
    if (!importCode.trim()) return;
    
    const imported = importWatchParty(importCode.trim());
    if (imported) {
      setParties(getWatchParties());
      setSelectedParty(imported);
      setShowImportModal(false);
      setImportCode('');
      showNotification('🎉 Watch party imported!');
    } else {
      showNotification('❌ Invalid share code');
    }
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

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={{
              position: 'fixed',
              top: '100px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2000,
            }}
          >
            <LiquidSurface variant="button" padding="12px 24px" cornerRadius={50}>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>{notification}</span>
            </LiquidSurface>
          </motion.div>
        )}
      </AnimatePresence>

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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '40px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <LiquidSurface
              variant="container"
              cornerRadius={24}
              padding="24px 32px"
              displacementScale={50}
              mouseContainer={containerRef}
            >
              <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
                🎉 Watch Party
              </h1>
              <p style={{ fontSize: '16px', opacity: 0.7 }}>
                Create movie nights and share with friends
              </p>
            </LiquidSurface>

            <div style={{ display: 'flex', gap: '12px' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowImportModal(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <LiquidSurface variant="button" padding="12px 20px" cornerRadius={50}>
                  <span style={{ fontWeight: 500 }}>📥 Import</span>
                </LiquidSurface>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCreating(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <LiquidSurface variant="modal" padding="12px 24px" cornerRadius={50}>
                  <span style={{ fontWeight: 600 }}>✨ Create Party</span>
                </LiquidSurface>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: parties.length > 0 ? '300px 1fr' : '1fr', gap: '24px' }}>
          {/* Parties List */}
          {parties.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <LiquidSurface
                variant="card"
                cornerRadius={24}
                padding="20px"
                displacementScale={45}
                mouseContainer={containerRef}
              >
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Your Parties</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {parties.map(party => (
                    <motion.div
                      key={party.id}
                      whileHover={{ scale: 1.02, x: 4 }}
                      onClick={() => setSelectedParty(party)}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '12px',
                        background: selectedParty?.id === party.id
                          ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3))'
                          : 'rgba(255,255,255,0.05)',
                        border: selectedParty?.id === party.id
                          ? '1px solid rgba(102, 126, 234, 0.5)'
                          : '1px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '24px' }}>{party.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 600, fontSize: '14px' }}>{party.name}</p>
                          <p style={{ fontSize: '12px', opacity: 0.6 }}>
                            {party.movieIds.length} movie{party.movieIds.length !== 1 ? 's' : ''} • by {party.createdBy}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </LiquidSurface>
            </motion.div>
          )}

          {/* Main Content Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {selectedParty ? (
              // Selected Party View
              <LiquidSurface
                variant="modal"
                cornerRadius={28}
                padding="32px"
                displacementScale={60}
                mouseContainer={containerRef}
              >
                {/* Party Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '40px' }}>{selectedParty.emoji}</span>
                      <h2 style={{ fontSize: '28px', fontWeight: 700 }}>{selectedParty.name}</h2>
                    </div>
                    <p style={{ fontSize: '14px', opacity: 0.6 }}>
                      Created by {selectedParty.createdBy} • {new Date(selectedParty.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleShare(selectedParty)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <LiquidSurface variant="button" padding="10px 16px" cornerRadius={50}>
                        <span>🔗 Share</span>
                      </LiquidSurface>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteParty(selectedParty.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <LiquidSurface variant="button" padding="10px 16px" cornerRadius={50}>
                        <span>🗑️</span>
                      </LiquidSurface>
                    </motion.button>
                  </div>
                </div>

                {/* Movies Grid */}
                {partyMovies.length > 0 ? (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                      gap: '20px',
                    }}
                  >
                    {partyMovies.map((movie, index) => (
                      <MovieCard key={movie.id} movie={movie} index={index} />
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', opacity: 0.6 }}>
                    <span style={{ fontSize: '48px' }}>🎬</span>
                    <p style={{ marginTop: '12px' }}>Loading movies...</p>
                  </div>
                )}
              </LiquidSurface>
            ) : (
              // Empty State
              <LiquidSurface
                variant="card"
                cornerRadius={28}
                padding="60px 40px"
                displacementScale={50}
                mouseContainer={containerRef}
              >
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '64px' }}>🎉</span>
                  <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '20px', marginBottom: '12px' }}>
                    No Watch Parties Yet
                  </h2>
                  <p style={{ fontSize: '16px', opacity: 0.6, marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
                    Create a watch party to curate movies for movie nights with friends!
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsCreating(true)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <LiquidSurface variant="modal" padding="14px 28px" cornerRadius={50}>
                      <span style={{ fontWeight: 600 }}>✨ Create Your First Party</span>
                    </LiquidSurface>
                  </motion.button>
                </div>
              </LiquidSurface>
            )}
          </motion.div>
        </div>
      </main>

      {/* Create Party Modal */}
      <AnimatePresence>
        {isCreating && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreating(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.7)',
                zIndex: 1998,
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'min(600px, calc(100vw - 48px))',
                maxHeight: 'calc(100vh - 100px)',
                overflow: 'auto',
                zIndex: 1999,
              }}
            >
              <LiquidSurface variant="modal" cornerRadius={28} padding="32px">
                <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
                  ✨ Create Watch Party
                </h2>

                {/* Party Name */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', display: 'block' }}>
                    Party Name
                  </label>
                  <input
                    type="text"
                    value={newPartyName}
                    onChange={e => setNewPartyName(e.target.value)}
                    placeholder="Friday Night Horror Marathon"
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff',
                      fontSize: '16px',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Emoji Picker */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', display: 'block' }}>
                    Choose an Emoji
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {PARTY_EMOJIS.map(emoji => (
                      <motion.button
                        key={emoji}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setNewPartyEmoji(emoji)}
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          background: newPartyEmoji === emoji
                            ? 'linear-gradient(135deg, #667eea, #764ba2)'
                            : 'rgba(255,255,255,0.08)',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '22px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Movie Selection */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', display: 'block' }}>
                    Select Movies ({selectedMovieIds.length} selected)
                  </label>
                  {availableMovies.length > 0 ? (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                        gap: '12px',
                        maxHeight: '250px',
                        overflow: 'auto',
                        padding: '8px',
                        borderRadius: '12px',
                        background: 'rgba(0,0,0,0.2)',
                      }}
                    >
                      {availableMovies.map(movie => (
                        <motion.div
                          key={movie.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleMovieSelection(movie.id)}
                          style={{
                            position: 'relative',
                            cursor: 'pointer',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: selectedMovieIds.includes(movie.id)
                              ? '2px solid #667eea'
                              : '2px solid transparent',
                          }}
                        >
                          <img
                            src={getPosterUrl(movie.poster_path, 'w185')}
                            alt={movie.title}
                            style={{
                              width: '100%',
                              aspectRatio: '2/3',
                              objectFit: 'cover',
                            }}
                          />
                          {selectedMovieIds.includes(movie.id) && (
                            <div
                              style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: '#667eea',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                              }}
                            >
                              ✓
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ opacity: 0.6, fontSize: '14px' }}>
                      Add movies to your watchlist or favorites first!
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsCreating(false)}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '50px',
                      background: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateParty}
                    disabled={!newPartyName.trim() || selectedMovieIds.length === 0}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '50px',
                      background: newPartyName.trim() && selectedMovieIds.length > 0
                        ? 'linear-gradient(135deg, #667eea, #764ba2)'
                        : 'rgba(255,255,255,0.1)',
                      border: 'none',
                      color: '#fff',
                      cursor: newPartyName.trim() && selectedMovieIds.length > 0 ? 'pointer' : 'not-allowed',
                      fontWeight: 600,
                    }}
                  >
                    Create Party ✨
                  </motion.button>
                </div>
              </LiquidSurface>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareModal(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.7)',
                zIndex: 1998,
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'min(500px, calc(100vw - 48px))',
                zIndex: 1999,
              }}
            >
              <LiquidSurface variant="modal" cornerRadius={28} padding="32px">
                <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
                  🔗 Share Watch Party
                </h2>
                <p style={{ fontSize: '14px', opacity: 0.6, marginBottom: '24px' }}>
                  Share this link with friends to invite them!
                </p>

                {/* Share Link */}
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '20px',
                  }}
                >
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff',
                      fontSize: '14px',
                    }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => copyToClipboard(shareLink)}
                    style={{
                      padding: '12px 20px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      border: 'none',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    Copy
                  </motion.button>
                </div>

                {/* AI Description */}
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(102, 126, 234, 0.1)',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                  }}
                >
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                    ✨ AI-Generated Description
                  </p>
                  {isGeneratingDesc ? (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }}>●</motion.span>
                      <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}>●</motion.span>
                      <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}>●</motion.span>
                    </div>
                  ) : (
                    <>
                      <p style={{ fontSize: '15px', lineHeight: 1.6 }}>{aiDescription}</p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => copyToClipboard(aiDescription)}
                        style={{
                          marginTop: '12px',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          background: 'rgba(255,255,255,0.1)',
                          border: 'none',
                          color: '#fff',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        📋 Copy Description
                      </motion.button>
                    </>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowShareModal(false)}
                  style={{
                    width: '100%',
                    marginTop: '20px',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  Close
                </motion.button>
              </LiquidSurface>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowImportModal(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.7)',
                zIndex: 1998,
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'min(450px, calc(100vw - 48px))',
                zIndex: 1999,
              }}
            >
              <LiquidSurface variant="modal" cornerRadius={28} padding="32px">
                <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
                  📥 Import Watch Party
                </h2>
                <p style={{ fontSize: '14px', opacity: 0.6, marginBottom: '24px' }}>
                  Paste the share link from a friend
                </p>

                <input
                  type="text"
                  value={importCode}
                  onChange={e => setImportCode(e.target.value)}
                  placeholder="Paste share link here..."
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff',
                    fontSize: '16px',
                    outline: 'none',
                    marginBottom: '20px',
                  }}
                />

                <div style={{ display: 'flex', gap: '12px' }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowImportModal(false)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleImport}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      border: 'none',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Import 🎉
                  </motion.button>
                </div>
              </LiquidSurface>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
