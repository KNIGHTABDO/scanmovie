"use client";

/**
 * Theme Toggle Component
 * ======================
 * Toggle between dark, light, and system themes.
 */

import { motion } from 'framer-motion';
import { useTheme } from '~/contexts/ThemeContext';
import { LiquidSurface } from './Liquid/LiquidSurface';

interface ThemeToggleProps {
  variant?: 'button' | 'switch' | 'dropdown';
  size?: 'small' | 'medium';
}

export function ThemeToggle({ variant = 'button', size = 'medium' }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const isSmall = size === 'small';

  if (variant === 'switch') {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={toggleTheme}
        style={{
          position: 'relative',
          width: isSmall ? '48px' : '56px',
          height: isSmall ? '26px' : '30px',
          borderRadius: '20px',
          background: resolvedTheme === 'dark' 
            ? 'linear-gradient(135deg, #1e1b4b, #312e81)' 
            : 'linear-gradient(135deg, #fef3c7, #fcd34d)',
          border: 'none',
          cursor: 'pointer',
          padding: '3px',
        }}
      >
        <motion.div
          animate={{
            x: resolvedTheme === 'dark' ? 0 : (isSmall ? 22 : 26),
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{
            width: isSmall ? '20px' : '24px',
            height: isSmall ? '20px' : '24px',
            borderRadius: '50%',
            background: resolvedTheme === 'dark' ? '#818cf8' : '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isSmall ? '10px' : '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          {resolvedTheme === 'dark' ? '🌙' : '☀️'}
        </motion.div>
      </motion.button>
    );
  }

  if (variant === 'dropdown') {
    const options = [
      { value: 'light', icon: '☀️', label: 'Light' },
      { value: 'dark', icon: '🌙', label: 'Dark' },
      { value: 'system', icon: '💻', label: 'System' },
    ] as const;

    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        {options.map(option => (
          <motion.button
            key={option.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme(option.value)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              padding: isSmall ? '10px 8px' : '14px 12px',
              borderRadius: '12px',
              background: theme === option.value 
                ? 'rgba(139, 92, 246, 0.3)' 
                : 'rgba(255,255,255,0.05)',
              border: theme === option.value 
                ? '1px solid rgba(139, 92, 246, 0.5)' 
                : '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: isSmall ? '18px' : '24px' }}>{option.icon}</span>
            <span style={{ 
              color: theme === option.value ? '#c4b5fd' : 'rgba(255,255,255,0.6)',
              fontSize: isSmall ? '11px' : '12px',
              fontWeight: 500,
            }}>
              {option.label}
            </span>
          </motion.button>
        ))}
      </div>
    );
  }

  // Default button variant
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      style={{
        width: isSmall ? '36px' : '44px',
        height: isSmall ? '36px' : '44px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: isSmall ? '16px' : '20px',
      }}
      title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {resolvedTheme === 'dark' ? '🌙' : '☀️'}
    </motion.button>
  );
}
