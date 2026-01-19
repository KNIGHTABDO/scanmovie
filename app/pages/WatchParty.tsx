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

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (isCreating || showShareModal || showImportModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCreating, showShareModal, showImportModal]);

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
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                zIndex: 1998,
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.target === e.currentTarget && setIsCreating(false)}
              style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                padding: '40px 20px',
                zIndex: 1999,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  maxWidth: '550px',
                  borderRadius: '32px',
                  flexShrink: 0,
                }}
              >
                <LiquidSurface variant="modal" cornerRadius={32} padding="0">
                  {/* Modal Header - Fixed */}
                  <div
                    style={{
                      padding: '28px 32px 20px',
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                      background: 'linear-gradient(180deg, rgba(102,126,234,0.1) 0%, transparent 100%)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h2 style={{ fontSize: '26px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '32px' }}>✨</span>
                        Create Watch Party
                      </h2>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsCreating(false)}
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: 'none',
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          color: '#fff',
                        }}
                      >
                        ✕
                      </motion.button>
                    </div>
                    <p style={{ fontSize: '14px', opacity: 0.6, marginTop: '8px' }}>
                      Curate the perfect movie night for your friends
                    </p>
                  </div>

                  {/* Modal Body */}
                  <div 
                    style={{ 
                      padding: '24px 32px 32px',
                    }}
                  >
                    {/* Party Name */}
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.7 }}>
                        Party Name
                      </label>
                      <input
                        type="text"
                        value={newPartyName}
                        onChange={e => setNewPartyName(e.target.value)}
                        placeholder="Friday Night Horror Marathon"
                        style={{
                          width: '100%',
                          padding: '16px 20px',
                          borderRadius: '14px',
                          background: 'rgba(255,255,255,0.06)',
                          border: '2px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                          fontSize: '16px',
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
                    <div style={{ marginBottom: '28px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.7 }}>
                        Choose an Emoji
                      </label>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)' }}>
                        {PARTY_EMOJIS.map(emoji => (
                          <motion.button
                            key={emoji}
                            whileHover={{ scale: 1.15, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setNewPartyEmoji(emoji)}
                            style={{
                              width: '52px',
                              height: '52px',
                              borderRadius: '14px',
                              background: newPartyEmoji === emoji
                                ? 'linear-gradient(135deg, #667eea, #764ba2)'
                                : 'rgba(255,255,255,0.06)',
                              border: newPartyEmoji === emoji ? '2px solid rgba(102,126,234,0.5)' : '2px solid transparent',
                              cursor: 'pointer',
                              fontSize: '26px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease',
                              boxShadow: newPartyEmoji === emoji ? '0 4px 20px rgba(102,126,234,0.3)' : 'none',
                            }}
                          >
                            {emoji}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Movie Selection */}
                    <div style={{ marginBottom: '28px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.7 }}>
                        Select Movies 
                        {selectedMovieIds.length > 0 && (
                          <span style={{ 
                            marginLeft: '8px', 
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 700,
                          }}>
                            {selectedMovieIds.length} selected
                          </span>
                        )}
                      </label>
                      {availableMovies.length > 0 ? (
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                            gap: '14px',
                            maxHeight: '280px',
                            overflow: 'auto',
                            padding: '12px',
                            borderRadius: '16px',
                            background: 'rgba(0,0,0,0.25)',
                            border: '1px solid rgba(255,255,255,0.05)',
                          }}
                        >
                          {availableMovies.map(movie => (
                            <motion.div
                              key={movie.id}
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => toggleMovieSelection(movie.id)}
                              style={{
                                position: 'relative',
                                cursor: 'pointer',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                border: selectedMovieIds.includes(movie.id)
                                  ? '3px solid #667eea'
                                  : '3px solid transparent',
                                boxShadow: selectedMovieIds.includes(movie.id) 
                                  ? '0 4px 16px rgba(102,126,234,0.4)' 
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
                                }}
                              />
                            {selectedMovieIds.includes(movie.id) && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                style={{
                                  position: 'absolute',
                                  top: '6px',
                                  right: '6px',
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '14px',
                                  fontWeight: 700,
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                }}
                              >
                                ✓
                              </motion.div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div
                        style={{
                          padding: '40px 24px',
                          textAlign: 'center',
                          borderRadius: '16px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '2px dashed rgba(255,255,255,0.1)',
                        }}
                      >
                        <span style={{ fontSize: '32px', marginBottom: '12px', display: 'block' }}>📚</span>
                        <p style={{ opacity: 0.7, fontSize: '14px', marginBottom: '4px' }}>
                          No movies in your library yet
                        </p>
                        <p style={{ opacity: 0.5, fontSize: '13px' }}>
                          Add movies to your watchlist or favorites first!
                        </p>
                      </div>
                    )}
                    </div>

                    {/* Actions */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '14px',
                        justifyContent: 'flex-end',
                        paddingTop: '20px',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        marginTop: '8px',
                      }}
                    >
                      <motion.button
                        whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.15)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsCreating(false)}
                        style={{
                          padding: '14px 28px',
                          borderRadius: '50px',
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                          cursor: 'pointer',
                          fontWeight: 500,
                          fontSize: '15px',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: '0 6px 24px rgba(102,126,234,0.4)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCreateParty}
                        disabled={!newPartyName.trim() || selectedMovieIds.length === 0}
                        style={{
                          padding: '14px 32px',
                          borderRadius: '50px',
                          background: newPartyName.trim() && selectedMovieIds.length > 0
                            ? 'linear-gradient(135deg, #667eea, #764ba2)'
                            : 'rgba(255,255,255,0.08)',
                          border: 'none',
                          color: '#fff',
                          cursor: newPartyName.trim() && selectedMovieIds.length > 0 ? 'pointer' : 'not-allowed',
                          fontWeight: 600,
                          fontSize: '15px',
                          opacity: newPartyName.trim() && selectedMovieIds.length > 0 ? 1 : 0.5,
                          transition: 'all 0.2s ease',
                          boxShadow: newPartyName.trim() && selectedMovieIds.length > 0 
                            ? '0 4px 16px rgba(102,126,234,0.3)' 
                            : 'none',
                        }}
                      >
                        Create Party ✨
                      </motion.button>
                    </div>
                  </div>
                </LiquidSurface>
              </div>
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
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                zIndex: 1998,
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                zIndex: 1999,
                pointerEvents: 'none',
              }}
            >
              <div style={{ width: '100%', maxWidth: '500px', pointerEvents: 'auto' }}>
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
                        padding: '14px 16px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '2px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontSize: '14px',
                      }}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 4px 16px rgba(102,126,234,0.4)' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyToClipboard(shareLink)}
                      style={{
                        padding: '14px 24px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      Copy
                    </motion.button>
                  </div>

                  {/* AI Description - Enhanced */}
                  <div
                    style={{
                      position: 'relative',
                      padding: '20px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(168, 85, 247, 0.08) 100%)',
                      border: '1px solid rgba(139, 92, 246, 0.25)',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Animated glow */}
                    <motion.div
                      animate={{
                        background: [
                          'radial-gradient(circle at 0% 0%, rgba(139,92,246,0.15) 0%, transparent 50%)',
                          'radial-gradient(circle at 100% 0%, rgba(139,92,246,0.15) 0%, transparent 50%)',
                          'radial-gradient(circle at 100% 100%, rgba(139,92,246,0.15) 0%, transparent 50%)',
                          'radial-gradient(circle at 0% 100%, rgba(139,92,246,0.15) 0%, transparent 50%)',
                          'radial-gradient(circle at 0% 0%, rgba(139,92,246,0.15) 0%, transparent 50%)',
                        ],
                      }}
                      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                      }}
                    />
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', position: 'relative' }}>
                      <motion.span
                        animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ fontSize: '16px' }}
                      >
                        ✨
                      </motion.span>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(167, 139, 250, 0.9)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                        AI-Generated Description
                      </p>
                    </div>
                    
                    {isGeneratingDesc ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
                        <motion.span 
                          animate={{ opacity: [0.3, 1, 0.3] }} 
                          transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                          style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #a855f7)' }}
                        />
                        <motion.span 
                          animate={{ opacity: [0.3, 1, 0.3] }} 
                          transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                          style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}
                        />
                        <motion.span 
                          animate={{ opacity: [0.3, 1, 0.3] }} 
                          transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                          style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'linear-gradient(135deg, #ec4899, #667eea)' }}
                        />
                        <span style={{ marginLeft: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
                          Generating...
                        </span>
                      </div>
                    ) : (
                      <div style={{ position: 'relative' }}>
                        <p style={{ fontSize: '15px', lineHeight: 1.75, color: 'rgba(255,255,255,0.9)' }}>{aiDescription}</p>
                        <motion.button
                          whileHover={{ scale: 1.02, background: 'rgba(139,92,246,0.2)' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => copyToClipboard(aiDescription)}
                          style={{
                            marginTop: '14px',
                            padding: '10px 18px',
                            borderRadius: '10px',
                            background: 'rgba(139,92,246,0.1)',
                            border: '1px solid rgba(139,92,246,0.3)',
                            color: '#a78bfa',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 600,
                          }}
                        >
                          📋 Copy Description
                        </motion.button>
                      </div>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowShareModal(false)}
                    style={{
                      width: '100%',
                      marginTop: '24px',
                      padding: '14px',
                      borderRadius: '14px',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    Close
                  </motion.button>
                </LiquidSurface>
              </div>
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
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                zIndex: 1998,
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                zIndex: 1999,
                pointerEvents: 'none',
              }}
            >
              <div style={{ width: '100%', maxWidth: '450px', pointerEvents: 'auto' }}>
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
                      padding: '16px 20px',
                      borderRadius: '14px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '2px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontSize: '16px',
                      outline: 'none',
                      marginBottom: '24px',
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

                  <div style={{ display: 'flex', gap: '14px' }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowImportModal(false)}
                      style={{
                        flex: 1,
                        padding: '14px',
                        borderRadius: '50px',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: '0 4px 16px rgba(102,126,234,0.4)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleImport}
                      style={{
                        flex: 1,
                        padding: '14px',
                        borderRadius: '50px',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        fontWeight: 600,
                        boxShadow: '0 4px 16px rgba(102,126,234,0.3)',
                      }}
                    >
                      Import 🎉
                    </motion.button>
                  </div>
                </LiquidSurface>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
