/**
 * TMDB API Proxy Route
 * Handles all TMDB API requests server-side to protect the API key
 */

import type { LoaderFunctionArgs } from 'react-router';

// Server-side only - API key is not exposed to client
const TMDB_API_KEY = process.env.TMDB_API_KEY || '926f46968b21a2856b40b4bf9af55847';
const BASE_URL = 'https://api.themoviedb.org/3';

/**
 * Loader function to handle GET requests to TMDB API
 * Usage: /api/tmdb?endpoint=/movie/popular&page=1
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const endpoint = url.searchParams.get('endpoint');
  
  if (!endpoint) {
    return new Response(
      JSON.stringify({ error: 'Missing endpoint parameter' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Remove endpoint param and forward the rest
  url.searchParams.delete('endpoint');
  const queryParams = url.searchParams.toString();
  
  // Build TMDB URL with API key
  const tmdbUrl = `${BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}${queryParams ? '&' + queryParams : ''}`;
  
  try {
    const response = await fetch(tmdbUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('TMDB API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'TMDB API request failed', status: response.status }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const data = await response.json();
    
    // Return the data with appropriate cache headers
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('TMDB proxy error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch from TMDB' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
