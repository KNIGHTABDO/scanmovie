"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router';
import { LiquidSurface } from '~/components/Liquid/LiquidSurface';
import { MovieCard } from '~/components/MovieCard';
import { AIResponseCard } from '~/components/AIResponseCard';
import { QuickReplyChips, DEFAULT_QUICK_REPLIES, MOOD_QUICK_REPLIES } from '~/components/QuickReplyChips';
import { SkeletonMovieGrid, ThinkingDots } from '~/components/SkeletonLoading';
import { getAIResponse, sendToolResult, type AIMessage } from '~/services/ai';
import { searchMovies, discoverMovies, type Movie } from '~/services/tmdb';
import { useVoiceInput } from '~/hooks/useVoiceInput';
import { trackAction } from '~/services/achievements';

export function AISearch() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Voice input
  const { isListening, transcript, isSupported: voiceSupported, startListening, stopListening } = useVoiceInput();

  // Check mobile on mount
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  // Update query when voice transcript changes
  useEffect(() => {
    if (transcript) {
      setQuery(transcript);
    }
  }, [transcript]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isSearching) return;

    setIsSearching(true);
    setError('');
    setHasSearched(true);

    try {
      const messages: AIMessage[] = [{ role: 'user', content: query.trim() }];
      const response = await getAIResponse(messages);

      if (response.toolCalls && response.toolCalls.length > 0) {
        const toolCall = response.toolCalls[0];
        const toolName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        
        let movieResults: Movie[] = [];
        let toolResultSummary = '';
        
        if (toolName === 'explore_cinema') {
          // Smart Discovery - use enhanced filters
          const { genre_ids, year_gte, year_lte, vote_average_gte, vote_count_gte, vote_count_lte, sort_by, page } = args;
          movieResults = await discoverMovies(
            genre_ids,
            year_gte,
            year_lte,
            sort_by || 'popularity.desc',
            page || '1',
            vote_average_gte,
            vote_count_gte,
            vote_count_lte
          );
          
          toolResultSummary = movieResults.length > 0
            ? `Discovered ${movieResults.length} movies: ${movieResults.slice(0, 5).map(m => m.title).join(', ')}`
            : 'No movies found with those filters.';
        } else if (toolName === 'search_movies') {
          // Fallback text search for specific titles/actors
          const searchQuery = args.query;
          movieResults = await searchMovies(searchQuery);
          
          toolResultSummary = movieResults.length > 0
            ? `Found ${movieResults.length} movies: ${movieResults.slice(0, 5).map(m => m.title).join(', ')}`
            : 'No movies found for that search.';
        }
        
        setMovies(movieResults.slice(0, 12));
        
        const followUp = await sendToolResult(
          messages,
          toolCall.id,
          toolName,
          toolResultSummary
        );

        setAiResponse(followUp.content || `Here's what I found! 🍿`);
      
        // Track AI search for achievements
        trackAction('ai_search');
      } else {
        setAiResponse(response.content || '');
        setMovies([]);
      }
    } catch (err) {
      console.error('AI Search error:', err);
      setError('Something went wrong. Make sure your GitHub token is configured!');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle quick reply selection
  const handleQuickReply = (queryText: string) => {
    setQuery(queryText);
    // Auto-submit after a brief delay
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      }
    }, 100);
  };

  const handleNewSearch = () => {
    setQuery('');
    setHasSearched(false);
    setAiResponse('');
    setMovies([]);
    setError('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div 
      ref={containerRef}
      style={{ 
        minHeight: '100vh', 
        position: 'relative',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
        background: '#0a0a0f',
      }}
    >
      {/* Cinematic Background - Same style as Home */}
      <div
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
        {/* Deep Radial Gradient Background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 120% 80% at 50% 0%, #2e1065 0%, #1e1b4b 25%, #0f172a 50%, #0a0a0f 100%)',
          }}
        />
        
        {/* Animated Ambient Glow Orbs */}
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '10%',
            left: '20%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <motion.div
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [1.1, 1, 1.1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{
            position: 'absolute',
            top: '40%',
            right: '10%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <motion.div
          animate={{
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '30%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        {/* Dark Vignette Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.8) 100%)',
            zIndex: 1,
          }}
        />
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <AnimatePresence mode="wait">
          {!hasSearched ? (
            /* ZERO STATE - Hero with Glass Card */
            <motion.div
              key="zero-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -30 }}
              style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: isMobile ? '24px 16px' : '40px 24px',
              }}
            >
              {/* Glass Card Container */}
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{ width: '100%', maxWidth: '900px' }}
              >
                <LiquidSurface
                  variant="container"
                  cornerRadius={isMobile ? 24 : 32}
                  padding={isMobile ? '40px 24px' : '60px 48px'}
                  displacementScale={60}
                  aberrationIntensity={2}
                  mouseContainer={containerRef}
                >
                  {/* Title with Gradient */}
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                      fontSize: isMobile ? '32px' : '56px',
                      fontWeight: 800,
                      lineHeight: 1.1,
                      textAlign: 'center',
                      marginBottom: isMobile ? '16px' : '20px',
                      background: 'linear-gradient(135deg, #fff 0%, #c4b5fd 50%, #fff 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    What do you want to watch?
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{
                      fontSize: isMobile ? '14px' : '18px',
                      color: 'rgba(255,255,255,0.5)',
                      textAlign: 'center',
                      marginBottom: isMobile ? '32px' : '40px',
                    }}
                  >
                    Describe the vibe, genre, or mood — I'll find the perfect movies for you
                  </motion.p>

                  {/* Premium Search Input */}
                  <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    onSubmit={handleSearch}
                    style={{ width: '100%', maxWidth: '700px', margin: '0 auto' }}
                  >
                    <div
                      style={{
                        position: 'relative',
                        borderRadius: '50px',
                        overflow: 'hidden',
                        background: 'rgba(0,0,0,0.4)',
                        border: isListening ? '1px solid #667eea' : '1px solid rgba(255,255,255,0.15)',
                        boxShadow: isListening 
                          ? '0 8px 32px rgba(102, 126, 234, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                          : '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                      }}
                    >
                      <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={isListening ? "🎤 Listening..." : (isMobile ? "Describe the vibe..." : "Describe the vibe... e.g., '90s sci-fi with mind-bending plots'")}
                        style={{
                          width: '100%',
                          padding: isMobile ? '18px 110px 18px 24px' : '22px 130px 22px 32px',
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          color: '#fff',
                          fontSize: isMobile ? '16px' : '18px',
                        }}
                      />
                      
                      {/* Voice Button */}
                      {voiceSupported && (
                        <motion.button
                          type="button"
                          onClick={isListening ? stopListening : startListening}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            position: 'absolute',
                            right: isMobile ? '58px' : '70px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: isMobile ? '40px' : '46px',
                            height: isMobile ? '40px' : '46px',
                            borderRadius: '50%',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isListening
                              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                              : 'rgba(255,255,255,0.1)',
                            boxShadow: isListening ? '0 4px 20px rgba(239, 68, 68, 0.4)' : 'none',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {isListening ? (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                                <rect x="6" y="6" width="12" height="12" rx="2" />
                              </svg>
                            </motion.div>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                              <line x1="12" y1="19" x2="12" y2="23"></line>
                              <line x1="8" y1="23" x2="16" y2="23"></line>
                            </svg>
                          )}
                        </motion.button>
                      )}
                      
                      {/* Search Button */}
                      <motion.button
                        type="submit"
                        disabled={isSearching || !query.trim()}
                        whileHover={{ scale: query.trim() ? 1.1 : 1 }}
                        whileTap={{ scale: query.trim() ? 0.95 : 1 }}
                        style={{
                          position: 'absolute',
                          right: isMobile ? '8px' : '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: isMobile ? '44px' : '52px',
                          height: isMobile ? '44px' : '52px',
                          borderRadius: '50%',
                          border: 'none',
                          cursor: query.trim() ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: query.trim()
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : 'rgba(255,255,255,0.1)',
                          boxShadow: query.trim() ? '0 4px 20px rgba(102, 126, 234, 0.4)' : 'none',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {isSearching ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            style={{
                              width: '24px',
                              height: '24px',
                              border: '2px solid rgba(255,255,255,0.3)',
                              borderTopColor: '#fff',
                              borderRadius: '50%',
                            }}
                          />
                        ) : (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                          </svg>
                        )}
                      </motion.button>
                    </div>
                  </motion.form>

                  {/* Quick Reply Chips - Enhanced */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    style={{
                      marginTop: isMobile ? '24px' : '32px',
                      width: '100%',
                    }}
                  >
                    <p style={{
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.4)',
                      textAlign: 'center',
                      marginBottom: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}>
                      ✨ Quick suggestions
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <QuickReplyChips
                        replies={DEFAULT_QUICK_REPLIES.slice(0, isMobile ? 4 : 8)}
                        onSelect={handleQuickReply}
                        isMobile={isMobile}
                        variant="default"
                      />
                    </div>
                    
                    {/* Mood-based suggestions */}
                    <p style={{
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.4)',
                      textAlign: 'center',
                      marginTop: '20px',
                      marginBottom: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}>
                      😊 By mood
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <QuickReplyChips
                        replies={MOOD_QUICK_REPLIES.slice(0, isMobile ? 3 : 6)}
                        onSelect={handleQuickReply}
                        isMobile={isMobile}
                        variant="default"
                      />
                    </div>
                  </motion.div>
                </LiquidSurface>
              </motion.div>

              {/* Back Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                style={{ marginTop: '32px' }}
              >
                <Link
                  to="/"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '14px',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Back to Home
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            /* ACTIVE STATE - Results */
            <motion.div
              key="active-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                minHeight: '100vh',
                paddingTop: isMobile ? '100px' : '120px',
                paddingBottom: '120px',
                paddingLeft: isMobile ? '16px' : '24px',
                paddingRight: isMobile ? '16px' : '24px',
              }}
            >
              <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* AI Response Card */}
                {aiResponse && (
                  <div style={{ marginBottom: '40px' }}>
                    <AIResponseCard
                      content={aiResponse}
                      isLoading={false}
                      variant="default"
                      containerRef={containerRef}
                    />
                  </div>
                )}

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginBottom: '40px',
                      padding: '24px',
                      borderRadius: '16px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      color: '#f87171',
                    }}
                  >
                    {error}
                  </motion.div>
                )}

                {/* Loading */}
                {isSearching && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '80px 0',
                    }}
                  >
                    <LiquidSurface
                      variant="container"
                      cornerRadius={24}
                      padding="48px 64px"
                      mouseContainer={containerRef}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        style={{ fontSize: '48px', marginBottom: '16px', textAlign: 'center' }}
                      >
                        🎬
                      </motion.div>
                      <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', margin: 0 }}>
                        Finding the perfect movies for you...
                      </p>
                    </LiquidSurface>
                  </motion.div>
                )}

                {/* Movie Grid */}
                {movies.length > 0 && !isSearching && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div style={{ marginBottom: '24px', display: 'inline-block' }}>
                      <LiquidSurface
                        variant="container"
                        cornerRadius={16}
                        padding="16px 24px"
                        mouseContainer={containerRef}
                      >
                        <h2 style={{
                          fontSize: isMobile ? '18px' : '22px',
                          fontWeight: 700,
                          color: '#fff',
                          margin: 0,
                        }}>
                          🎯 Top Picks for You
                        </h2>
                      </LiquidSurface>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile 
                        ? 'repeat(2, 1fr)' 
                        : 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: isMobile ? '12px' : '24px',
                    }}>
                      {movies.map((movie, index) => (
                        <motion.div
                          key={movie.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <MovieCard movie={movie} index={index} />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* No Results */}
                {!isSearching && hasSearched && movies.length === 0 && aiResponse && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ textAlign: 'center', padding: '80px 0' }}
                  >
                    <LiquidSurface
                      variant="container"
                      cornerRadius={24}
                      padding="48px"
                      mouseContainer={containerRef}
                    >
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '18px', margin: 0 }}>
                        No movie results for this query. Try a different search!
                      </p>
                    </LiquidSurface>
                  </motion.div>
                )}
              </div>

              {/* Sticky Bottom Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: isMobile ? '16px' : '24px',
                  background: 'linear-gradient(to top, rgba(10,10,15,0.98) 0%, rgba(10,10,15,0.9) 60%, transparent 100%)',
                  zIndex: 100,
                }}
              >
                <form onSubmit={handleSearch} style={{ maxWidth: '700px', margin: '0 auto' }}>
                  <LiquidSurface
                    variant="navbar"
                    cornerRadius={50}
                    padding="8px 8px 8px 24px"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for more..."
                        style={{
                          flex: 1,
                          background: 'none',
                          border: 'none',
                          outline: 'none',
                          color: '#fff',
                          fontSize: '16px',
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleNewSearch}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '50px',
                          background: 'rgba(255,255,255,0.1)',
                          border: 'none',
                          color: 'rgba(255,255,255,0.6)',
                          fontSize: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                          e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                        }}
                      >
                        Clear
                      </button>
                      <motion.button
                        type="submit"
                        disabled={isSearching || !query.trim()}
                        whileHover={{ scale: query.trim() ? 1.05 : 1 }}
                        whileTap={{ scale: query.trim() ? 0.95 : 1 }}
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          border: 'none',
                          cursor: query.trim() ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: query.trim()
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : 'rgba(255,255,255,0.1)',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {isSearching ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            style={{
                              width: '20px',
                              height: '20px',
                              border: '2px solid rgba(255,255,255,0.3)',
                              borderTopColor: '#fff',
                              borderRadius: '50%',
                            }}
                          />
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                          </svg>
                        )}
                      </motion.button>
                    </div>
                  </LiquidSurface>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default AISearch;
