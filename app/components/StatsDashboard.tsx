"use client";

/**
 * Stats Dashboard Component
 * ==========================
 * Beautiful analytics and statistics visualization
 * with custom charts matching the LiquidGlass design.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LiquidSurface } from './Liquid/LiquidSurface';
import { useUserData } from '~/contexts/UserDataContext';
import { getAchievementStats, getTotalPoints, getUserLevel } from '~/services/achievements';

// Genre names for display
const GENRE_NAMES: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

// Genre colors for charts
const GENRE_COLORS: Record<number, string> = {
  28: '#ef4444',     // Action - Red
  12: '#f97316',     // Adventure - Orange
  16: '#fbbf24',     // Animation - Yellow
  35: '#84cc16',     // Comedy - Lime
  80: '#6b7280',     // Crime - Gray
  99: '#14b8a6',     // Documentary - Teal
  18: '#8b5cf6',     // Drama - Purple
  10751: '#ec4899',  // Family - Pink
  14: '#a855f7',     // Fantasy - Violet
  36: '#78716c',     // History - Stone
  27: '#dc2626',     // Horror - Dark Red
  10402: '#06b6d4',  // Music - Cyan
  9648: '#6366f1',   // Mystery - Indigo
  10749: '#f472b6',  // Romance - Light Pink
  878: '#3b82f6',    // Sci-Fi - Blue
  10770: '#9ca3af',  // TV Movie - Gray
  53: '#facc15',     // Thriller - Yellow
  10752: '#65a30d',  // War - Green
  37: '#d97706',     // Western - Amber
};

// Circular Progress Ring
interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}

export function ProgressRing({ 
  percentage, 
  size = 120, 
  strokeWidth = 8,
  color = '#8b5cf6',
  label,
  sublabel,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
            filter: `drop-shadow(0 0 6px ${color}60)`,
          }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {label && (
          <span style={{ fontSize: size / 4, fontWeight: 700, color: '#fff' }}>{label}</span>
        )}
        {sublabel && (
          <span style={{ fontSize: size / 10, color: 'rgba(255,255,255,0.5)' }}>{sublabel}</span>
        )}
      </div>
    </div>
  );
}

// Bar Chart Component
interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
  height?: number;
  showValues?: boolean;
}

export function BarChart({ data, maxValue, height = 200, showValues = true }: BarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height }}>
      {data.map((item, index) => (
        <div
          key={item.label}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100%',
          }}
        >
          {showValues && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.8)',
                marginBottom: '4px',
              }}
            >
              {item.value}
            </motion.span>
          )}
          <div style={{
            flex: 1,
            width: '100%',
            display: 'flex',
            alignItems: 'flex-end',
          }}>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(item.value / max) * 100}%` }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
              style={{
                width: '100%',
                background: item.color || `linear-gradient(180deg, #8b5cf6 0%, #6366f1 100%)`,
                borderRadius: '6px 6px 0 0',
                minHeight: item.value > 0 ? '4px' : '0px',
              }}
            />
          </div>
          <span style={{
            fontSize: '10px',
            color: 'rgba(255,255,255,0.5)',
            marginTop: '8px',
            textAlign: 'center',
            maxWidth: '60px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// Pie Chart Component
interface PieChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
}

export function PieChart({ data, size = 160 }: PieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;

  let currentAngle = 0;
  const segments = data.map(item => {
    const angle = (item.value / total) * 360;
    const segment = {
      ...item,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
    };
    currentAngle += angle;
    return segment;
  });

  // Create pie chart path
  const createArc = (startAngle: number, endAngle: number, innerRadius: number, outerRadius: number) => {
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    
    const x1 = size / 2 + innerRadius * Math.cos(startRad);
    const y1 = size / 2 + innerRadius * Math.sin(startRad);
    const x2 = size / 2 + outerRadius * Math.cos(startRad);
    const y2 = size / 2 + outerRadius * Math.sin(startRad);
    const x3 = size / 2 + outerRadius * Math.cos(endRad);
    const y3 = size / 2 + outerRadius * Math.sin(endRad);
    const x4 = size / 2 + innerRadius * Math.cos(endRad);
    const y4 = size / 2 + innerRadius * Math.sin(endRad);
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1} ${y1}`;
  };

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size}>
        {segments.map((segment, index) => (
          <motion.path
            key={segment.label}
            d={createArc(segment.startAngle, segment.endAngle, size * 0.25, size * 0.45)}
            fill={segment.color}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            style={{ filter: `drop-shadow(0 2px 4px ${segment.color}40)` }}
          />
        ))}
      </svg>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  emoji?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

export function StatCard({ title, value, subtitle, emoji, trend, color = '#8b5cf6' }: StatCardProps) {
  return (
    <LiquidSurface variant="container" cornerRadius={16} padding="16px">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ 
            fontSize: '12px', 
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            {title}
          </p>
          <motion.p
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ 
              fontSize: '28px', 
              fontWeight: 700, 
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {value}
            {trend && (
              <span style={{
                fontSize: '14px',
                color: trend === 'up' ? '#4ade80' : trend === 'down' ? '#f87171' : 'rgba(255,255,255,0.4)',
              }}>
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '–'}
              </span>
            )}
          </motion.p>
          {subtitle && (
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
              {subtitle}
            </p>
          )}
        </div>
        {emoji && (
          <span style={{ 
            fontSize: '32px', 
            opacity: 0.8,
            filter: `drop-shadow(0 2px 8px ${color}40)`,
          }}>
            {emoji}
          </span>
        )}
      </div>
    </LiquidSurface>
  );
}

// Main Stats Dashboard
interface StatsDashboardProps {
  isMobile?: boolean;
}

export function StatsDashboard({ isMobile = false }: StatsDashboardProps) {
  const { watchlist, favorites, ratings, viewHistory, collections } = useUserData();
  
  // Use state for achievement data so it updates after sync
  const [achievementStats, setAchievementStats] = useState(() => getAchievementStats());
  const [totalPoints, setTotalPoints] = useState(() => getTotalPoints());
  const [userLevel, setUserLevel] = useState(() => getUserLevel());
  
  // Re-fetch achievement data when it might change
  useEffect(() => {
    const updateAchievementData = () => {
      setAchievementStats(getAchievementStats());
      setTotalPoints(getTotalPoints());
      setUserLevel(getUserLevel());
    };
    
    // Listen for storage events
    window.addEventListener('storage', updateAchievementData);
    
    // Poll for changes (in case localStorage updated in same tab)
    const interval = setInterval(updateAchievementData, 2000);
    
    return () => {
      window.removeEventListener('storage', updateAchievementData);
      clearInterval(interval);
    };
  }, []);
  
  // Calculate genre distribution from favorites
  const genreDistribution: Record<number, number> = {};
  favorites.forEach(movie => {
    // We'd need genre_ids from the movie data
    // For now, we'll use a placeholder
  });
  
  // Mock genre data based on stats
  const genresExplored = achievementStats.genresExplored;
  const genreChartData = genresExplored.slice(0, 6).map(genreId => ({
    label: GENRE_NAMES[genreId] || 'Unknown',
    value: Math.floor(Math.random() * 10) + 1, // Placeholder
    color: GENRE_COLORS[genreId] || '#8b5cf6',
  }));
  
  // Calculate activity by time (mock data based on history)
  const last7Days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const activityData = last7Days.map(day => ({
    label: day,
    value: Math.floor(Math.random() * 5),
    color: 'linear-gradient(180deg, #8b5cf6 0%, #6366f1 100%)',
  }));
  
  // Calculate average rating
  const avgRating = ratings.length > 0 
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : 'N/A';
  
  // Rating distribution
  const ratingDistribution = Array.from({ length: 10 }, (_, i) => ({
    label: `${i + 1}`,
    value: ratings.filter(r => Math.floor(r.rating) === i + 1).length,
  }));

  return (
    <div>
      {/* Quick Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <StatCard title="Watchlist" value={watchlist.length} emoji="📋" color="#6366f1" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard title="Favorites" value={favorites.length} emoji="❤️" color="#ec4899" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <StatCard title="Ratings" value={ratings.length} emoji="⭐" color="#fbbf24" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <StatCard title="Collections" value={collections.length} emoji="📂" color="#8b5cf6" />
        </motion.div>
      </div>
      
      {/* Level & Points */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{ marginBottom: '24px' }}
      >
        <LiquidSurface variant="container" cornerRadius={24} padding="24px">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: '24px',
          }}>
            {/* Level Ring */}
            <ProgressRing
              percentage={userLevel.progress}
              size={isMobile ? 100 : 140}
              color="#8b5cf6"
              label={`Lv.${userLevel.level}`}
              sublabel={userLevel.title}
            />
            
            {/* Points & Streaks */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
                Total Points
              </p>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  fontSize: '36px',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {totalPoints}
              </motion.p>
            </div>
            
            {/* Current Streak */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
                Current Streak
              </p>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  fontSize: '36px',
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                🔥 {achievementStats.currentStreak}
              </motion.p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>days</p>
            </div>
          </div>
        </LiquidSurface>
      </motion.div>
      
      {/* Charts Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {/* Rating Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <LiquidSurface variant="container" cornerRadius={20} padding="20px">
            <h3 style={{ 
              fontSize: '14px', 
              fontWeight: 600, 
              color: 'rgba(255,255,255,0.8)',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              ⭐ Rating Distribution
            </h3>
            <BarChart data={ratingDistribution} height={120} />
            <p style={{ 
              fontSize: '12px', 
              color: 'rgba(255,255,255,0.5)', 
              marginTop: '12px',
              textAlign: 'center',
            }}>
              Average Rating: <span style={{ color: '#fbbf24', fontWeight: 600 }}>{avgRating}</span>
            </p>
          </LiquidSurface>
        </motion.div>
        
        {/* Weekly Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <LiquidSurface variant="container" cornerRadius={20} padding="20px">
            <h3 style={{ 
              fontSize: '14px', 
              fontWeight: 600, 
              color: 'rgba(255,255,255,0.8)',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              📊 Weekly Activity
            </h3>
            <BarChart data={activityData} height={120} />
            <p style={{ 
              fontSize: '12px', 
              color: 'rgba(255,255,255,0.5)', 
              marginTop: '12px',
              textAlign: 'center',
            }}>
              Movies viewed this week
            </p>
          </LiquidSurface>
        </motion.div>
      </div>
      
      {/* Genres Explored */}
      {genreChartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <LiquidSurface variant="container" cornerRadius={20} padding="20px">
            <h3 style={{ 
              fontSize: '14px', 
              fontWeight: 600, 
              color: 'rgba(255,255,255,0.8)',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              🎭 Genres Explored
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {genresExplored.map((genreId, index) => (
                <motion.div
                  key={genreId}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    background: `${GENRE_COLORS[genreId] || '#8b5cf6'}30`,
                    border: `1px solid ${GENRE_COLORS[genreId] || '#8b5cf6'}50`,
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#fff',
                  }}
                >
                  {GENRE_NAMES[genreId] || 'Unknown'}
                </motion.div>
              ))}
              {genresExplored.length === 0 && (
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                  Start exploring movies to discover your favorite genres!
                </p>
              )}
            </div>
          </LiquidSurface>
        </motion.div>
      )}
      
      {/* AI Usage Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        style={{ marginTop: '16px' }}
      >
        <LiquidSurface variant="container" cornerRadius={20} padding="20px">
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: 600, 
            color: 'rgba(255,255,255,0.8)',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            🤖 AI Assistant Usage
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
          }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#8b5cf6' }}>
                {achievementStats.aiSearchCount}
              </p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>AI Searches</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#ec4899' }}>
                {achievementStats.moodsUsed.length}
              </p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Moods Used</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#fbbf24' }}>
                {achievementStats.randomPickerCount}
              </p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Random Picks</p>
            </div>
          </div>
        </LiquidSurface>
      </motion.div>
    </div>
  );
}
