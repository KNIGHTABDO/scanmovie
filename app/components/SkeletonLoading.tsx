"use client";

/**
 * Skeleton Loading Components
 * ===========================
 * Beautiful shimmer loading states that match the LiquidGlass design.
 * Provides visual feedback while content loads.
 */

import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';

// Base shimmer animation
const shimmerAnimation = {
  initial: { backgroundPosition: '-200% 0' },
  animate: { backgroundPosition: '200% 0' },
  transition: { duration: 1.5, repeat: Infinity, ease: 'linear' },
};

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  style?: CSSProperties;
  className?: string;
}

// Base Skeleton Block
export function Skeleton({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '8px',
  style,
  className,
}: SkeletonProps) {
  return (
    <motion.div
      initial={{ backgroundPosition: '-200% 0' }}
      animate={{ backgroundPosition: '200% 0' }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      className={className}
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)',
        backgroundSize: '200% 100%',
        ...style,
      }}
    />
  );
}

// Skeleton Movie Card
export function SkeletonMovieCard({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        width: '100%',
        borderRadius: isMobile ? '14px' : '20px',
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Poster Skeleton */}
      <Skeleton 
        width="100%" 
        height={isMobile ? '200px' : '280px'} 
        borderRadius="0"
      />
      
      {/* Content Skeleton */}
      <div style={{ padding: isMobile ? '12px' : '16px' }}>
        <Skeleton width="80%" height="18px" style={{ marginBottom: '8px' }} />
        <div style={{ display: 'flex', gap: '8px' }}>
          <Skeleton width="40px" height="14px" />
          <Skeleton width="60px" height="14px" />
        </div>
      </div>
    </motion.div>
  );
}

// Skeleton Movie Grid
export function SkeletonMovieGrid({ 
  count = 6, 
  isMobile = false 
}: { 
  count?: number; 
  isMobile?: boolean;
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile 
        ? 'repeat(2, 1fr)' 
        : 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: isMobile ? '12px' : '20px',
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <SkeletonMovieCard isMobile={isMobile} />
        </motion.div>
      ))}
    </div>
  );
}

// Skeleton Hero Section
export function SkeletonHero({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        padding: isMobile ? '24px' : '40px',
        borderRadius: isMobile ? '20px' : '32px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <Skeleton width="100px" height="24px" style={{ marginBottom: '16px' }} />
      <Skeleton width={isMobile ? '100%' : '60%'} height={isMobile ? '32px' : '48px'} style={{ marginBottom: '16px' }} />
      <Skeleton width={isMobile ? '100%' : '80%'} height="16px" style={{ marginBottom: '8px' }} />
      <Skeleton width={isMobile ? '90%' : '70%'} height="16px" style={{ marginBottom: '24px' }} />
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Skeleton width="120px" height="44px" borderRadius="22px" />
        <Skeleton width="100px" height="44px" borderRadius="22px" />
      </div>
    </motion.div>
  );
}

// Skeleton Section with Title
export function SkeletonSection({ 
  title = true,
  cardCount = 6,
  isMobile = false,
}: { 
  title?: boolean;
  cardCount?: number;
  isMobile?: boolean;
}) {
  return (
    <div style={{ marginBottom: isMobile ? '40px' : '60px' }}>
      {title && (
        <div style={{ marginBottom: '20px' }}>
          <Skeleton width="180px" height="28px" style={{ marginBottom: '8px' }} />
          <Skeleton width="250px" height="16px" />
        </div>
      )}
      <SkeletonMovieGrid count={cardCount} isMobile={isMobile} />
    </div>
  );
}

// Skeleton Movie Detail Page
export function SkeletonMovieDetail() {
  return (
    <div style={{ padding: '120px 24px 80px' }}>
      {/* Back button */}
      <Skeleton width="140px" height="40px" borderRadius="20px" style={{ marginBottom: '32px' }} />
      
      {/* Main content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: '40px',
        padding: '40px',
        borderRadius: '32px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Poster */}
        <Skeleton width="100%" height="450px" borderRadius="16px" />
        
        {/* Info */}
        <div>
          <Skeleton width="70%" height="40px" style={{ marginBottom: '16px' }} />
          <Skeleton width="40%" height="20px" style={{ marginBottom: '24px' }} />
          <Skeleton width="100%" height="16px" style={{ marginBottom: '8px' }} />
          <Skeleton width="100%" height="16px" style={{ marginBottom: '8px' }} />
          <Skeleton width="80%" height="16px" style={{ marginBottom: '32px' }} />
          
          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Skeleton width="140px" height="48px" borderRadius="24px" />
            <Skeleton width="140px" height="48px" borderRadius="24px" />
            <Skeleton width="140px" height="48px" borderRadius="24px" />
          </div>
        </div>
      </div>
      
      {/* Cast section */}
      <div style={{ marginTop: '48px' }}>
        <Skeleton width="120px" height="28px" style={{ marginBottom: '20px' }} />
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ flexShrink: 0 }}>
              <Skeleton width="120px" height="120px" borderRadius="60px" style={{ marginBottom: '12px' }} />
              <Skeleton width="100px" height="14px" style={{ margin: '0 auto 4px' }} />
              <Skeleton width="80px" height="12px" style={{ margin: '0 auto' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Skeleton Chat Message
export function SkeletonChatMessage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '16px',
      }}
    >
      {/* Avatar */}
      <Skeleton width="40px" height="40px" borderRadius="20px" />
      
      {/* Message content */}
      <div style={{ flex: 1 }}>
        <Skeleton width="200px" height="16px" style={{ marginBottom: '8px' }} />
        <Skeleton width="280px" height="16px" style={{ marginBottom: '8px' }} />
        <Skeleton width="160px" height="16px" />
      </div>
    </motion.div>
  );
}

// Animated Dots Loading (for AI thinking)
export function ThinkingDots() {
  return (
    <div style={{ display: 'flex', gap: '6px', padding: '8px 0' }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -8, 0],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
          }}
        />
      ))}
    </div>
  );
}

// Pulse Ring Animation (for voice input)
export function PulseRing({ isActive = false }: { isActive?: boolean }) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      {isActive && (
        <>
          <motion.div
            animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              position: 'absolute',
              inset: '-8px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.3)',
            }}
          />
          <motion.div
            animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            style={{
              position: 'absolute',
              inset: '-8px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.3)',
            }}
          />
        </>
      )}
    </div>
  );
}
