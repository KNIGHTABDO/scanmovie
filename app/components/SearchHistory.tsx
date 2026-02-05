
/**
 * Search History Component
 * ========================
 * Displays recent search queries with liquid glass styling
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Surface } from './Surface';
import { 
  getSearchHistory, 
  removeFromSearchHistory, 
  clearSearchHistory,
  type SearchHistoryItem 
} from '~/services/searchHistory';

interface SearchHistoryProps {
  onSelectSearch: (query: string) => void;
  maxItems?: number;
  variant?: 'default' | 'compact';
}

export function SearchHistory({ 
  onSelectSearch, 
  maxItems = 10,
  variant = 'default' 
}: SearchHistoryProps) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(variant === 'default');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const items = getSearchHistory().slice(0, maxItems);
    setHistory(items);
  };

  const handleRemoveItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromSearchHistory(id);
    loadHistory();
  };

  const handleClearAll = () => {
    if (confirm('Clear all search history?')) {
      clearSearchHistory();
      setHistory([]);
    }
  };

  const handleSelectSearch = (query: string) => {
    onSelectSearch(query);
  };

  if (history.length === 0) {
    return null;
  }

  const isCompact = variant === 'compact';

  return (
    <Surface
      style={{
        padding: isCompact ? '12px' : '20px',
        marginBottom: isCompact ? '16px' : '24px',
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: isCompact ? '8px' : '12px',
      }}>
        <h3 style={{ 
          fontSize: isCompact ? '14px' : '16px',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.9)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span>🕐</span>
          <span>Recent Searches</span>
        </h3>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {isCompact && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                color: 'rgba(255,255,255,0.7)',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              {isExpanded ? 'Show Less' : 'Show All'}
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClearAll}
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.5)',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Clear All
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '8px',
          maxHeight: isCompact && !isExpanded ? '100px' : 'none',
          overflow: 'hidden',
        }}>
          {history.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelectSearch(item.query)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '16px',
                color: 'rgba(255,255,255,0.85)',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
            >
              <span>{item.type === 'ai' ? '🤖' : '🔍'}</span>
              <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.query}
              </span>
              
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => handleRemoveItem(item.id, e)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.6)',
                  marginLeft: '4px',
                }}
                title="Remove"
              >
                ×
              </motion.button>
            </motion.button>
          ))}
        </div>
      </AnimatePresence>
      
      {history.length > 5 && isCompact && !isExpanded && (
        <div style={{ 
          marginTop: '8px',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.4)',
          textAlign: 'center',
        }}>
          +{history.length - 5} more searches
        </div>
      )}
    </Surface>
  );
}
