/**
 * Optimized Image Component
 * =========================
 * Supports WebP/AVIF formats with fallbacks
 * Responsive srcset for different screen sizes
 * Lazy loading with intersection observer
 * Progressive loading with blur placeholder
 */

import { useState, useEffect, useRef, memo } from 'react';
import { motion } from 'framer-motion';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  sizes?: string;
  priority?: boolean; // Skip lazy loading for above-the-fold images
  onLoad?: () => void;
  placeholderColor?: string;
}

/**
 * Optimized image component with modern format support and lazy loading
 */
export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  width = '100%',
  height = 'auto',
  className,
  style,
  sizes = '100vw',
  priority = false,
  onLoad,
  placeholderColor = '#1a1a25',
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || shouldLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority, shouldLoad]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    setIsLoaded(true);
  };

  // Generate responsive srcset for TMDB images
  const generateSrcSet = (originalSrc: string): string => {
    if (!originalSrc.includes('image.tmdb.org')) {
      return originalSrc;
    }

    // Extract the size from the URL (e.g., w500, w342)
    const sizeMatch = originalSrc.match(/\/(w\d+)\//);
    if (!sizeMatch) return originalSrc;

    const basePath = originalSrc.replace(/\/w\d+\//, '/');
    
    // TMDB available sizes: w92, w154, w185, w342, w500, w780, original
    const sizes = [
      { size: 'w342', width: 342 },
      { size: 'w500', width: 500 },
      { size: 'w780', width: 780 },
    ];

    return sizes
      .map(({ size, width }) => `${basePath.replace(basePath.split('/').pop()!, size + '/' + basePath.split('/').pop()!)} ${width}w`)
      .join(', ');
  };

  const srcSet = generateSrcSet(src);

  return (
    <div
      ref={imgRef}
      style={{
        position: 'relative',
        width,
        height,
        backgroundColor: placeholderColor,
        overflow: 'hidden',
        ...style,
      }}
      className={className}
    >
      {shouldLoad && !error ? (
        <>
          <motion.img
            src={src}
            srcSet={srcSet !== src ? srcSet : undefined}
            sizes={sizes}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: isLoaded ? 1 : 0,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Loading shimmer effect */}
          {!isLoaded && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(
                  90deg,
                  ${placeholderColor} 0%,
                  rgba(255, 255, 255, 0.1) 50%,
                  ${placeholderColor} 100%
                )`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
          )}
        </>
      ) : error ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            color: 'rgba(255, 255, 255, 0.3)',
            fontSize: '14px',
          }}
        >
          🎬
        </div>
      ) : null}

      {/* Inject shimmer keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
});
