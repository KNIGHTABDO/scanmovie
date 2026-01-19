import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router';
import { LiquidSurface } from './Liquid/LiquidSurface';
import { AIResponseBubble } from './AIResponseCard';
import { getAIResponse, sendToolResult, type AIMessage } from '~/services/ai';
import { searchMovies, discoverMovies, type Movie } from '~/services/tmdb';
import { useVoiceInput } from '~/hooks/useVoiceInput';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  movies?: Movie[];
  isLoading?: boolean;
}

export function AIChat({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hey there! 🎬 I'm ScanMovie AI. Ask me for movie recommendations, or just chat about films! 🎤 Try voice search!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Voice input
  const { isListening, transcript, isSupported: voiceSupported, startListening, stopListening } = useVoiceInput();

  // Update input when voice transcript changes
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', content: userMessage }]);
    
    // Add loading message
    const loadingId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: loadingId, role: 'assistant', content: '', isLoading: true }]);
    setIsLoading(true);

    try {
      // Build conversation history for AI
      const aiMessages: AIMessage[] = messages
        .filter(m => !m.isLoading)
        .map(m => ({ role: m.role, content: m.content }));
      aiMessages.push({ role: 'user', content: userMessage });

      const response = await getAIResponse(aiMessages);

      // Handle tool calls (movie search or discovery)
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
          const query = args.query;
          movieResults = await searchMovies(query);
          
          toolResultSummary = movieResults.length > 0
            ? `Found ${movieResults.length} movies: ${movieResults.slice(0, 5).map(m => m.title).join(', ')}`
            : 'No movies found for that search.';
        }

        const topMovies = movieResults.slice(0, 6);
        
        const followUp = await sendToolResult(
          aiMessages,
          toolCall.id,
          toolName,
          toolResultSummary
        );

        // Update with movie results
        setMessages(prev => prev.map(m => 
          m.id === loadingId
            ? {
                ...m,
                content: followUp.content || `Here's what I found! 🍿`,
                movies: topMovies,
                isLoading: false,
              }
            : m
        ));
      } else {
        // Regular text response
        setMessages(prev => prev.map(m =>
          m.id === loadingId
            ? { ...m, content: response.content || '', isLoading: false }
            : m
        ));
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => prev.map(m =>
        m.id === loadingId
          ? { ...m, content: '😅 Oops! Something went wrong. Make sure your GitHub token is set up!', isLoading: false }
          : m
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 1998,
            }}
          />
          
          {/* Chat Window */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: '100px',
              right: '24px',
              width: 'min(420px, calc(100vw - 48px))',
              height: 'min(600px, calc(100vh - 160px))',
              zIndex: 1999,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <LiquidSurface
              variant="modal"
              cornerRadius={24}
              padding="0"
              width="100%"
              height="100%"
            >
              {/* Header - Compact */}
              <div style={{
                padding: '14px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(0,0,0,0.2)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                  }}>
                    🤖
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: '#fff' }}>
                      ScanMovie AI
                    </h3>
                    <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                      Powered by GitHub Models
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                >
                  ✕
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'user' ? (
                      /* User Message */
                      <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-sm bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm leading-relaxed shadow-lg shadow-purple-500/20">
                        {message.content}
                      </div>
                    ) : (
                      /* AI Message - Enhanced with gradient border */
                      <div 
                        className="max-w-[92%] rounded-2xl overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(168,85,247,0.1) 100%)',
                          border: '1px solid rgba(139,92,246,0.3)',
                          backdropFilter: 'blur(16px)',
                          WebkitBackdropFilter: 'blur(16px)',
                          width: message.movies?.length ? '100%' : 'auto',
                          boxShadow: '0 4px 20px rgba(139,92,246,0.1)',
                        }}
                      >
                        {/* Subtle top glow */}
                        <div 
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '50px',
                            background: 'linear-gradient(180deg, rgba(139,92,246,0.08) 0%, transparent 100%)',
                            pointerEvents: 'none',
                            borderRadius: '16px 16px 0 0',
                          }}
                        />
                        
                        {/* TEXT CONTENT - Part 1 */}
                        <div className="px-4 py-3 text-white text-[13px] leading-relaxed relative">
                          {message.isLoading ? (
                            <div className="flex items-center gap-1.5 py-1">
                              <motion.span 
                                animate={{ opacity: [0.3, 1, 0.3] }} 
                                transition={{ duration: 1.2, repeat: Infinity, delay: 0 }} 
                                style={{ 
                                  width: '6px', 
                                  height: '6px', 
                                  borderRadius: '50%', 
                                  background: 'linear-gradient(135deg, #667eea, #a855f7)',
                                }}
                              />
                              <motion.span 
                                animate={{ opacity: [0.3, 1, 0.3] }} 
                                transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }} 
                                style={{ 
                                  width: '6px', 
                                  height: '6px', 
                                  borderRadius: '50%', 
                                  background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                                }}
                              />
                              <motion.span 
                                animate={{ opacity: [0.3, 1, 0.3] }} 
                                transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} 
                                style={{ 
                                  width: '6px', 
                                  height: '6px', 
                                  borderRadius: '50%', 
                                  background: 'linear-gradient(135deg, #ec4899, #667eea)',
                                }}
                              />
                            </div>
                          ) : (
                            message.content
                          )}
                        </div>

                        {/* MOVIES - Part 2 (INSIDE THE SAME CARD) */}
                        {message.movies && message.movies.length > 0 && (
                          <>
                            {/* Divider with gradient */}
                            <div 
                              className="h-px mx-4" 
                              style={{ 
                                background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent)' 
                              }} 
                            />
                            
                            {/* Scrollable Movie List */}
                            <div 
                              className="flex gap-3 overflow-x-auto p-4 hide-scrollbar"
                              style={{ scrollSnapType: 'x mandatory' }}
                            >
                              {message.movies.map((movie) => (
                                <Link
                                  key={movie.id}
                                  to={`/movie/${movie.id}`}
                                  onClick={onClose}
                                  style={{ textDecoration: 'none' }}
                                >
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-shrink-0 cursor-pointer"
                                    style={{ scrollSnapAlign: 'start' }}
                                  >
                                    <div className="w-24 flex flex-col gap-1">
                                      {/* Poster */}
                                      <div className="relative w-24 h-36 rounded-lg overflow-hidden bg-white/5 shadow-lg">
                                        <img
                                          src={movie.poster_path
                                            ? `https://image.tmdb.org/t/p/w185${movie.poster_path}`
                                            : 'https://via.placeholder.com/185x278?text=No+Poster'
                                          }
                                          alt={movie.title}
                                          className="w-full h-full object-cover"
                                        />
                                        {/* Rating Badge */}
                                        <div className="absolute bottom-1 left-1 bg-black/80 backdrop-blur-sm rounded px-1.5 py-0.5 text-[9px] font-semibold text-amber-400">
                                          ⭐ {movie.vote_average?.toFixed(1)}
                                        </div>
                                      </div>
                                      {/* Title */}
                                      <p className="text-[10px] text-gray-400 text-center leading-tight line-clamp-2">
                                        {movie.title}
                                      </p>
                                    </div>
                                  </motion.div>
                                </Link>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input - iMessage Style with Voice */}
              <form onSubmit={handleSubmit} style={{
                padding: '12px 16px 16px',
              }}>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.08)',
                  border: isListening ? '1px solid #667eea' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '24px',
                  padding: '6px 6px 6px 18px',
                  transition: 'border-color 0.2s ease',
                }}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isListening ? "Listening..." : "Ask for recommendations..."}
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      background: 'none',
                      border: 'none',
                      outline: 'none',
                      color: '#fff',
                      fontSize: '14px',
                    }}
                  />
                  
                  {/* Voice Button */}
                  {voiceSupported && (
                    <motion.button
                      type="button"
                      onClick={isListening ? stopListening : startListening}
                      disabled={isLoading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        background: isListening 
                          ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                          : 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '34px',
                        height: '34px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '14px',
                        transition: 'background 0.2s ease',
                        flexShrink: 0,
                      }}
                    >
                      {isListening ? (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="6" width="12" height="12" rx="2" />
                          </svg>
                        </motion.div>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                          <line x1="12" y1="19" x2="12" y2="23"></line>
                          <line x1="8" y1="23" x2="16" y2="23"></line>
                        </svg>
                      )}
                    </motion.button>
                  )}
                  
                  {/* Send Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    whileHover={{ scale: input.trim() ? 1.05 : 1 }}
                    whileTap={{ scale: input.trim() ? 0.95 : 1 }}
                    style={{
                      background: input.trim()
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'rgba(255,255,255,0.15)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '34px',
                      height: '34px',
                      cursor: input.trim() ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: input.trim() ? '#fff' : 'rgba(255,255,255,0.4)',
                      fontSize: '14px',
                      transition: 'background 0.2s ease',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </motion.button>
                </div>
              </form>
            </LiquidSurface>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Floating Action Button
export function AIChatFAB({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        zIndex: 1997,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px',
      }}
    >
      <motion.span
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
      >
        🤖
      </motion.span>
    </motion.button>
  );
}
