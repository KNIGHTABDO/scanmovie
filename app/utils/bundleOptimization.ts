/**
 * Bundle Size Optimization Analysis
 * ==================================
 * 
 * Current Bundle Sizes (gzipped):
 * - UserDataContext: 106.95 kB - Contains Firebase, user data, achievements
 * - entry.client: 60.02 kB - Main client entry
 * - chunk-EPOLDU6W: 42.10 kB - Common chunk (likely React/dependencies)
 * - tmdb: 41.78 kB - TMDB service
 * - index.esm: 32.98 kB - Liquid Glass React library
 * 
 * Optimization Strategies:
 * 
 * 1. ✅ Code Splitting (Implemented)
 *    - Route-based code splitting via React Router
 *    - Lazy loading utility for heavy components
 * 
 * 2. ✅ Image Optimization (Implemented)
 *    - Lazy loading images with Intersection Observer
 *    - Responsive srcset for different screen sizes
 *    - Service worker for caching
 * 
 * 3. ✅ Request Optimization (Implemented)
 *    - Debouncing for search inputs
 *    - Infinite scroll pagination
 * 
 * 4. 🔄 Additional Optimizations (In Progress)
 *    - Tree-shaking: Ensure unused code is removed
 *    - Dynamic imports for heavy libraries (Firebase, Framer Motion)
 *    - Bundle analysis with rollup-plugin-visualizer
 * 
 * 5. ⚠️ liquid-glass-react Impact: 32.98 kB gzipped
 *    - This is the main UI library for glassmorphism effects
 *    - Cannot be removed as it's core to the design
 *    - Consider lazy loading for non-critical pages
 * 
 * Recommendations:
 * - UserDataContext is the largest chunk - consider splitting Firebase logic
 * - Move achievement tracking to a separate lazy-loaded module
 * - Use dynamic imports for Firebase operations
 * - Preload critical chunks on hover/navigation intent
 */

// Bundle size recommendations for developers
export const BUNDLE_RECOMMENDATIONS = {
  // Critical path - should load immediately
  critical: [
    'Root layout',
    'Navbar',
    'Home page (above fold)',
    'Core styles',
  ],
  
  // Important - preload on navigation intent
  important: [
    'Movie details page',
    'Search functionality',
    'User authentication',
  ],
  
  // Lazy load - only when needed
  lazyLoad: [
    'Watch party features',
    'AI search',
    'Profile/stats dashboard',
    'Export/import features',
    'Achievement system details',
  ],
  
  // External dependencies size impact
  dependencies: {
    'firebase': '~150 kB gzipped - Required for auth & data',
    'framer-motion': '~50 kB gzipped - Required for animations',
    'liquid-glass-react': '~33 kB gzipped - Required for UI design',
    'openai': '~30 kB gzipped - Used only in AI features',
    'react': '~40 kB gzipped - Core framework',
  },
};

/**
 * Check if a feature should be lazy loaded based on route
 */
export function shouldLazyLoad(feature: string): boolean {
  return BUNDLE_RECOMMENDATIONS.lazyLoad.includes(feature);
}

/**
 * Analyze current page weight and suggest optimizations
 */
export function analyzePageWeight() {
  if (typeof window === 'undefined') return null;
  
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const scripts = resources.filter(r => r.initiatorType === 'script');
  const styles = resources.filter(r => r.initiatorType === 'css');
  const images = resources.filter(r => r.initiatorType === 'img');
  
  const totalScriptSize = scripts.reduce((acc, s) => acc + (s.transferSize || 0), 0);
  const totalStyleSize = styles.reduce((acc, s) => acc + (s.transferSize || 0), 0);
  const totalImageSize = images.reduce((acc, s) => acc + (s.transferSize || 0), 0);
  
  return {
    scripts: {
      count: scripts.length,
      size: totalScriptSize,
      sizeKB: (totalScriptSize / 1024).toFixed(2),
    },
    styles: {
      count: styles.length,
      size: totalStyleSize,
      sizeKB: (totalStyleSize / 1024).toFixed(2),
    },
    images: {
      count: images.length,
      size: totalImageSize,
      sizeKB: (totalImageSize / 1024).toFixed(2),
    },
    total: {
      size: totalScriptSize + totalStyleSize + totalImageSize,
      sizeKB: ((totalScriptSize + totalStyleSize + totalImageSize) / 1024).toFixed(2),
      sizeMB: ((totalScriptSize + totalStyleSize + totalImageSize) / (1024 * 1024)).toFixed(2),
    },
  };
}
