
/**
 * Surface Component
 * =================
 * Unified surface component that automatically switches between
 * LiquidSurface (liquid glass) and VercelSurface (minimalist)
 * based on the current style mode from StyleContext.
 */

import type { ReactNode, CSSProperties, RefObject } from 'react';
import { useStyle } from '~/contexts/StyleContext';
import { LiquidSurface } from './Liquid/LiquidSurface';
import { VercelSurface } from './VercelSurface';

export interface SurfaceProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  padding?: string;
  variant?: 'card' | 'navbar' | 'modal' | 'button' | 'container';
  onClick?: () => void;
  
  // LiquidSurface-specific props (ignored in Vercel mode)
  cornerRadius?: number;
  displacementScale?: number;
  blurAmount?: number;
  saturation?: number;
  aberrationIntensity?: number;
  elasticity?: number;
  overLight?: boolean;
  mouseContainer?: RefObject<HTMLElement | null>;
  mode?: 'standard' | 'polar' | 'prominent' | 'shader';
  minHeight?: string;
  width?: string;
  height?: string;
  
  // VercelSurface-specific props (ignored in liquid-glass mode)
  animate?: boolean;
}

export function Surface(props: SurfaceProps) {
  const { isVercel } = useStyle();
  
  if (isVercel) {
    // Use Vercel minimalist style
    return (
      <VercelSurface
        className={props.className}
        style={props.style}
        padding={props.padding}
        variant={props.variant}
        onClick={props.onClick}
        animate={props.animate}
      >
        {props.children}
      </VercelSurface>
    );
  }
  
  // Use Liquid Glass style (default)
  return (
    <LiquidSurface
      className={props.className}
      style={props.style}
      padding={props.padding}
      variant={props.variant}
      onClick={props.onClick}
      cornerRadius={props.cornerRadius}
      displacementScale={props.displacementScale}
      blurAmount={props.blurAmount}
      saturation={props.saturation}
      aberrationIntensity={props.aberrationIntensity}
      elasticity={props.elasticity}
      overLight={props.overLight}
      mouseContainer={props.mouseContainer}
      mode={props.mode}
      minHeight={props.minHeight}
      width={props.width}
      height={props.height}
    >
      {props.children}
    </LiquidSurface>
  );
}
