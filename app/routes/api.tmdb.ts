/**
 * TMDB API Proxy Route
 * Handles all TMDB API requests server-side to protect the API key
 * Enhanced with defensive error handling, timeouts, and rate limit protection
 */

import type { LoaderFunctionArgs } from 'react-router';

// Server-side only - API key is not exposed to client
const TMDB_API_KEY = process.env.TMDB_API_KEY || '926f46968b21a2856b40b4bf9af55847';
const BASE_URL = 'https://api.themoviedb.org/3';
const REQUEST_TIMEOUT = 8000; // 8 seconds
const DEFAULT_RETRY_AFTER_SECONDS = '60'; // Default retry-after value for rate limiting

// Allowed TMDB API endpoints for validation
const ALLOWED_ENDPOINT_PATTERNS = [
  /^\/movie\/\d+$/,                    // /movie/{id}
  /^\/movie\/\d+\/credits$/,           // /movie/{id}/credits
  /^\/movie\/\d+\/similar$/,           // /movie/{id}/similar
  /^\/movie\/\d+\/videos$/,            // /movie/{id}/videos
  /^\/movie\/now_playing$/,            // /movie/now_playing
  /^\/movie\/popular$/,                // /movie/popular
  /^\/movie\/top_rated$/,              // /movie/top_rated
  /^\/movie\/upcoming$/,               // /movie/upcoming
  /^\/trending\/movie\/(day|week)$/,   // /trending/movie/day or week
  /^\/search\/movie$/,                 // /search/movie
  /^\/search\/person$/,                // /search/person
  /^\/discover\/movie$/,               // /discover/movie
  /^\/person\/\d+$/,                   // /person/{id}
  /^\/person\/\d+\/movie_credits$/,    // /person/{id}/movie_credits
  /^\/person\/\d+\/images$/,           // /person/{id}/images
];

/**
 * Validate endpoint parameter to prevent injection attacks
 */
function validateEndpoint(endpoint: string): boolean {
  // Check if endpoint starts with /
  if (!endpoint.startsWith('/')) {
    return false;
  }
  
  // Check against allowed patterns
  return ALLOWED_ENDPOINT_PATTERNS.some(pattern => pattern.test(endpoint));
}

/**
 * Build TMDB URL with proper query parameter handling
 */
function buildTmdbUrl(endpoint: string, additionalParams: URLSearchParams): string {
  const params = new URLSearchParams();
  params.set('api_key', TMDB_API_KEY);
  
  // Add additional params (page, language, query, etc.)
  additionalParams.forEach((value, key) => {
    params.set(key, value);
  });
  
  return `${BASE_URL}${endpoint}?${params.toString()}`;
}

/**
 * Loader function to handle GET requests to TMDB API
 * Usage: /api/tmdb?endpoint=/movie/popular&page=1
 */
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const endpoint = url.searchParams.get('endpoint');
    
    // Validate endpoint parameter exists
    if (!endpoint) {
      console.error('TMDB proxy: Missing endpoint parameter');
      return new Response(
        JSON.stringify({ error: 'Missing endpoint parameter' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate endpoint pattern to prevent injection
    if (!validateEndpoint(endpoint)) {
      console.error('TMDB proxy: Invalid or disallowed endpoint:', endpoint);
      return new Response(
        JSON.stringify({ error: 'Invalid endpoint parameter' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Remove endpoint param and keep the rest for forwarding
    url.searchParams.delete('endpoint');
    
    // Build TMDB URL explicitly with validated parameters
    const tmdbUrl = buildTmdbUrl(endpoint, url.searchParams);
    console.log('TMDB request URL:', tmdbUrl.replace(/api_key=[^&]+/, 'api_key=***'));

    // Setup timeout with AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    let response: Response;
    
    try {
      // Make request with timeout and proper headers
      response = await fetch(tmdbUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      
      // Handle timeout or network errors
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('TMDB request timeout after', REQUEST_TIMEOUT, 'ms');
        return new Response(
          JSON.stringify({ error: 'Request timeout' }),
          { status: 504, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      console.error('TMDB fetch error:', fetchError);
      throw fetchError; // Re-throw to outer catch
    }

    clearTimeout(timeoutId);

    // Handle non-OK responses before attempting to parse JSON
    if (!response.ok) {
      // Read response as text for debugging
      const errorText = await response.text();
      console.error('TMDB upstream error:', {
        status: response.status,
        statusText: response.statusText,
        endpoint: endpoint,
        responseBody: errorText.substring(0, 500), // Log first 500 chars
      });

      // Handle rate limiting specifically
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded', 
            message: 'Too many requests to TMDB API. Please try again later.' 
          }),
          { 
            status: 429, 
            headers: { 
              'Content-Type': 'application/json',
              'Retry-After': response.headers.get('Retry-After') || DEFAULT_RETRY_AFTER_SECONDS,
            } 
          }
        );
      }

      // Return appropriate error response
      return new Response(
        JSON.stringify({ 
          error: 'Upstream TMDB failure',
          status: response.status,
        }),
        { 
          status: 502, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Only parse JSON after confirming response is OK
    let data: unknown;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('TMDB JSON parse error:', jsonError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON response from TMDB' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return successful response with cache headers
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error: unknown) {
    // Catch-all for any unhandled errors
    console.error('TMDB route crash:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: 'An unexpected error occurred while processing your request',
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}
