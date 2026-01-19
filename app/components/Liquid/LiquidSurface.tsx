"use client";

/**
 * LiquidSurface Component
 * ========================
 * WRAPPER around liquid-glass-react's LiquidGlass component.
 * Fixed with proper dimensions to prevent canvas collapse.
 */

import { useState, useEffect, useRef, type ReactNode, type CSSProperties, type RefObject } from 'react';
import type { ComponentType } from 'react';

export interface LiquidSurfaceProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  padding?: string;
  cornerRadius?: number;
  onClick?: () => void;
  displacementScale?: number;
  blurAmount?: number;
  saturation?: number;
  aberrationIntensity?: number;
  elasticity?: number;
  overLight?: boolean;
  mouseContainer?: RefObject<HTMLElement | null>;
  mode?: 'standard' | 'polar' | 'prominent' | 'shader';
  variant?: 'card' | 'navbar' | 'modal' | 'button' | 'container';
  minHeight?: string;
  width?: string;
  height?: string;
}

// Preset configurations for different UI elements
const PRESETS = {
  card: {
    displacementScale: 60,
    blurAmount: 0.08,
    saturation: 140,
    aberrationIntensity: 2.5,
    elasticity: 0.2,
    cornerRadius: 24,
  },
  navbar: {
    displacementScale: 50,
    blurAmount: 0.1,
    saturation: 130,
    aberrationIntensity: 1.5,
    elasticity: 0.1,
    cornerRadius: 16,
  },
  modal: {
    displacementScale: 70,
    blurAmount: 0.12,
    saturation: 145,
    aberrationIntensity: 3,
    elasticity: 0.15,
    cornerRadius: 32,
  },
  button: {
    displacementScale: 45,
    blurAmount: 0.06,
    saturation: 135,
    aberrationIntensity: 2,
    elasticity: 0.35,
    cornerRadius: 100,
  },
  container: {
    displacementScale: 55,
    blurAmount: 0.09,
    saturation: 138,
    aberrationIntensity: 2,
    elasticity: 0.12,
    cornerRadius: 28,
  },
};

interface LiquidGlassComponentProps {
  children: ReactNode;
  displacementScale: number;
  blurAmount: number;
  saturation: number;
  aberrationIntensity: number;
  elasticity: number;
  cornerRadius: number;
  padding?: string;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  overLight: boolean;
  mouseContainer?: RefObject<HTMLElement | null>;
  mode: 'standard' | 'polar' | 'prominent' | 'shader';
}

export function LiquidSurface({
  children,
  className = '',
  style,
  padding,
  cornerRadius,
  onClick,
  displacementScale,
  blurAmount,
  saturation,
  aberrationIntensity,
  elasticity,
  overLight = false,
  mouseContainer,
  mode = 'standard',
  variant = 'card',
  minHeight,
  width,
  height,
}: LiquidSurfaceProps) {
  const [LiquidGlass, setLiquidGlass] = useState<ComponentType<LiquidGlassComponentProps> | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    import('liquid-glass-react').then((module) => {
      setLiquidGlass(() => module.default);
    }).catch((err) => {
      console.error('Failed to load liquid-glass-react:', err);
    });
  }, []);

  // Measure the content to get proper dimensions for the canvas
  useEffect(() => {
    if (measureRef.current) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            setDimensions({ width, height });
          }
        }
      });
      observer.observe(measureRef.current);
      return () => observer.disconnect();
    }
  }, [isMounted]);

  const preset = PRESETS[variant];
  const finalCornerRadius = cornerRadius ?? preset.cornerRadius;
  const finalPadding = padding ?? '16px';

  // Glass effect styles (used for both fallback and overlay)
  const glassStyle: CSSProperties = {
    position: 'relative',
    width: width ?? '100%',
    height: height ?? 'auto',
    minHeight: minHeight,
    padding: finalPadding,
    borderRadius: `${finalCornerRadius}px`,
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.37)',
    ...style,
  };

  // SSR fallback or before LiquidGlass loads - use pure CSS glass effect
  if (!isMounted || !LiquidGlass) {
    return (
      <div
        className={`liquid-surface ${className}`}
        style={glassStyle}
        onClick={onClick}
      >
        {children}
      </div>
    );
  }

  // If we don't have dimensions yet, render hidden content to measure it
  if (!dimensions) {
    return (
      <div
        ref={measureRef}
        className={`liquid-surface ${className}`}
        style={glassStyle}
        onClick={onClick}
      >
        {children}
      </div>
    );
  }

  // Client-side render with LiquidGlass - use measured dimensions
  return (
    <div 
      className={`liquid-surface ${className}`}
      style={{
        position: 'relative',
        width: width ?? '100%',
        height: height ?? 'auto',
        minHeight: minHeight,
        ...style,
      }}
      onClick={onClick}
    >
      {/* LiquidGlass with explicit pixel dimensions */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        width: '100%',
        height: '100%',
        minWidth: `${dimensions.width}px`,
        minHeight: `${dimensions.height}px`,
      }}>
        <LiquidGlass
          displacementScale={displacementScale ?? preset.displacementScale}
          blurAmount={blurAmount ?? preset.blurAmount}
          saturation={saturation ?? preset.saturation}
          aberrationIntensity={aberrationIntensity ?? preset.aberrationIntensity}
          elasticity={elasticity ?? preset.elasticity}
          cornerRadius={finalCornerRadius}
          padding={finalPadding}
          style={{
            width: '100%',
            height: '100%',
            minWidth: `${dimensions.width}px`,
            minHeight: `${dimensions.height}px`,
          }}
          overLight={overLight}
          mouseContainer={mouseContainer}
          mode={mode}
        >
          <div style={{ visibility: 'hidden' }}>{children}</div>
        </LiquidGlass>
      </div>
      
      {/* Actual content rendered on top */}
      <div 
        ref={measureRef}
        style={{ 
          position: 'relative', 
          zIndex: 1,
          padding: finalPadding,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default LiquidSurface;
