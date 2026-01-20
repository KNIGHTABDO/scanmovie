"use client";

/**
 * Calendar Button Component
 * =========================
 * Add movie events to calendars (Google, Apple, Outlook).
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiquidSurface } from './Liquid/LiquidSurface';
import {
  createMovieReleaseEvent,
  createMovieReminderEvent,
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
  downloadICS,
  type CalendarEvent,
} from '~/services/calendar';
import type { Movie } from '~/services/tmdb';
import { useLanguage } from '~/contexts/LanguageContext';

interface CalendarButtonProps {
  movie: Movie;
  variant?: 'release' | 'reminder';
  reminderDate?: Date;
  size?: 'small' | 'medium';
}

export function CalendarButton({ 
  movie, 
  variant = 'release', 
  reminderDate,
  size = 'medium',
}: CalendarButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const { t } = useLanguage();
  
  const isSmall = size === 'small';

  const event: CalendarEvent = variant === 'release'
    ? createMovieReleaseEvent(movie)
    : createMovieReminderEvent(movie, reminderDate || new Date());

  const handleGoogleCalendar = () => {
    window.open(getGoogleCalendarUrl(event), '_blank');
    setShowDropdown(false);
  };

  const handleOutlookCalendar = () => {
    window.open(getOutlookCalendarUrl(event), '_blank');
    setShowDropdown(false);
  };

  const handleDownloadICS = () => {
    downloadICS(event);
    setShowDropdown(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(99, 102, 241, 0.2)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: isSmall ? '8px' : '12px',
          padding: isSmall ? '6px 10px' : '10px 16px',
          color: '#a5b4fc',
          fontSize: isSmall ? '12px' : '14px',
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        <span>📅</span>
        <span>{t('movie.addToCalendar')}</span>
      </motion.button>

      <AnimatePresence>
        {showDropdown && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDropdown(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 100,
              }}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '8px',
                zIndex: 101,
                minWidth: '200px',
              }}
            >
              <LiquidSurface variant="container" cornerRadius={12} padding="8px">
                <CalendarOption
                  icon="📆"
                  label="Google Calendar"
                  color="#4285F4"
                  onClick={handleGoogleCalendar}
                />
                <CalendarOption
                  icon="📧"
                  label="Outlook"
                  color="#0078D4"
                  onClick={handleOutlookCalendar}
                />
                <CalendarOption
                  icon="🍎"
                  label="Apple Calendar (ICS)"
                  color="#FF2D55"
                  onClick={handleDownloadICS}
                />
              </LiquidSurface>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function CalendarOption({
  icon,
  label,
  color,
  onClick,
}: {
  icon: string;
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        padding: '10px 12px',
        background: 'transparent',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <span style={{ fontSize: '18px' }}>{icon}</span>
      <span style={{ color: '#fff', fontSize: '14px' }}>{label}</span>
    </motion.button>
  );
}

/**
 * Inline calendar icon button
 */
export function CalendarIconButton({ movie }: { movie: Movie }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const event = createMovieReleaseEvent(movie);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.2)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '18px',
        }}
        title="Add to Calendar"
      >
        📅
      </motion.button>

      <AnimatePresence>
        {showDropdown && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDropdown(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 100,
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                zIndex: 101,
                minWidth: '180px',
              }}
            >
              <LiquidSurface variant="container" cornerRadius={12} padding="8px">
                <CalendarOption
                  icon="📆"
                  label="Google"
                  color="#4285F4"
                  onClick={() => {
                    window.open(getGoogleCalendarUrl(event), '_blank');
                    setShowDropdown(false);
                  }}
                />
                <CalendarOption
                  icon="📧"
                  label="Outlook"
                  color="#0078D4"
                  onClick={() => {
                    window.open(getOutlookCalendarUrl(event), '_blank');
                    setShowDropdown(false);
                  }}
                />
                <CalendarOption
                  icon="🍎"
                  label="Apple (ICS)"
                  color="#FF2D55"
                  onClick={() => {
                    downloadICS(event);
                    setShowDropdown(false);
                  }}
                />
              </LiquidSurface>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
