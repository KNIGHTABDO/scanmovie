"use client";

/**
 * Soundtrack Links Component
 * ==========================
 * Shows links to music streaming services for movie soundtracks.
 */

import { motion } from 'framer-motion';
import { LiquidSurface } from './Liquid/LiquidSurface';
import { getSoundtrackUrls, MUSIC_SERVICES, type SoundtrackInfo } from '~/services/soundtrack';
import type { Movie } from '~/services/tmdb';
import { useLanguage } from '~/contexts/LanguageContext';

interface SoundtrackLinksProps {
  movie: Movie;
  composer?: string;
  variant?: 'default' | 'compact' | 'inline';
}

export function SoundtrackLinks({ movie, composer, variant = 'default' }: SoundtrackLinksProps) {
  const soundtrackInfo = getSoundtrackUrls(movie);
  const { t } = useLanguage();
  const isCompact = variant === 'compact';
  const isInline = variant === 'inline';

  if (isInline) {
    return (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {MUSIC_SERVICES.map(service => {
          const url = soundtrackInfo[service.urlKey] as string;
          if (!url) return null;

          return (
            <motion.a
              key={service.id}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: `${service.color}20`,
                border: `1px solid ${service.color}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                textDecoration: 'none',
              }}
              title={service.name}
            >
              {service.icon}
            </motion.a>
          );
        })}
      </div>
    );
  }

  return (
    <LiquidSurface 
      variant="container" 
      cornerRadius={isCompact ? 12 : 16} 
      padding={isCompact ? '12px' : '16px'}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        marginBottom: isCompact ? '8px' : '12px' 
      }}>
        <span style={{ fontSize: isCompact ? '18px' : '20px' }}>🎵</span>
        <h3 style={{ 
          color: '#fff', 
          fontSize: isCompact ? '14px' : '16px', 
          fontWeight: 600 
        }}>
          {t('movie.soundtrack')}
        </h3>
      </div>

      {composer && (
        <p style={{ 
          color: 'rgba(255,255,255,0.6)', 
          fontSize: '13px', 
          marginBottom: '12px' 
        }}>
          Composed by <span style={{ color: '#c4b5fd' }}>{composer}</span>
        </p>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isCompact ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
        gap: '8px' 
      }}>
        {MUSIC_SERVICES.map(service => {
          const url = soundtrackInfo[service.urlKey] as string;
          if (!url) return null;

          return (
            <motion.a
              key={service.id}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                padding: isCompact ? '10px 8px' : '12px',
                borderRadius: '12px',
                background: `${service.color}15`,
                border: `1px solid ${service.color}30`,
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: isCompact ? '20px' : '24px' }}>{service.icon}</span>
              <span style={{ 
                color: service.color, 
                fontSize: isCompact ? '11px' : '12px', 
                fontWeight: 500,
                textAlign: 'center',
              }}>
                {service.name}
              </span>
            </motion.a>
          );
        })}
      </div>
    </LiquidSurface>
  );
}
