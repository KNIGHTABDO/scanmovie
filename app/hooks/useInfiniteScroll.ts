/**
 * Infinite Scroll Hook
 * ====================
 * Custom hook for implementing infinite scroll/pagination.
 * Triggers callback when user scrolls near bottom of page.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number; // Distance from bottom in pixels to trigger load
  rootMargin?: string; // Intersection observer root margin
  enabled?: boolean; // Whether infinite scroll is enabled
}

interface UseInfiniteScrollReturn {
  page: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  setHasMore: (hasMore: boolean) => void;
  reset: () => void;
  observerRef: React.RefObject<HTMLDivElement>;
}

/**
 * Hook for implementing infinite scroll pagination
 * @param onLoadMore - Callback function when more items should be loaded
 * @param options - Configuration options
 * @returns Object with pagination state and controls
 */
export function useInfiniteScroll(
  onLoadMore: (page: number) => Promise<boolean>,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn {
  const {
    threshold = 200,
    rootMargin = '0px',
    enabled = true,
  } = options;

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (!enabled || !hasMore || loadingRef.current) return;

    loadingRef.current = true;
    setIsLoadingMore(true);

    try {
      const nextPage = page + 1;
      const shouldContinue = await onLoadMore(nextPage);
      
      if (shouldContinue) {
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more items:', error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
      loadingRef.current = false;
    }
  }, [page, hasMore, enabled, onLoadMore]);

  const reset = useCallback(() => {
    setPage(1);
    setHasMore(true);
    setIsLoadingMore(false);
    loadingRef.current = false;
  }, []);

  // Set up Intersection Observer
  useEffect(() => {
    if (!enabled || !hasMore || !observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !loadingRef.current) {
          loadMore();
        }
      },
      {
        rootMargin,
        threshold: 0.1,
      }
    );

    observer.observe(observerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [enabled, hasMore, loadMore, rootMargin]);

  return {
    page,
    hasMore,
    isLoadingMore,
    loadMore,
    setHasMore,
    reset,
    observerRef,
  };
}
