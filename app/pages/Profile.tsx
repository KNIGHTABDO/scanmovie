"use client";

/**
 * Profile Page
 * ============
 * User profile with Google account info, stats, and settings.
 * Beautiful LiquidGlass styling throughout!
 */

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { LiquidSurface } from '~/components/Liquid/LiquidSurface';
import { useAuth } from '~/contexts/AuthContext';
import { useUserData } from '~/contexts/UserDataContext';
import { UserLevelBadge } from '~/components/AchievementDisplay';
import { getAllAchievementProgress, getTotalPoints, getUserLevel } from '~/services/achievements';

export function ProfilePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, profile, isLoading, isAuthenticated, signIn, signOut } = useAuth();
  const { watchlist, favorites, ratings, stats, isSyncing, isCloudEnabled, lastSyncTime, syncToCloud } = useUserData();
  
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get achievement data
  const achievements = getAllAchievementProgress();
  const totalPoints = getTotalPoints();
  const userLevel = getUserLevel();
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  // Redirect to home if not authenticated after loading
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Stay on profile page to show sign-in option
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleSignOut = async () => {
    await signOut();
    setShowSignOutConfirm(false);
    navigate('/');
  };

  // Format last sync time
  const formatSyncTime = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

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

      {/* Decorative Elements */}
      <div
        style={{
          position: 'fixed',
          top: '10%',
          right: '10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: '20%',
          left: '5%',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
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
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '32px' }}
        >
          <h1 style={{
            fontSize: '32px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #fff 0%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px',
          }}>
            {isAuthenticated ? 'Your Profile' : 'Sign In'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px' }}>
            {isAuthenticated 
              ? 'Manage your account and view your movie journey'
              : 'Sign in to sync your data across devices'
            }
          </p>
        </motion.div>

        {!isAuthenticated ? (
          /* Sign In Card */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <LiquidSurface variant="card" cornerRadius={24} padding="40px">
              <div style={{ textAlign: 'center' }}>
                {/* Logo */}
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    margin: '0 auto 24px',
                    boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
                  }}
                >
                  🎬
                </motion.div>

                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: 700, 
                  marginBottom: '12px',
                  color: '#fff',
                }}>
                  Welcome to ScanMovie
                </h2>
                
                <p style={{ 
                  color: 'rgba(255,255,255,0.6)', 
                  marginBottom: '32px',
                  lineHeight: 1.6,
                }}>
                  Sign in with Google to sync your watchlist, favorites, 
                  ratings, and achievements across all your devices.
                </p>

                {/* Google Sign In Button */}
                <motion.button
                  onClick={signIn}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    width: '100%',
                    maxWidth: '320px',
                    margin: '0 auto',
                    padding: '16px 24px',
                    background: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: isLoading ? 'wait' : 'pointer',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#333',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Google Icon */}
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {isLoading ? 'Signing in...' : 'Continue with Google'}
                </motion.button>

                {/* Benefits */}
                <div style={{ 
                  marginTop: '40px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px',
                }}>
                  {[
                    { icon: '☁️', label: 'Cloud Sync' },
                    { icon: '📱', label: 'All Devices' },
                    { icon: '🔒', label: 'Secure' },
                  ].map((benefit) => (
                    <div key={benefit.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', marginBottom: '4px' }}>{benefit.icon}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{benefit.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </LiquidSurface>
          </motion.div>
        ) : (
          /* Authenticated Profile */
          <>
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{ marginBottom: '24px' }}
            >
              <LiquidSurface variant="card" cornerRadius={24} padding={isMobile ? "24px" : "32px"}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: 'center', 
                  gap: isMobile ? '16px' : '20px',
                  textAlign: isMobile ? 'center' : 'left',
                }}>
                  {/* Profile Photo */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'Profile'}
                        style={{
                          width: isMobile ? '100px' : '80px',
                          height: isMobile ? '100px' : '80px',
                          borderRadius: '50%',
                          border: '3px solid rgba(139, 92, 246, 0.5)',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: isMobile ? '100px' : '80px',
                          height: isMobile ? '100px' : '80px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: isMobile ? '40px' : '32px',
                        }}
                      >
                        {user?.displayName?.[0] || '👤'}
                      </div>
                    )}
                    {/* Online indicator */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: isMobile ? '6px' : '4px',
                        right: isMobile ? '6px' : '4px',
                        width: isMobile ? '20px' : '16px',
                        height: isMobile ? '20px' : '16px',
                        borderRadius: '50%',
                        background: '#10b981',
                        border: '3px solid #1e1b4b',
                      }}
                    />
                  </div>

                  {/* User Info */}
                  <div style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
                    <h2 style={{ 
                      fontSize: isMobile ? '22px' : '24px', 
                      fontWeight: 700, 
                      marginBottom: '4px',
                      color: '#fff',
                    }}>
                      {user?.displayName || 'Movie Lover'}
                    </h2>
                    <p style={{ 
                      color: 'rgba(255,255,255,0.5)', 
                      fontSize: '14px',
                      marginBottom: '8px',
                    }}>
                      {user?.email}
                    </p>
                    <UserLevelBadge />
                  </div>
                </div>

                {/* Member Since */}
                {profile?.memberSince && (
                  <div style={{ 
                    marginTop: '20px',
                    padding: '12px 16px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <span style={{ fontSize: '18px' }}>🎂</span>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                      Member since {new Date(profile.memberSince).toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                )}
              </LiquidSurface>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '16px',
                marginBottom: '24px',
              }}
            >
              {[
                { label: 'Watchlist', value: watchlist.length, icon: '📋', color: '#6366f1' },
                { label: 'Favorites', value: favorites.length, icon: '❤️', color: '#ec4899' },
                { label: 'Ratings', value: ratings.length, icon: '⭐', color: '#f59e0b' },
                { label: 'Achievements', value: `${unlockedCount}/${achievements.length}`, icon: '🏆', color: '#10b981' },
              ].map((stat) => (
                <LiquidSurface key={stat.label} variant="card" cornerRadius={16} padding="20px">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: `${stat.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                    }}>
                      {stat.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>
                        {stat.value}
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                        {stat.label}
                      </div>
                    </div>
                  </div>
                </LiquidSurface>
              ))}
            </motion.div>

            {/* Cloud Sync Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ marginBottom: '24px' }}
            >
              <LiquidSurface variant="card" cornerRadius={20} padding="24px">
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: isCloudEnabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                    }}>
                      ☁️
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>
                        Cloud Sync
                      </h3>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                        Last synced: {formatSyncTime(lastSyncTime)}
                      </p>
                    </div>
                  </div>

                  <motion.button
                    onClick={syncToCloud}
                    disabled={isSyncing}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: isSyncing ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {isSyncing ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          🔄
                        </motion.span>
                        Syncing...
                      </>
                    ) : (
                      <>
                        <span>🔄</span>
                        Sync Now
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Sync Status Bar */}
                <div style={{
                  height: '4px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}>
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: isCloudEnabled ? '100%' : '0%' }}
                    style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #10b981, #34d399)',
                    }}
                  />
                </div>
              </LiquidSurface>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ marginBottom: '24px' }}
            >
              <LiquidSurface variant="card" cornerRadius={20} padding="0">
                {[
                  { label: 'My Library', icon: '📚', to: '/library' },
                  { label: 'Achievements', icon: '🏆', to: '/library?tab=achievements' },
                  { label: 'Watch Parties', icon: '🎉', to: '/watch-party' },
                  { label: 'Discover', icon: '🔮', to: '/discover' },
                ].map((link, index) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      borderBottom: index < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                      color: '#fff',
                      textDecoration: 'none',
                      transition: 'background 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '20px' }}>{link.icon}</span>
                      <span style={{ fontWeight: 500 }}>{link.label}</span>
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>→</span>
                  </Link>
                ))}
              </LiquidSurface>
            </motion.div>

            {/* Sign Out */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                onClick={() => setShowSignOutConfirm(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '16px',
                  color: '#ef4444',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span>👋</span>
                Sign Out
              </motion.button>
            </motion.div>
          </>
        )}

        {/* Sign Out Confirmation Modal */}
        <AnimatePresence>
          {showSignOutConfirm && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSignOutConfirm(false)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0,0,0,0.7)',
                  zIndex: 100,
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
                  zIndex: 101,
                  width: 'min(400px, 90vw)',
                }}
              >
                <LiquidSurface variant="modal" cornerRadius={24} padding="32px">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>👋</div>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>
                      Sign Out?
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>
                      Your data will remain saved locally and in the cloud.
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <motion.button
                        onClick={() => setShowSignOutConfirm(false)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          flex: 1,
                          padding: '14px',
                          background: 'rgba(255,255,255,0.1)',
                          border: 'none',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        onClick={handleSignOut}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          flex: 1,
                          padding: '14px',
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          border: 'none',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Sign Out
                      </motion.button>
                    </div>
                  </div>
                </LiquidSurface>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
