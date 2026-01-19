"use client";

/**
 * AI Response Card Component
 * ==========================
 * A beautiful, consistent AI response display used across the app.
 * Features:
 * - Animated gradient border
 * - Sparkle/glow effects
 * - LiquidGlass integration
 * - Smooth animations
 */

import { motion } from 'framer-motion';
import { LiquidSurface } from './Liquid/LiquidSurface';
import type { RefObject } from 'react';

interface AIResponseCardProps {
  content: string;
  isLoading?: boolean;
  variant?: 'default' | 'compact' | 'chat';
  showIcon?: boolean;
  containerRef?: RefObject<HTMLDivElement | null>;
}

export function AIResponseCard({
  content,
  isLoading = false,
  variant = 'default',
  showIcon = true,
  containerRef,
}: AIResponseCardProps) {
  const isCompact = variant === 'compact';
  const isChat = variant === 'chat';
  
  // Parse content for movie titles (wrapped in **) and make them glow
  const parseContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const title = part.slice(2, -2);
        return (
          <span
            key={i}
            style={{
              color: '#a78bfa',
              fontWeight: 600,
              textShadow: '0 0 20px rgba(167, 139, 250, 0.5)',
            }}
          >
            {title}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      style={{ position: 'relative' }}
    >
      {/* Animated Gradient Border Glow */}
      <motion.div
        animate={{
          background: [
            'linear-gradient(0deg, rgba(102,126,234,0.4), rgba(168,85,247,0.4), rgba(236,72,153,0.4))',
            'linear-gradient(90deg, rgba(102,126,234,0.4), rgba(168,85,247,0.4), rgba(236,72,153,0.4))',
            'linear-gradient(180deg, rgba(102,126,234,0.4), rgba(168,85,247,0.4), rgba(236,72,153,0.4))',
            'linear-gradient(270deg, rgba(102,126,234,0.4), rgba(168,85,247,0.4), rgba(236,72,153,0.4))',
            'linear-gradient(360deg, rgba(102,126,234,0.4), rgba(168,85,247,0.4), rgba(236,72,153,0.4))',
          ],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          inset: '-2px',
          borderRadius: isCompact ? '18px' : '26px',
          filter: 'blur(8px)',
          opacity: 0.6,
          zIndex: 0,
        }}
      />
      
      {/* Main Card */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          background: 'linear-gradient(135deg, rgba(15,15,25,0.95) 0%, rgba(20,20,35,0.9) 100%)',
          borderRadius: isCompact ? '16px' : '24px',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          overflow: 'hidden',
        }}
      >
        {/* Inner Glow Effect */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '120px',
            background: 'radial-gradient(ellipse 80% 100% at 50% -20%, rgba(139,92,246,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        
        {/* Content */}
        <div
          style={{
            position: 'relative',
            padding: isCompact ? '16px 20px' : isChat ? '14px 18px' : '24px 28px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: isCompact ? '12px' : '16px' }}>
            {/* AI Avatar */}
            {showIcon && (
              <motion.div
                animate={{ 
                  boxShadow: [
                    '0 0 20px rgba(139,92,246,0.3), 0 0 40px rgba(139,92,246,0.1)',
                    '0 0 25px rgba(139,92,246,0.5), 0 0 50px rgba(139,92,246,0.2)',
                    '0 0 20px rgba(139,92,246,0.3), 0 0 40px rgba(139,92,246,0.1)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: isCompact ? '36px' : '44px',
                  height: isCompact ? '36px' : '44px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #ec4899 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isCompact ? '18px' : '22px',
                  flexShrink: 0,
                }}
              >
                ✨
              </motion.div>
            )}
            
            {/* Text Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Label */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                marginBottom: isCompact ? '6px' : '10px',
              }}>
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: 700, 
                  color: 'rgba(167, 139, 250, 0.8)', 
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                }}>
                  AI Insight
                </span>
                
                {/* Animated sparkles */}
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ fontSize: '10px' }}
                >
                  ✦
                </motion.span>
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  style={{ fontSize: '8px', color: '#ec4899' }}
                >
                  ✦
                </motion.span>
              </div>
              
              {/* Response Text */}
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <motion.span
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                    style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #667eea, #a855f7)',
                    }}
                  />
                  <motion.span
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                    style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                    }}
                  />
                  <motion.span
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                    style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #ec4899, #667eea)',
                    }}
                  />
                  <span style={{ 
                    marginLeft: '8px', 
                    fontSize: '13px', 
                    color: 'rgba(255,255,255,0.5)',
                    fontStyle: 'italic',
                  }}>
                    Thinking...
                  </span>
                </div>
              ) : (
                <p style={{ 
                  fontSize: isCompact ? '14px' : isChat ? '13px' : '16px', 
                  lineHeight: 1.75, 
                  color: 'rgba(255,255,255,0.9)',
                  margin: 0,
                  fontWeight: 400,
                }}>
                  {parseContent(content)}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Bottom Gradient Line */}
        <motion.div
          animate={{
            background: [
              'linear-gradient(90deg, transparent 0%, #667eea 20%, #a855f7 50%, #ec4899 80%, transparent 100%)',
              'linear-gradient(90deg, transparent 0%, #ec4899 20%, #667eea 50%, #a855f7 80%, transparent 100%)',
              'linear-gradient(90deg, transparent 0%, #667eea 20%, #a855f7 50%, #ec4899 80%, transparent 100%)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{
            height: '2px',
            width: '100%',
            opacity: 0.6,
          }}
        />
      </div>
    </motion.div>
  );
}

// Simpler inline version for chat bubbles
export function AIResponseBubble({ 
  content, 
  isLoading = false 
}: { 
  content: string; 
  isLoading?: boolean;
}) {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(168,85,247,0.1) 100%)',
        border: '1px solid rgba(139,92,246,0.25)',
        borderRadius: '16px',
        borderTopLeftRadius: '4px',
        padding: '12px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle top glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '40px',
          background: 'linear-gradient(180deg, rgba(139,92,246,0.1) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
      
      {isLoading ? (
        <div style={{ display: 'flex', gap: '4px' }}>
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
            style={{ color: '#a78bfa' }}
          >●</motion.span>
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
            style={{ color: '#c084fc' }}
          >●</motion.span>
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
            style={{ color: '#e879f9' }}
          >●</motion.span>
        </div>
      ) : (
        <p style={{ 
          color: '#fff', 
          fontSize: '13px', 
          lineHeight: 1.6, 
          margin: 0,
          position: 'relative',
        }}>
          {content}
        </p>
      )}
    </div>
  );
}
