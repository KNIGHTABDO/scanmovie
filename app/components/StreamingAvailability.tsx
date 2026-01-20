"use client";

/**
 * Streaming Availability Component
 * =================================
 * Shows where movies are available to stream.
 * Uses TMDB's Watch Providers API for accurate data.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiquidSurface } from './Liquid/LiquidSurface';

interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

interface WatchProviderData {
  flatrate?: WatchProvider[]; // Subscription streaming
  rent?: WatchProvider[];     // Rent
  buy?: WatchProvider[];      // Buy
  free?: WatchProvider[];     // Free with ads
}

// TMDB API for watch providers
async function getWatchProviders(movieId: number, region: string = 'US'): Promise<WatchProviderData | null> {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=926f46968b21a2856b40b4bf9af55847`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.results?.[region] || null;
  } catch (error) {
    console.error('Failed to fetch watch providers:', error);
    return null;
  }
}

// Provider logo URL
function getProviderLogoUrl(path: string): string {
  return `https://image.tmdb.org/t/p/w92${path}`;
}

// Provider colors/brands (for enhanced styling)
const PROVIDER_COLORS: Record<number, string> = {
  8: '#E50914',     // Netflix
  9: '#00A8E1',     // Amazon Prime
  337: '#6441A4',   // Disney+
  384: '#1CE783',   // HBO Max
  15: '#6B5B95',    // Hulu
  386: '#FFD700',   // Peacock
  531: '#1DB954',   // Paramount+
  350: '#FF0000',   // Apple TV+
  283: '#00D4FF',   // Crunchyroll
  2: '#FF5722',     // Apple iTunes
  3: '#4285F4',     // Google Play
};

interface StreamingAvailabilityProps {
  movieId: number;
  variant?: 'default' | 'compact' | 'inline';
  showTitle?: boolean;
}

export function StreamingAvailability({ 
  movieId, 
  variant = 'default',
  showTitle = true,
}: StreamingAvailabilityProps) {
  const [providers, setProviders] = useState<WatchProviderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stream' | 'rent' | 'buy'>('stream');

  useEffect(() => {
    async function fetchProviders() {
      setLoading(true);
      const data = await getWatchProviders(movieId);
      setProviders(data);
      setLoading(false);
      
      // Set default tab based on availability
      if (data) {
        if (data.flatrate?.length) setActiveTab('stream');
        else if (data.rent?.length) setActiveTab('rent');
        else if (data.buy?.length) setActiveTab('buy');
      }
    }
    
    fetchProviders();
  }, [movieId]);

  const isCompact = variant === 'compact';
  const isInline = variant === 'inline';

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        gap: '8px',
        padding: isCompact ? '8px 0' : '16px 0',
      }}>
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            style={{
              width: isCompact ? '32px' : '44px',
              height: isCompact ? '32px' : '44px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.1)',
            }}
          />
        ))}
      </div>
    );
  }

  if (!providers || (!providers.flatrate?.length && !providers.rent?.length && !providers.buy?.length)) {
    return (
      <div style={{ 
        padding: isCompact ? '8px 0' : '16px 0',
        color: 'rgba(255,255,255,0.4)',
        fontSize: isCompact ? '12px' : '14px',
      }}>
        <span>📺 Streaming info unavailable in your region</span>
      </div>
    );
  }

  const streamProviders = providers.flatrate || [];
  const rentProviders = providers.rent || [];
  const buyProviders = providers.buy || [];

  const tabs = [
    { id: 'stream', label: 'Stream', emoji: '📺', count: streamProviders.length },
    { id: 'rent', label: 'Rent', emoji: '🎬', count: rentProviders.length },
    { id: 'buy', label: 'Buy', emoji: '💳', count: buyProviders.length },
  ].filter(tab => tab.count > 0);

  const currentProviders = 
    activeTab === 'stream' ? streamProviders :
    activeTab === 'rent' ? rentProviders :
    buyProviders;

  // Inline variant - just show logos
  if (isInline) {
    const allProviders = [...streamProviders, ...rentProviders, ...buyProviders]
      .filter((p, i, arr) => arr.findIndex(x => x.provider_id === p.provider_id) === i)
      .slice(0, 4);
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {allProviders.map((provider) => (
          <motion.img
            key={provider.provider_id}
            src={getProviderLogoUrl(provider.logo_path)}
            alt={provider.provider_name}
            title={provider.provider_name}
            whileHover={{ scale: 1.1 }}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              objectFit: 'cover',
            }}
          />
        ))}
        {allProviders.length === 0 && (
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
            Not streaming
          </span>
        )}
      </div>
    );
  }

  return (
    <div style={{ marginTop: isCompact ? '12px' : '20px' }}>
      {showTitle && (
        <h4 style={{ 
          fontSize: isCompact ? '13px' : '15px', 
          fontWeight: 600,
          color: 'rgba(255,255,255,0.8)',
          marginBottom: isCompact ? '8px' : '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span>📺</span> Where to Watch
        </h4>
      )}

      {/* Tabs */}
      {tabs.length > 1 && (
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: isCompact ? '12px' : '16px',
        }}>
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id as 'stream' | 'rent' | 'buy')}
              style={{
                padding: isCompact ? '6px 12px' : '8px 16px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: activeTab === tab.id 
                  ? 'rgba(139, 92, 246, 0.5)' 
                  : 'rgba(255,255,255,0.1)',
                background: activeTab === tab.id 
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)'
                  : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: '#fff',
                fontSize: isCompact ? '11px' : '12px',
                fontWeight: 500,
                transition: 'all 0.2s ease',
              }}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
              <span style={{ 
                background: 'rgba(255,255,255,0.15)',
                padding: '2px 6px',
                borderRadius: '10px',
                fontSize: isCompact ? '10px' : '11px',
              }}>
                {tab.count}
              </span>
            </motion.button>
          ))}
        </div>
      )}

      {/* Provider Logos */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: isCompact ? '8px' : '12px',
          }}
        >
          {currentProviders.map((provider, index) => (
            <motion.div
              key={provider.provider_id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.1, y: -2 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <div
                style={{
                  width: isCompact ? '40px' : '52px',
                  height: isCompact ? '40px' : '52px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: `0 4px 16px ${PROVIDER_COLORS[provider.provider_id] || 'rgba(0,0,0,0.3)'}40`,
                  border: '2px solid rgba(255,255,255,0.1)',
                }}
              >
                <img
                  src={getProviderLogoUrl(provider.logo_path)}
                  alt={provider.provider_name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
              {!isCompact && (
                <span style={{ 
                  fontSize: '10px', 
                  color: 'rgba(255,255,255,0.6)',
                  textAlign: 'center',
                  maxWidth: '60px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {provider.provider_name}
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* JustWatch attribution */}
      <p style={{ 
        fontSize: '10px', 
        color: 'rgba(255,255,255,0.3)',
        marginTop: isCompact ? '8px' : '12px',
      }}>
        Data provided by JustWatch
      </p>
    </div>
  );
}

// Mini streaming badge for movie cards
export function StreamingBadge({ movieId }: { movieId: number }) {
  const [topProvider, setTopProvider] = useState<WatchProvider | null>(null);

  useEffect(() => {
    async function fetchProvider() {
      const data = await getWatchProviders(movieId);
      const provider = data?.flatrate?.[0] || data?.free?.[0];
      setTopProvider(provider || null);
    }
    fetchProvider();
  }, [movieId]);

  if (!topProvider) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        position: 'absolute',
        top: '8px',
        left: '8px',
        width: '28px',
        height: '28px',
        borderRadius: '6px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.2)',
        zIndex: 10,
      }}
    >
      <img
        src={getProviderLogoUrl(topProvider.logo_path)}
        alt={topProvider.provider_name}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </motion.div>
  );
}
