"use client";

/**
 * Language Selector Component
 * ===========================
 * Dropdown to select app language.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage, LANGUAGES, type Language } from '~/contexts/LanguageContext';
import { LiquidSurface } from './Liquid/LiquidSurface';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'grid' | 'compact';
}

export function LanguageSelector({ variant = 'dropdown' }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentLang = LANGUAGES.find(l => l.code === language);

  if (variant === 'grid') {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
      }}>
        {LANGUAGES.map(lang => (
          <motion.button
            key={lang.code}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setLanguage(lang.code)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              padding: '12px 8px',
              borderRadius: '12px',
              background: language === lang.code 
                ? 'rgba(139, 92, 246, 0.3)' 
                : 'rgba(255,255,255,0.05)',
              border: language === lang.code 
                ? '1px solid rgba(139, 92, 246, 0.5)' 
                : '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '24px' }}>{lang.flag}</span>
            <span style={{ 
              color: language === lang.code ? '#c4b5fd' : 'rgba(255,255,255,0.6)',
              fontSize: '11px',
              fontWeight: 500,
            }}>
              {lang.nativeName}
            </span>
          </motion.button>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div style={{ position: 'relative' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            cursor: 'pointer',
            color: '#fff',
            fontSize: '14px',
          }}
        >
          <span>{currentLang?.flag}</span>
          <span>{currentLang?.code.toUpperCase()}</span>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 9998,
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
                  zIndex: 9999,
                  minWidth: '160px',
                }}
              >
                <LiquidSurface variant="container" cornerRadius={12} padding="8px">
                  {LANGUAGES.map(lang => (
                    <motion.button
                      key={lang.code}
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '10px 12px',
                        background: language === lang.code ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span style={{ fontSize: '18px' }}>{lang.flag}</span>
                      <span style={{ 
                        color: language === lang.code ? '#c4b5fd' : '#fff',
                        fontSize: '14px',
                      }}>
                        {lang.nativeName}
                      </span>
                    </motion.button>
                  ))}
                </LiquidSurface>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div style={{ position: 'relative' }}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '14px 16px',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          cursor: 'pointer',
          color: '#fff',
          fontSize: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>{currentLang?.flag}</span>
          <span>{currentLang?.nativeName}</span>
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          ▼
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9998,
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '8px',
                zIndex: 9999,
                maxHeight: '240px',
                overflowY: 'auto',
              }}
            >
              <LiquidSurface variant="container" cornerRadius={12} padding="8px">
                {LANGUAGES.map(lang => (
                  <motion.button
                    key={lang.code}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      width: '100%',
                      padding: '12px 14px',
                      background: language === lang.code ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: '22px' }}>{lang.flag}</span>
                    <div>
                      <div style={{ 
                        color: language === lang.code ? '#c4b5fd' : '#fff',
                        fontSize: '14px',
                        fontWeight: 500,
                      }}>
                        {lang.nativeName}
                      </div>
                      <div style={{ 
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '12px',
                      }}>
                        {lang.name}
                      </div>
                    </div>
                    {language === lang.code && (
                      <span style={{ marginLeft: 'auto', color: '#8b5cf6' }}>✓</span>
                    )}
                  </motion.button>
                ))}
              </LiquidSurface>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
