/**
 * Lazy Component Loader
 * =====================
 * Utility for lazy loading components with loading states.
 * Reduces initial bundle size by code-splitting heavy components.
 */

import { lazy, Suspense, ComponentType } from 'react';
import { motion } from 'framer-motion';

interface LazyLoadOptions {
  fallback?: React.ReactNode;
  minLoadTime?: number; // Minimum loading time in ms to prevent flashing
}

/**
 * Loading skeleton for lazy-loaded components
 */
function DefaultLoadingFallback() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%)',
      }}
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          fontSize: '64px',
        }}
      >
        🎬
      </motion.div>
    </div>
  );
}

/**
 * Create a lazy-loaded component with loading state
 * @param importFn - Dynamic import function
 * @param options - Loading options
 * @returns Lazy component wrapped in Suspense
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): ComponentType<React.ComponentProps<T>> {
  const { fallback = <DefaultLoadingFallback />, minLoadTime = 0 } = options;

  const LazyComponent = lazy(() => {
    const start = Date.now();
    return importFn().then((module) => {
      const elapsed = Date.now() - start;
      const remaining = minLoadTime - elapsed;

      if (remaining > 0) {
        return new Promise((resolve) => {
          setTimeout(() => resolve(module), remaining);
        });
      }

      return module;
    });
  });

  return function LazyLoadedComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Preload a lazy component
 * Useful for preloading components on hover or route anticipation
 */
export function preloadComponent(importFn: () => Promise<any>): void {
  importFn();
}
