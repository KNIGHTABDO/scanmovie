"use client";

/**
 * Style Toggle Component
 * ======================
 * Toggle between liquid-glass and vercel style modes.
 */

import { motion } from 'framer-motion';
import { useStyle } from '~/contexts/StyleContext';

export function StyleToggle() {
  const { styleMode, setStyleMode } = useStyle();

  const options = [
    { value: 'liquid-glass', icon: '💧', label: 'Liquid Glass' },
    { value: 'vercel', icon: '▲', label: 'Vercel' },
  ] as const;

  return (
    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
      {options.map(option => (
        <motion.button
          key={option.value}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setStyleMode(option.value)}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            padding: '16px 12px',
            borderRadius: '12px',
            background: styleMode === option.value 
              ? 'rgba(139, 92, 246, 0.3)' 
              : 'rgba(255,255,255,0.05)',
            border: styleMode === option.value 
              ? '2px solid rgba(139, 92, 246, 0.6)' 
              : '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <span style={{ fontSize: '32px' }}>{option.icon}</span>
          <span style={{ 
            color: styleMode === option.value ? '#c4b5fd' : 'rgba(255,255,255,0.7)',
            fontSize: '13px',
            fontWeight: 600,
            textAlign: 'center',
          }}>
            {option.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
