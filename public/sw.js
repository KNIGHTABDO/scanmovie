/**
 * Service Worker for Image Caching
 * =================================
 * Caches TMDB images for offline access and faster loading.
 * Uses Cache API with LRU (Least Recently Used) strategy.
 */

const CACHE_NAME = 'scanmovie-images-v1';
const API_CACHE_NAME = 'scanmovie-api-v1';
const MAX_CACHE_SIZE = 100; // Maximum number of images to cache
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Cache strategies
const IMAGE_HOSTS = ['image.tmdb.org', 'images.unsplash.com'];
const API_HOSTS = ['api.themoviedb.org'];

declare const self: ServiceWorkerGlobalScope;

// Install event - activate immediately
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  event.waitUntil(self.skipWaiting());
});

// Activate event - take control immediately
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('scanmovie-') && name !== CACHE_NAME && name !== API_CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      }),
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Check if it's an image request
  const isImage = IMAGE_HOSTS.some((host) => url.hostname.includes(host));
  const isAPI = API_HOSTS.some((host) => url.hostname.includes(host));

  if (isImage) {
    // Cache-first strategy for images
    event.respondWith(handleImageRequest(event.request));
  } else if (isAPI) {
    // Network-first strategy for API calls with cache fallback
    event.respondWith(handleAPIRequest(event.request));
  }
});

/**
 * Cache-first strategy for images
 * Check cache first, if miss, fetch from network and cache
 */
async function handleImageRequest(request: Request): Promise<Response> {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      // Check if cache is still fresh
      const cachedDate = cachedResponse.headers.get('sw-cache-date');
      if (cachedDate) {
        const age = Date.now() - parseInt(cachedDate, 10);
        if (age < CACHE_DURATION) {
          return cachedResponse;
        }
      }
    }

    // Fetch from network
    const networkResponse = await fetch(request);
    
    // Only cache successful responses
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      
      // Add cache timestamp
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-date', Date.now().toString());
      
      const cachedResponseWithHeaders = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers,
      });

      // Manage cache size before adding
      await manageCacheSize(cache);
      await cache.put(request, cachedResponseWithHeaders);
    }

    return networkResponse;
  } catch (error) {
    // If network fails, try to return stale cache
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return a placeholder or error response
    return new Response('Image not available offline', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

/**
 * Network-first strategy for API calls
 * Try network first, fall back to cache if offline
 */
async function handleAPIRequest(request: Request): Promise<Response> {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful API responses
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      const headers = new Headers(networkResponse.headers);
      headers.set('sw-cache-date', Date.now().toString());
      
      const cachedResponse = new Response(networkResponse.clone().body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers,
      });
      
      cache.put(request, cachedResponse);
    }

    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cache = await caches.open(API_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Manage cache size using LRU strategy
 * Remove oldest entries if cache exceeds MAX_CACHE_SIZE
 */
async function manageCacheSize(cache: Cache): Promise<void> {
  const keys = await cache.keys();
  
  if (keys.length >= MAX_CACHE_SIZE) {
    // Get all cached responses with timestamps
    const entries = await Promise.all(
      keys.map(async (key) => {
        const response = await cache.match(key);
        const timestamp = response?.headers.get('sw-cache-date');
        return {
          key,
          timestamp: timestamp ? parseInt(timestamp, 10) : 0,
        };
      })
    );

    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a.timestamp - b.timestamp);

    // Remove oldest 20% of entries
    const toRemove = Math.floor(MAX_CACHE_SIZE * 0.2);
    const keysToDelete = entries.slice(0, toRemove).map((entry) => entry.key);

    await Promise.all(keysToDelete.map((key) => cache.delete(key)));
  }
}

export {};
