"use client";

/**
 * Export/Import Modal Component
 * =============================
 * UI for exporting and importing user data.
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiquidSurface } from './Liquid/LiquidSurface';
import {
  exportAsJSON,
  exportAsCSV,
  exportForLetterboxd,
  parseLetterboxdCSV,
  parseIMDbExport,
  parseScanMovieExport,
  matchMoviesToTMDB,
  downloadFile,
  readFileAsText,
} from '~/services/exportImport';
import type { Movie } from '~/services/tmdb';
import { useLanguage } from '~/contexts/LanguageContext';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'export' | 'import';
  watchlist: Movie[];
  favorites: Movie[];
  ratings: Record<number, number>;
  collections: { name: string; emoji: string; movieIds: number[] }[];
  onImport?: (data: { 
    watchlist?: Movie[]; 
    favorites?: Movie[]; 
    ratings?: { movieId: number; rating: number }[] 
  }) => void;
}

export function ExportImportModal({
  isOpen,
  onClose,
  mode,
  watchlist,
  favorites,
  ratings,
  collections,
  onImport,
}: ExportImportModalProps) {
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'letterboxd'>('json');
  const [exportType, setExportType] = useState<'all' | 'watchlist' | 'favorites'>('all');
  const [importSource, setImportSource] = useState<'scanmovie' | 'letterboxd' | 'imdb'>('scanmovie');
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
  const [importResult, setImportResult] = useState<{ matched: number; unmatched: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const handleExport = () => {
    setError(null);
    
    try {
      const now = new Date().toISOString().split('T')[0];
      
      if (exportFormat === 'json') {
        const ratingsArray = Object.entries(ratings).map(([id, rating]) => ({
          movieId: parseInt(id),
          rating,
          ratedAt: new Date().toISOString(),
        }));
        const content = exportAsJSON(watchlist, favorites, ratingsArray, collections, []);
        downloadFile(content, `scanmovie-export-${now}.json`, 'application/json');
      } else if (exportFormat === 'csv') {
        const movies = exportType === 'watchlist' ? watchlist : 
                       exportType === 'favorites' ? favorites : 
                       [...watchlist, ...favorites];
        // Map 'favorites' to 'watched' for CSV format compatibility
        const csvType = exportType === 'favorites' ? 'watched' : 
                        exportType === 'all' ? 'watched' : exportType;
        const content = exportAsCSV(movies, ratings, csvType);
        downloadFile(content, `scanmovie-${exportType}-${now}.csv`, 'text/csv');
      } else if (exportFormat === 'letterboxd') {
        const movies = exportType === 'watchlist' ? watchlist : 
                       exportType === 'favorites' ? favorites : 
                       [...watchlist, ...favorites];
        const content = exportForLetterboxd(movies, ratings);
        downloadFile(content, `letterboxd-import-${now}.csv`, 'text/csv');
      }
      
      onClose();
    } catch (e) {
      setError('Failed to export. Please try again.');
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setError(null);
    setImportResult(null);
    
    try {
      const content = await readFileAsText(file);
      
      if (importSource === 'scanmovie') {
        const data = parseScanMovieExport(content);
        if (!data) {
          setError('Invalid ScanMovie export file');
          return;
        }
        
        // TODO: Import the data
        setImportResult({ 
          matched: data.data.watchlist.length + data.data.favorites.length,
          unmatched: 0,
        });
      } else if (importSource === 'letterboxd') {
        const { movies, errors } = await parseLetterboxdCSV(content);
        if (errors.length > 0) {
          console.warn('Parse errors:', errors);
        }
        
        if (movies.length === 0) {
          setError('No movies found in file');
          return;
        }
        
        setImportProgress({ current: 0, total: movies.length });
        
        const { matched, unmatched } = await matchMoviesToTMDB(
          movies,
          (current, total) => setImportProgress({ current, total })
        );
        
        setImportProgress(null);
        setImportResult({ matched: matched.length, unmatched: unmatched.length });
        
        if (onImport && matched.length > 0) {
          onImport({
            watchlist: matched.map(m => m.movie),
            ratings: matched
              .filter(m => m.rating)
              .map(m => ({ movieId: m.movie.id, rating: m.rating! })),
          });
        }
      } else if (importSource === 'imdb') {
        const { movies, errors } = await parseIMDbExport(content);
        if (errors.length > 0) {
          console.warn('Parse errors:', errors);
        }
        
        if (movies.length === 0) {
          setError('No movies found in file');
          return;
        }
        
        setImportProgress({ current: 0, total: movies.length });
        
        const { matched, unmatched } = await matchMoviesToTMDB(
          movies,
          (current, total) => setImportProgress({ current, total })
        );
        
        setImportProgress(null);
        setImportResult({ matched: matched.length, unmatched: unmatched.length });
        
        if (onImport && matched.length > 0) {
          onImport({
            watchlist: matched.map(m => m.movie),
            ratings: matched
              .filter(m => m.rating)
              .map(m => ({ movieId: m.movie.id, rating: m.rating! })),
          });
        }
      }
    } catch (e) {
      setError('Failed to read file. Please check the format.');
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 1000,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={e => e.stopPropagation()}
          style={{ width: '100%', maxWidth: '480px' }}
        >
          <LiquidSurface variant="container" cornerRadius={24} padding="24px">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 700 }}>
                {mode === 'export' ? `📤 ${t('library.export')}` : `📥 ${t('library.import')}`}
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </motion.button>
            </div>

            {/* Export Mode */}
            {mode === 'export' && (
              <>
                {/* Format Selection */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>
                    Format
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {(['json', 'csv', 'letterboxd'] as const).map(format => (
                      <button
                        key={format}
                        onClick={() => setExportFormat(format)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: '10px',
                          background: exportFormat === format ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255,255,255,0.05)',
                          border: exportFormat === format ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                          color: exportFormat === format ? '#c4b5fd' : 'rgba(255,255,255,0.6)',
                          fontSize: '13px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                        }}
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type Selection (for CSV) */}
                {exportFormat !== 'json' && (
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>
                      What to Export
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {(['all', 'watchlist', 'favorites'] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => setExportType(type)}
                          style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '10px',
                            background: exportType === type ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255,255,255,0.05)',
                            border: exportType === type ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                            color: exportType === type ? '#c4b5fd' : 'rgba(255,255,255,0.6)',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                          }}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>Watchlist</span>
                    <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{watchlist.length} movies</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>Favorites</span>
                    <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{favorites.length} movies</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>Ratings</span>
                    <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{Object.keys(ratings).length} movies</span>
                  </div>
                </div>

                {/* Export Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExport}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Download Export
                </motion.button>
              </>
            )}

            {/* Import Mode */}
            {mode === 'import' && (
              <>
                {/* Source Selection */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>
                    Import From
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {([
                      { id: 'scanmovie', label: 'ScanMovie', icon: '🎬' },
                      { id: 'letterboxd', label: 'Letterboxd', icon: '🎞️' },
                      { id: 'imdb', label: 'IMDb', icon: '⭐' },
                    ] as const).map(source => (
                      <button
                        key={source.id}
                        onClick={() => setImportSource(source.id)}
                        style={{
                          flex: 1,
                          padding: '12px 8px',
                          borderRadius: '10px',
                          background: importSource === source.id ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255,255,255,0.05)',
                          border: importSource === source.id ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                          color: importSource === source.id ? '#c4b5fd' : 'rgba(255,255,255,0.6)',
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span style={{ fontSize: '20px' }}>{source.icon}</span>
                        <span>{source.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={importSource === 'scanmovie' ? '.json' : '.csv'}
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />

                {/* Upload Area */}
                <motion.div
                  whileHover={{ borderColor: 'rgba(139, 92, 246, 0.5)' }}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed rgba(255,255,255,0.2)',
                    borderRadius: '16px',
                    padding: '32px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📁</div>
                  <p style={{ color: '#fff', fontSize: '14px', marginBottom: '4px' }}>
                    Click to select file
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                    {importSource === 'scanmovie' ? 'JSON file' : 'CSV file'}
                  </p>
                </motion.div>

                {/* Progress */}
                {importProgress && (
                  <div style={{
                    background: 'rgba(139, 92, 246, 0.2)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '16px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#c4b5fd', fontSize: '13px' }}>Matching movies...</span>
                      <span style={{ color: '#fff', fontSize: '13px' }}>
                        {importProgress.current} / {importProgress.total}
                      </span>
                    </div>
                    <div style={{
                      height: '6px',
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                        style={{
                          height: '100%',
                          background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
                          borderRadius: '3px',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Result */}
                {importResult && (
                  <div style={{
                    background: 'rgba(34, 197, 94, 0.2)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '16px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '20px' }}>✅</span>
                      <span style={{ color: '#4ade80', fontSize: '14px', fontWeight: 600 }}>
                        Import Complete!
                      </span>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                      Matched {importResult.matched} movies
                      {importResult.unmatched > 0 && ` • ${importResult.unmatched} not found`}
                    </p>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '16px',
                  }}>
                    <p style={{ color: '#f87171', fontSize: '13px' }}>{error}</p>
                  </div>
                )}

                {/* Tips */}
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  padding: '16px',
                }}>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', lineHeight: 1.5 }}>
                    {importSource === 'letterboxd' && (
                      <>📌 Export from Letterboxd: Settings → Import & Export → Export Your Data</>
                    )}
                    {importSource === 'imdb' && (
                      <>📌 Export from IMDb: Your Ratings → Export (three dots menu)</>
                    )}
                    {importSource === 'scanmovie' && (
                      <>📌 Use a JSON file previously exported from ScanMovie</>
                    )}
                  </p>
                </div>
              </>
            )}
          </LiquidSurface>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
