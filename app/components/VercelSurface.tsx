"use client";

/**
 * VercelSurface Component
 * =======================
 * Vercel-inspired minimalist surface with clean design and subtle animations.
 * Dark minimalist aesthetic with crisp borders and smooth hover effects.
 */

import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode, CSSProperties } from 'react';

export interface VercelSurfaceProps extends Omit<HTMLMotionProps<"div">, 'children'> {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  padding?: string;
  variant?: 'card' | 'navbar' | 'modal' | 'button' | 'container';
  onClick?: () => void;
  animate?: boolean;
}

const VARIANT_STYLES: Record<string, CSSProperties> = {
  card: {
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(8px)',
  },
  navbar: {
    padding: '16px 24px',
    borderRadius: '0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(12px)',
  },
  modal: {
    padding: '32px',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(16px)',
  },
  button: {
    padding: '12px 20px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(4px)',
  },
  container: {
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(0, 0, 0, 0.25)',
    backdropFilter: 'blur(8px)',
  },
};

export function VercelSurface({
  children,
  className = '',
  style,
  padding,
  variant = 'card',
  onClick,
  animate = true,
  ...motionProps
}: VercelSurfaceProps) {
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.card;
  
  const finalStyle: CSSProperties = {
    ...variantStyle,
    ...(padding && { padding }),
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    ...style,
  };

  const hoverAnimation = animate ? {
    borderColor: 'rgba(255, 255, 255, 0.15)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15), 0 0 1px rgba(255, 255, 255, 0.1)',
  } : {};

  const tapAnimation = animate ? {
    scale: 0.98,
  } : {};

  return (
    <motion.div
      className={`vercel-surface ${className}`}
      style={finalStyle}
      onClick={onClick}
      whileHover={hoverAnimation}
      whileTap={tapAnimation}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
