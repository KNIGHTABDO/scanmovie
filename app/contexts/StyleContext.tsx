"use client";

/**
 * Style Context
 * =============
 * Manages the UI style mode: liquid-glass (current) vs vercel (minimalist).
 * This is separate from the theme (dark/light) context.
 * Persists preference to localStorage.
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type StyleMode = 'liquid-glass' | 'vercel';

interface StyleContextType {
  styleMode: StyleMode;
  setStyleMode: (mode: StyleMode) => void;
  isLiquidGlass: boolean;
  isVercel: boolean;
}

const StyleContext = createContext<StyleContextType | null>(null);

const STYLE_STORAGE_KEY = 'scanmovie_style_mode';

export function StyleProvider({ children }: { children: ReactNode }) {
  const [styleMode, setStyleModeState] = useState<StyleMode>('liquid-glass');

  // Initialize style mode from localStorage
  useEffect(() => {
    // Only access localStorage on client-side to avoid SSR hydration mismatches
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STYLE_STORAGE_KEY) as StyleMode | null;
      if (stored && ['liquid-glass', 'vercel'].includes(stored)) {
        setStyleModeState(stored);
      }
    }
  }, []);

  // Apply style mode to document
  useEffect(() => {
    document.documentElement.setAttribute('data-style', styleMode);
  }, [styleMode]);

  const setStyleMode = (newMode: StyleMode) => {
    setStyleModeState(newMode);
    localStorage.setItem(STYLE_STORAGE_KEY, newMode);
  };

  return (
    <StyleContext.Provider 
      value={{ 
        styleMode, 
        setStyleMode,
        isLiquidGlass: styleMode === 'liquid-glass',
        isVercel: styleMode === 'vercel',
      }}
    >
      {children}
    </StyleContext.Provider>
  );
}

export function useStyle() {
  const context = useContext(StyleContext);
  if (!context) {
    throw new Error('useStyle must be used within a StyleProvider');
  }
  return context;
}
