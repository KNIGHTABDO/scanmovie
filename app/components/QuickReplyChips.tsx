"use client";

/**
 * Quick Reply Chips Component
 * ===========================
 * Fast-access suggestion chips for AI interactions.
 * Provides one-tap access to common movie searches.
 */

import { motion } from 'framer-motion';
import { Surface } from './Surface';

export interface QuickReply {
  id: string;
  emoji: string;
  label: string;
  query: string;
}

// Default quick replies for movie discovery
export const DEFAULT_QUICK_REPLIES: QuickReply[] = [
  { id: 'surprise', emoji: '🎲', label: 'Surprise Me', query: 'Surprise me with a random great movie!' },
  { id: 'trending', emoji: '🔥', label: 'Trending', query: 'What movies are trending right now?' },
  { id: 'comedy', emoji: '😂', label: 'Comedy', query: 'Show me some hilarious comedies' },
  { id: 'action', emoji: '💥', label: 'Action', query: 'I want some action-packed movies' },
  { id: 'horror', emoji: '👻', label: 'Horror', query: 'Give me some scary horror movies' },
  { id: 'romance', emoji: '💕', label: 'Romance', query: 'Find me romantic movies for date night' },
  { id: 'scifi', emoji: '🚀', label: 'Sci-Fi', query: 'Show me mind-bending sci-fi films' },
  { id: 'classic', emoji: '🎬', label: 'Classics', query: 'What are the must-watch classic films?' },
  { id: 'animated', emoji: '🎨', label: 'Animated', query: 'Best animated movies of all time' },
  { id: 'hidden', emoji: '💎', label: 'Hidden Gems', query: 'Find me underrated hidden gem movies' },
  { id: 'family', emoji: '👨‍👩‍👧‍👦', label: 'Family', query: 'Family-friendly movies everyone can enjoy' },
  { id: 'thriller', emoji: '😰', label: 'Thriller', query: 'Edge-of-your-seat thriller movies' },
];

// Mood-based quick replies
export const MOOD_QUICK_REPLIES: QuickReply[] = [
  { id: 'happy', emoji: '😊', label: 'Feel Good', query: 'I want to feel happy, show me uplifting movies' },
  { id: 'sad', emoji: '😢', label: 'Emotional', query: 'Give me emotional tearjerker movies' },
  { id: 'bored', emoji: '😴', label: 'Bored', query: 'I\'m bored, show me something exciting and different' },
  { id: 'stressed', emoji: '😤', label: 'Stressed', query: 'Relaxing, easy-to-watch movies for de-stressing' },
  { id: 'adventurous', emoji: '🗺️', label: 'Adventure', query: 'Epic adventure movies with journeys' },
  { id: 'thoughtful', emoji: '🤔', label: 'Thoughtful', query: 'Deep, thought-provoking movies that make you think' },
];

// Time-based quick replies
export const TIME_QUICK_REPLIES: QuickReply[] = [
  { id: 'short', emoji: '⏱️', label: 'Under 90min', query: 'Good movies under 90 minutes' },
  { id: 'evening', emoji: '🌙', label: 'Movie Night', query: 'Perfect movie night picks' },
  { id: 'weekend', emoji: '🍿', label: 'Weekend', query: 'Best movies for a lazy weekend' },
  { id: 'marathon', emoji: '📺', label: 'Marathon', query: 'Movie series perfect for a marathon' },
];

interface QuickReplyChipsProps {
  replies?: QuickReply[];
  onSelect: (query: string) => void;
  isMobile?: boolean;
  variant?: 'default' | 'compact' | 'scrollable';
  showLabel?: boolean;
}

export function QuickReplyChips({
  replies = DEFAULT_QUICK_REPLIES,
  onSelect,
  isMobile = false,
  variant = 'default',
  showLabel = true,
}: QuickReplyChipsProps) {
  const isCompact = variant === 'compact';
  const isScrollable = variant === 'scrollable';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        flexWrap: isScrollable ? 'nowrap' : 'wrap',
        gap: isCompact ? '6px' : '8px',
        padding: isScrollable ? '4px 0' : '4px',
        overflowX: isScrollable ? 'auto' : 'visible',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
      className="hide-scrollbar"
    >
      {replies.map((reply, index) => (
        <motion.button
          key={reply.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.03 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(reply.query)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: isCompact ? '8px 12px' : '10px 16px',
            borderRadius: '50px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            flexShrink: 0,
            color: '#fff',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(168, 85, 247, 0.3) 100%)';
            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)';
            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span style={{ fontSize: isCompact ? '14px' : '16px' }}>{reply.emoji}</span>
          {showLabel && (
            <span style={{ 
              fontSize: isCompact ? '12px' : '13px', 
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}>
              {reply.label}
            </span>
          )}
        </motion.button>
      ))}
    </motion.div>
  );
}

// Category tabs for quick replies
interface QuickReplyCategoriesProps {
  onSelect: (query: string) => void;
  isMobile?: boolean;
}

export function QuickReplyCategories({ onSelect, isMobile = false }: QuickReplyCategoriesProps) {
  const categories = [
    { id: 'popular', label: '🔥 Popular', replies: DEFAULT_QUICK_REPLIES.slice(0, 6) },
    { id: 'mood', label: '😊 By Mood', replies: MOOD_QUICK_REPLIES },
    { id: 'time', label: '⏱️ By Time', replies: TIME_QUICK_REPLIES },
    { id: 'genre', label: '🎭 Genres', replies: DEFAULT_QUICK_REPLIES.slice(2, 10) },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {categories.map((category) => (
        <div key={category.id}>
          <p style={{ 
            fontSize: '12px', 
            fontWeight: 600, 
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            {category.label}
          </p>
          <QuickReplyChips
            replies={category.replies}
            onSelect={onSelect}
            isMobile={isMobile}
            variant="scrollable"
          />
        </div>
      ))}
    </div>
  );
}

// Floating quick action button
interface FloatingQuickActionProps {
  onClick: () => void;
  icon?: string;
  label?: string;
}

export function FloatingQuickAction({ 
  onClick, 
  icon = '✨', 
  label = 'AI Search' 
}: FloatingQuickActionProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '16px 24px',
        borderRadius: '50px',
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
        color: '#fff',
      }}
    >
      <span style={{ fontSize: '20px' }}>{icon}</span>
      <span style={{ fontSize: '14px', fontWeight: 600 }}>{label}</span>
    </motion.button>
  );
}
