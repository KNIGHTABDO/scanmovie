"use client";

/**
 * Achievement Display Components
 * ==============================
 * Beautiful UI components for achievements and gamification.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiquidSurface } from './Liquid/LiquidSurface';
import {
  type Achievement,
  type AchievementProgress,
  getAllAchievementProgress,
  getTotalPoints,
  getUserLevel,
  getUnlockedAchievements,
  ACHIEVEMENTS,
} from '~/services/achievements';

// Achievement Toast Notification
interface AchievementToastProps {
  achievement: Achievement;
  onClose: () => void;
}

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -100, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.8 }}
      style={{
        position: 'fixed',
        top: '100px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
      }}
    >
      <LiquidSurface
        variant="modal"
        cornerRadius={20}
        padding="0"
        displacementScale={50}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px 24px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(139, 92, 246, 0.4)',
        }}>
          {/* Animated Trophy */}
          <motion.div
            animate={{ 
              rotate: [-10, 10, -10],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 0.5, repeat: 2 }}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              boxShadow: '0 4px 20px rgba(251, 191, 36, 0.4)',
            }}
          >
            {achievement.emoji}
          </motion.div>
          
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                fontSize: '12px',
                color: '#fbbf24',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '4px',
              }}
            >
              🎉 Achievement Unlocked!
            </motion.p>
            <motion.h3
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#fff',
                marginBottom: '2px',
              }}
            >
              {achievement.title}
            </motion.h3>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              {achievement.description} · +{achievement.points} pts
            </motion.p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              fontSize: '20px',
              padding: '4px',
            }}
          >
            ✕
          </motion.button>
        </div>
      </LiquidSurface>
    </motion.div>
  );
}

// Achievement Card
interface AchievementCardProps {
  progress: AchievementProgress;
  compact?: boolean;
}

export function AchievementCard({ progress, compact = false }: AchievementCardProps) {
  const { achievement, current, unlocked, percentage } = progress;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      style={{
        background: unlocked 
          ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)'
          : 'rgba(255,255,255,0.03)',
        borderRadius: compact ? '12px' : '16px',
        padding: compact ? '12px' : '16px',
        border: `1px solid ${unlocked ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255,255,255,0.08)'}`,
        opacity: unlocked ? 1 : 0.7,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Secret Badge */}
      {achievement.secret && !unlocked && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          fontSize: '12px',
        }}>
          🔒
        </div>
      )}
      
      <div style={{ display: 'flex', alignItems: 'center', gap: compact ? '10px' : '14px' }}>
        {/* Emoji/Icon */}
        <div style={{
          width: compact ? '40px' : '52px',
          height: compact ? '40px' : '52px',
          borderRadius: '50%',
          background: unlocked 
            ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
            : 'rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: compact ? '20px' : '26px',
          flexShrink: 0,
        }}>
          {achievement.secret && !unlocked ? '❓' : achievement.emoji}
        </div>
        
        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{
            fontSize: compact ? '13px' : '15px',
            fontWeight: 600,
            color: unlocked ? '#fff' : 'rgba(255,255,255,0.7)',
            marginBottom: '2px',
          }}>
            {achievement.secret && !unlocked ? '???' : achievement.title}
          </h4>
          <p style={{
            fontSize: compact ? '11px' : '12px',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '6px',
          }}>
            {achievement.secret && !unlocked ? 'Secret achievement' : achievement.description}
          </p>
          
          {/* Progress Bar */}
          {!unlocked && !achievement.secret && (
            <div style={{
              height: '4px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #8b5cf6 0%, #a855f7 100%)',
                  borderRadius: '2px',
                }}
              />
            </div>
          )}
          
          {/* Progress Text */}
          <p style={{
            fontSize: '10px',
            color: 'rgba(255,255,255,0.4)',
            marginTop: '4px',
          }}>
            {unlocked ? (
              <span style={{ color: '#4ade80' }}>✓ Completed</span>
            ) : (
              !achievement.secret && `${current}/${achievement.requirement}`
            )}
            {!compact && ` · ${achievement.points} pts`}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// User Level Badge
export function UserLevelBadge({ compact = false }: { compact?: boolean }) {
  // Use state so component can re-render when data changes
  const [level, setLevel] = useState(() => getUserLevel());
  const [points, setPoints] = useState(() => getTotalPoints());
  
  // Re-fetch data on mount and when localStorage might change
  useEffect(() => {
    const updateData = () => {
      setLevel(getUserLevel());
      setPoints(getTotalPoints());
    };
    
    // Initial update
    updateData();
    
    // Listen for storage events (triggered by other tabs or our sync)
    window.addEventListener('storage', updateData);
    
    // Also poll periodically in case localStorage was updated in the same tab
    const interval = setInterval(updateData, 2000);
    
    return () => {
      window.removeEventListener('storage', updateData);
      clearInterval(interval);
    };
  }, []);

  return (
    <LiquidSurface
      variant="container"
      cornerRadius={compact ? 16 : 24}
      padding={compact ? '12px 16px' : '20px 24px'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: compact ? '12px' : '16px' }}>
        {/* Level Icon */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: compact ? '48px' : '64px',
            height: compact ? '48px' : '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: compact ? '24px' : '32px',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
          }}
        >
          {level.emoji}
        </motion.div>
        
        {/* Level Info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              fontSize: compact ? '18px' : '22px',
              fontWeight: 700,
              color: '#fff',
            }}>
              {level.title}
            </span>
            <span style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: 600,
            }}>
              Lv.{level.level}
            </span>
          </div>
          
          <p style={{
            fontSize: compact ? '12px' : '13px',
            color: 'rgba(255,255,255,0.6)',
            marginBottom: '8px',
          }}>
            {points} points earned
          </p>
          
          {/* XP Progress Bar */}
          <div style={{
            height: '6px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${level.progress}%` }}
              transition={{ duration: 0.8 }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
                borderRadius: '3px',
              }}
            />
          </div>
          
          {level.level < 8 && (
            <p style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.4)',
              marginTop: '4px',
            }}>
              {level.nextLevel - points} pts to next level
            </p>
          )}
        </div>
      </div>
    </LiquidSurface>
  );
}

// Full Achievements Panel
interface AchievementsPanelProps {
  isMobile?: boolean;
}

export function AchievementsPanel({ isMobile = false }: AchievementsPanelProps) {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const allProgress = getAllAchievementProgress();
  
  const categories = [
    { id: 'all', label: 'All', emoji: '🏆' },
    { id: 'discovery', label: 'Discovery', emoji: '🔍' },
    { id: 'collection', label: 'Collection', emoji: '📚' },
    { id: 'social', label: 'Social', emoji: '🎉' },
    { id: 'streak', label: 'Streaks', emoji: '🔥' },
    { id: 'special', label: 'Special', emoji: '✨' },
  ];
  
  const filteredProgress = allProgress.filter(p => {
    const statusMatch = filter === 'all' || 
      (filter === 'unlocked' && p.unlocked) || 
      (filter === 'locked' && !p.unlocked);
    const categoryMatch = categoryFilter === 'all' || p.achievement.category === categoryFilter;
    return statusMatch && categoryMatch;
  });
  
  const unlockedCount = allProgress.filter(p => p.unlocked).length;
  const totalCount = allProgress.length;

  return (
    <div>
      {/* Level Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '24px' }}
      >
        <UserLevelBadge compact={isMobile} />
      </motion.div>
      
      {/* Progress Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ marginBottom: '24px' }}
      >
        <LiquidSurface variant="container" cornerRadius={16} padding="16px 20px">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Achievements Unlocked</p>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>
                {unlockedCount} <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)' }}>/ {totalCount}</span>
              </p>
            </div>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: `conic-gradient(#8b5cf6 ${(unlockedCount / totalCount) * 360}deg, rgba(255,255,255,0.1) 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#1a1a2e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 600,
              }}>
                {Math.round((unlockedCount / totalCount) * 100)}%
              </div>
            </div>
          </div>
        </LiquidSurface>
      </motion.div>
      
      {/* Category Filter */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '16px',
        overflowX: 'auto',
        paddingBottom: '4px',
      }}>
        {categories.map((cat) => (
          <motion.button
            key={cat.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCategoryFilter(cat.id)}
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: categoryFilter === cat.id ? 'rgba(139, 92, 246, 0.5)' : 'rgba(255,255,255,0.1)',
              background: categoryFilter === cat.id 
                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)'
                : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              color: '#fff',
            }}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </motion.button>
        ))}
      </div>
      
      {/* Status Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {(['all', 'unlocked', 'locked'] as const).map((status) => (
          <motion.button
            key={status}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(status)}
            style={{
              padding: '6px 12px',
              borderRadius: '12px',
              border: 'none',
              background: filter === status ? 'rgba(255,255,255,0.15)' : 'transparent',
              cursor: 'pointer',
              fontSize: '12px',
              color: filter === status ? '#fff' : 'rgba(255,255,255,0.5)',
              textTransform: 'capitalize',
            }}
          >
            {status}
          </motion.button>
        ))}
      </div>
      
      {/* Achievement Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        gap: '12px',
      }}>
        {filteredProgress.map((progress, index) => (
          <motion.div
            key={progress.achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <AchievementCard progress={progress} compact={isMobile} />
          </motion.div>
        ))}
      </div>
      
      {filteredProgress.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: 'rgba(255,255,255,0.5)',
        }}>
          <p style={{ fontSize: '40px', marginBottom: '12px' }}>🏆</p>
          <p>No achievements found</p>
        </div>
      )}
    </div>
  );
}
