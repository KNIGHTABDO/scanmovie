
/**
 * Advanced Filters Component
 * ===========================
 * Comprehensive filtering for movie discovery
 * Includes: year range, runtime, rating, certification, and more
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Surface } from './Surface';

export interface AdvancedFilterOptions {
  yearMin?: number;
  yearMax?: number;
  runtimeMin?: number;
  runtimeMax?: number;
  ratingMin?: number;
  ratingMax?: number;
  certification?: string;
  sortBy?: string;
}

interface AdvancedFiltersProps {
  onApplyFilters: (filters: AdvancedFilterOptions) => void;
  variant?: 'default' | 'compact';
}

const CERTIFICATIONS = [
  { value: '', label: 'Any Rating' },
  { value: 'G', label: 'G - General Audiences' },
  { value: 'PG', label: 'PG - Parental Guidance' },
  { value: 'PG-13', label: 'PG-13 - Parents Strongly Cautioned' },
  { value: 'R', label: 'R - Restricted' },
  { value: 'NC-17', label: 'NC-17 - Adults Only' },
];

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'release_date.desc', label: 'Newest First' },
  { value: 'release_date.asc', label: 'Oldest First' },
  { value: 'title.asc', label: 'Title (A-Z)' },
];

export function AdvancedFilters({ onApplyFilters, variant = 'default' }: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const currentYear = new Date().getFullYear();
  
  // Filter states
  const [yearMin, setYearMin] = useState<number>(1970);
  const [yearMax, setYearMax] = useState<number>(currentYear);
  const [runtimeMin, setRuntimeMin] = useState<number>(0);
  const [runtimeMax, setRuntimeMax] = useState<number>(300);
  const [ratingMin, setRatingMin] = useState<number>(0);
  const [ratingMax, setRatingMax] = useState<number>(10);
  const [certification, setCertification] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popularity.desc');
  
  const isCompact = variant === 'compact';
  
  const handleApply = () => {
    const filters: AdvancedFilterOptions = {
      yearMin: yearMin > 1900 ? yearMin : undefined,
      yearMax: yearMax < currentYear ? yearMax : undefined,
      runtimeMin: runtimeMin > 0 ? runtimeMin : undefined,
      runtimeMax: runtimeMax < 300 ? runtimeMax : undefined,
      ratingMin: ratingMin > 0 ? ratingMin : undefined,
      ratingMax: ratingMax < 10 ? ratingMax : undefined,
      certification: certification || undefined,
      sortBy,
    };
    
    onApplyFilters(filters);
    if (isCompact) setIsExpanded(false);
  };
  
  const handleReset = () => {
    setYearMin(1970);
    setYearMax(currentYear);
    setRuntimeMin(0);
    setRuntimeMax(300);
    setRatingMin(0);
    setRatingMax(10);
    setCertification('');
    setSortBy('popularity.desc');
    onApplyFilters({});
  };
  
  const filterContent = (
    <div>
      {/* Year Range */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.8)',
          marginBottom: '12px',
        }}>
          📅 Release Year: {yearMin} - {yearMax}
        </label>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="number"
            min="1900"
            max={currentYear}
            value={yearMin}
            onChange={(e) => setYearMin(parseInt(e.target.value) || 1900)}
            style={{
              width: '100px',
              padding: '8px 12px',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
            }}
          />
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>to</span>
          <input
            type="number"
            min="1900"
            max={currentYear}
            value={yearMax}
            onChange={(e) => setYearMax(parseInt(e.target.value) || currentYear)}
            style={{
              width: '100px',
              padding: '8px 12px',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
            }}
          />
        </div>
      </div>
      
      {/* Runtime Range */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.8)',
          marginBottom: '12px',
        }}>
          ⏱️ Runtime: {runtimeMin} - {runtimeMax} min
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <input
              type="range"
              min="0"
              max="300"
              step="10"
              value={runtimeMin}
              onChange={(e) => setRuntimeMin(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#8b5cf6' }}
            />
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
              Min: {runtimeMin} min
            </div>
          </div>
          <div>
            <input
              type="range"
              min="0"
              max="300"
              step="10"
              value={runtimeMax}
              onChange={(e) => setRuntimeMax(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#8b5cf6' }}
            />
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
              Max: {runtimeMax} min
            </div>
          </div>
        </div>
      </div>
      
      {/* Rating Range */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.8)',
          marginBottom: '12px',
        }}>
          ⭐ Rating: {ratingMin} - {ratingMax}/10
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={ratingMin}
              onChange={(e) => setRatingMin(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#8b5cf6' }}
            />
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
              Min: {ratingMin}/10
            </div>
          </div>
          <div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={ratingMax}
              onChange={(e) => setRatingMax(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#8b5cf6' }}
            />
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
              Max: {ratingMax}/10
            </div>
          </div>
        </div>
      </div>
      
      {/* Certification */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.8)',
          marginBottom: '12px',
        }}>
          🎬 Certification
        </label>
        <select
          value={certification}
          onChange={(e) => setCertification(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
          }}
        >
          {CERTIFICATIONS.map(cert => (
            <option key={cert.value} value={cert.value}>{cert.label}</option>
          ))}
        </select>
      </div>
      
      {/* Sort By */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.8)',
          marginBottom: '12px',
        }}>
          🔄 Sort By
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
          }}
        >
          {SORT_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      
      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleReset}
          style={{
            flex: 1,
            padding: '12px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Reset
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleApply}
          style={{
            flex: 2,
            padding: '12px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.8) 0%, rgba(168, 85, 247, 0.8) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.5)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Apply Filters
        </motion.button>
      </div>
    </div>
  );
  
  if (isCompact) {
    return (
      <Surface style={{ marginBottom: '24px' }}>
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            width: '100%',
            padding: '16px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#fff',
          }}
        >
          <span style={{ fontSize: '16px', fontWeight: 600 }}>
            🎯 Advanced Filters
          </span>
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            ▼
          </motion.span>
        </motion.button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden', padding: '0 16px 16px 16px' }}
            >
              {filterContent}
            </motion.div>
          )}
        </AnimatePresence>
      </Surface>
    );
  }
  
  return (
    <Surface style={{ padding: '24px', marginBottom: '24px' }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: 700,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span>🎯</span>
        <span>Advanced Filters</span>
      </h3>
      {filterContent}
    </Surface>
  );
}
