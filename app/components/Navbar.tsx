"use client";

/**
 * Navbar Component
 * ================
 * USES LIQUIDGLASS for the navigation bar.
 * Mobile-optimized with collapsible navigation.
 * Includes user profile/sign-in button.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { LiquidSurface } from './Liquid/LiquidSurface';
import { searchMovies, type Movie } from '~/services/tmdb';
import { useAuth } from '~/contexts/AuthContext';

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading: authLoading, signIn } = useAuth();

  // Check if mobile/tablet on mount and resize (hamburger shows until 1024px)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const results = await searchMovies(searchQuery);
          setSearchResults(results.slice(0, 6));
          setShowResults(true);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close results and mobile menu on route change
  useEffect(() => {
    setShowResults(false);
    setSearchQuery('');
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleResultClick = useCallback((movieId: number) => {
    setShowResults(false);
    setSearchQuery('');
    navigate(`/movie/${movieId}`);
  }, [navigate]);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: isMobile ? '12px 16px' : '16px 24px',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <LiquidSurface
          variant="navbar"
          cornerRadius={isMobile ? 14 : 16}
          padding={isMobile ? '14px 20px' : '16px 32px'}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            gap: '12px',
          }}>
            {/* Logo */}
            <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '10px' }}
              >
                <span style={{ fontSize: isMobile ? '24px' : '28px' }}>🎬</span>
                <span style={{ 
                  fontSize: isMobile ? '18px' : '24px', 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  ScanMovie
                </span>
              </motion.div>
            </Link>

            {/* Desktop Navigation Links - Hidden on Mobile */}
            {!isMobile && (
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <NavLink to="/" label="Home" />
                <NavLink to="/discover" label="Discover" />
                <NavLink to="/library" label="Library" />
                <NavLink to="/watch-party" label="Party 🎉" />
                <Link to="/ai" style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(168,85,247,0.2) 100%)',
                      border: '1px solid rgba(139,92,246,0.3)',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>✨</span>
                    <span style={{ fontWeight: 500, color: '#a78bfa', fontSize: '14px' }}>AI Assistant</span>
                  </motion.div>
                </Link>
                
                {/* User Profile / Sign In */}
                {isAuthenticated ? (
                  <Link to="/profile" style={{ textDecoration: 'none' }}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '2px solid rgba(139, 92, 246, 0.5)',
                        cursor: 'pointer',
                      }}
                    >
                      {user?.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || 'Profile'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          color: '#fff',
                        }}>
                          {user?.displayName?.[0] || '👤'}
                        </div>
                      )}
                    </motion.div>
                  </Link>
                ) : (
                  <motion.button
                    onClick={signIn}
                    disabled={authLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '20px',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                  >
                    <span>👤</span>
                    Sign In
                  </motion.button>
                )}
              </div>
            )}

            {/* Right Side: Search + Mobile Menu */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Search Bar */}
              <div ref={searchRef} style={{ position: 'relative' }}>
                <LiquidSurface
                  variant="button"
                  cornerRadius={50}
                  padding={isMobile ? '8px 12px' : '8px 16px'}
                  displacementScale={40}
                  blurAmount={0.05}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '10px' }}>
                    <span style={{ fontSize: '16px', opacity: 0.6 }}>🔍</span>
                    <input
                      type="text"
                      placeholder={isMobile ? 'Search...' : 'Search movies...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        background: 'none',
                        border: 'none',
                        outline: 'none',
                        color: '#fff',
                        fontSize: '14px',
                        width: isMobile ? '140px' : '200px',
                      }}
                    />
                    {isSearching && <span style={{ fontSize: '14px' }}>⏳</span>}
                  </div>
                </LiquidSurface>

                {/* Search Results Dropdown */}
                <AnimatePresence>
                  {showResults && searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 12px)',
                        right: 0,
                        width: isMobile ? '280px' : '320px',
                        zIndex: 100,
                      }}
                    >
                      <LiquidSurface
                        variant="modal"
                        cornerRadius={16}
                        padding="8px"
                      >
                        {searchResults.map((movie) => (
                          <motion.button
                            key={movie.id}
                            whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                            onClick={() => handleResultClick(movie.id)}
                            style={{
                              width: '100%',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '12px 16px',
                              borderRadius: '8px',
                              textAlign: 'left',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#fff',
                              minHeight: '48px',
                            }}
                          >
                            <span style={{ fontWeight: 500, fontSize: '14px' }}>{movie.title}</span>
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                              {movie.release_date?.split('-')[0] || 'N/A'}
                            </span>
                          </motion.button>
                        ))}
                      </LiquidSurface>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              {isMobile && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    minWidth: '44px',
                    minHeight: '44px',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ 
                    width: '18px', 
                    height: '2px', 
                    background: '#fff',
                    borderRadius: '1px',
                    transform: mobileMenuOpen ? 'rotate(45deg) translateY(6px)' : 'none',
                    transition: 'transform 0.2s ease',
                  }} />
                  <span style={{ 
                    width: '18px', 
                    height: '2px', 
                    background: '#fff',
                    borderRadius: '1px',
                    opacity: mobileMenuOpen ? 0 : 1,
                    transition: 'opacity 0.2s ease',
                  }} />
                  <span style={{ 
                    width: '18px', 
                    height: '2px', 
                    background: '#fff',
                    borderRadius: '1px',
                    transform: mobileMenuOpen ? 'rotate(-45deg) translateY(-6px)' : 'none',
                    transition: 'transform 0.2s ease',
                  }} />
                </motion.button>
              )}
            </div>
          </div>
        </LiquidSurface>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobile && mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ marginTop: '12px', overflow: 'hidden' }}
            >
              <LiquidSurface
                variant="modal"
                cornerRadius={16}
                padding="12px"
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {/* User Profile Section */}
                  {isAuthenticated ? (
                    <Link to="/profile" style={{ textDecoration: 'none' }} onClick={() => setMobileMenuOpen(false)}>
                      <motion.div
                        whileTap={{ scale: 0.98 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.1) 100%)',
                          marginBottom: '8px',
                        }}
                      >
                        {user?.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.displayName || 'Profile'}
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '2px solid rgba(139, 92, 246, 0.5)',
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            color: '#fff',
                          }}>
                            {user?.displayName?.[0] || '👤'}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff', fontSize: '14px' }}>
                            {user?.displayName || 'Profile'}
                          </div>
                          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                            View Profile
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ) : (
                    <motion.button
                      onClick={() => { signIn(); setMobileMenuOpen(false); }}
                      disabled={authLoading}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '16px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.15) 100%)',
                        border: '1px solid rgba(139,92,246,0.2)',
                        marginBottom: '8px',
                        width: '100%',
                        cursor: 'pointer',
                        color: '#fff',
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>👤</span>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>Sign In with Google</span>
                    </motion.button>
                  )}
                  
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
                  
                  <MobileNavLink to="/" label="🏠 Home" onClick={() => setMobileMenuOpen(false)} />
                  <MobileNavLink to="/discover" label="🎲 Discover" onClick={() => setMobileMenuOpen(false)} />
                  <MobileNavLink to="/library" label="📚 My Library" onClick={() => setMobileMenuOpen(false)} />
                  <MobileNavLink to="/watch-party" label="🎉 Watch Party" onClick={() => setMobileMenuOpen(false)} />
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />
                  <Link to="/ai" style={{ textDecoration: 'none' }} onClick={() => setMobileMenuOpen(false)}>
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      style={{
                        fontWeight: 600,
                        color: '#a78bfa',
                        padding: '16px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        minHeight: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.15) 100%)',
                        border: '1px solid rgba(139,92,246,0.2)',
                      }}
                    >
                      <span>✨</span> AI Assistant
                    </motion.div>
                  </Link>
                </div>
              </LiquidSurface>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}

function NavLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <motion.span
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        style={{
          fontWeight: 500,
          color: 'rgba(255,255,255,0.7)',
          padding: '8px 0',
          position: 'relative',
          cursor: 'pointer',
        }}
      >
        {label}
      </motion.span>
    </Link>
  );
}

function MobileNavLink({ to, label, onClick }: { to: string; label: string; onClick: () => void }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }} onClick={onClick}>
      <motion.div
        whileTap={{ scale: 0.98, backgroundColor: 'rgba(255,255,255,0.1)' }}
        style={{
          fontWeight: 500,
          color: 'rgba(255,255,255,0.9)',
          padding: '16px',
          borderRadius: '12px',
          cursor: 'pointer',
          minHeight: '48px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {label}
      </motion.div>
    </Link>
  );
}

export default Navbar;
