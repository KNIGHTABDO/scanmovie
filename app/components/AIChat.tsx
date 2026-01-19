import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiquidSurface } from './Liquid/LiquidSurface';
import { getAIResponse, sendToolResult, type AIMessage } from '~/services/ai';
import { searchMovies, type Movie } from '~/services/tmdb';

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
      content: "Hey there! 🎬 I'm ScanMovie AI. Ask me for movie recommendations, or just chat about films!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

      // Handle tool calls (movie search)
      if (response.toolCalls && response.toolCalls.length > 0) {
        const toolCall = response.toolCalls[0];
        
        if (toolCall.function.name === 'search_movies') {
          const args = JSON.parse(toolCall.function.arguments);
          const query = args.query;
          
          // Search movies
          const movieResults = await searchMovies(query);
          const topMovies = movieResults.slice(0, 6);
          
          // Get AI follow-up summary
          const toolResultSummary = topMovies.length > 0
            ? `Found ${topMovies.length} movies: ${topMovies.map(m => m.title).join(', ')}`
            : 'No movies found for that search.';
          
          const followUp = await sendToolResult(
            aiMessages,
            toolCall.id,
            'search_movies',
            toolResultSummary
          );

          // Update with movie results
          setMessages(prev => prev.map(m => 
            m.id === loadingId
              ? {
                  ...m,
                  content: followUp.content || `Here's what I found for "${query}" 🍿`,
                  movies: topMovies,
                  isLoading: false,
                }
              : m
          ));
        }
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
                      <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-sm bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm leading-relaxed">
                        {message.content}
                      </div>
                    ) : (
                      /* AI Message - SINGLE UNIFIED CARD */
                      <div 
                        className="max-w-[92%] rounded-2xl overflow-hidden border border-white/10"
                        style={{
                          background: 'rgba(0,0,0,0.6)',
                          backdropFilter: 'blur(16px)',
                          WebkitBackdropFilter: 'blur(16px)',
                          width: message.movies?.length ? '100%' : 'auto',
                        }}
                      >
                        {/* TEXT CONTENT - Part 1 */}
                        <div className="px-4 py-3 text-white text-[13px] leading-relaxed">
                          {message.isLoading ? (
                            <div className="flex gap-1 py-1">
                              <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} className="text-white/60">●</motion.span>
                              <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="text-white/60">●</motion.span>
                              <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="text-white/60">●</motion.span>
                            </div>
                          ) : (
                            message.content
                          )}
                        </div>

                        {/* MOVIES - Part 2 (INSIDE THE SAME CARD) */}
                        {message.movies && message.movies.length > 0 && (
                          <>
                            {/* Divider */}
                            <div className="h-px bg-white/10 mx-4" />
                            
                            {/* Scrollable Movie List */}
                            <div 
                              className="flex gap-3 overflow-x-auto p-4 hide-scrollbar"
                              style={{ scrollSnapType: 'x mandatory' }}
                            >
                              {message.movies.map((movie) => (
                                <motion.div
                                  key={movie.id}
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

              {/* Input - iMessage Style */}
              <form onSubmit={handleSubmit} style={{
                padding: '12px 16px 16px',
              }}>
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '24px',
                  padding: '6px 6px 6px 18px',
                }}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask for recommendations..."
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
