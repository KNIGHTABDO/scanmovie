"use client";

/**
 * Person/Cast Member Detail Page
 * ==============================
 * Shows actor/director biography, filmography, and stats.
 * Uses LiquidGlass styling consistent with the app.
 */

import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'framer-motion';
import { LiquidSurface } from '~/components/Liquid/LiquidSurface';
import { MovieCard } from '~/components/MovieCard';
import {
  getPersonDetails,
  getPersonMovieCredits,
  getPersonImages,
  getProfileUrl,
  getBackdropUrl,
  type Person,
  type PersonCredits,
  type PersonImages,
  type PersonMovieCredit,
} from '~/services/tmdb';

export function PersonPage() {
  const { id } = useParams();
  const personId = parseInt(id || '0', 10);

  const [person, setPerson] = useState<Person | null>(null);
  const [credits, setCredits] = useState<PersonCredits | null>(null);
  const [images, setImages] = useState<PersonImages | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'acting' | 'directing' | 'all'>('acting');
  const [showFullBio, setShowFullBio] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!personId) return;

    async function fetchPersonData() {
      setLoading(true);
      try {
        const [personData, creditsData, imagesData] = await Promise.all([
          getPersonDetails(personId),
          getPersonMovieCredits(personId),
          getPersonImages(personId),
        ]);
        setPerson(personData);
        setCredits(creditsData);
        setImages(imagesData);
      } catch (error) {
        console.error('Failed to fetch person data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPersonData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [personId]);

  if (loading) {
    return <PersonLoadingScreen />;
  }

  if (!person) {
    return <PersonNotFound />;
  }

  // Process credits - sort by release date (newest first) and remove duplicates
  const processedCastCredits = credits?.cast
    .filter((c) => c.release_date) // Filter out unreleased
    .sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime())
    .filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i) || [];

  const processedCrewCredits = credits?.crew
    .filter((c) => c.release_date && c.department === 'Directing')
    .sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime())
    .filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i) || [];

  const allCredits = [...processedCastCredits, ...processedCrewCredits]
    .sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime())
    .filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i);

  const displayCredits = activeTab === 'acting' 
    ? processedCastCredits 
    : activeTab === 'directing' 
    ? processedCrewCredits 
    : allCredits;

  // Stats
  const totalMovies = allCredits.length;
  const avgRating = allCredits.length > 0
    ? (allCredits.reduce((sum, m) => sum + (m.vote_average || 0), 0) / allCredits.length).toFixed(1)
    : 'N/A';
  const careerSpan = allCredits.length > 0
    ? `${allCredits[allCredits.length - 1]?.release_date?.split('-')[0]} - ${allCredits[0]?.release_date?.split('-')[0] || 'Present'}`
    : 'N/A';

  // Get a backdrop from their most popular movie
  const topMovie = [...(credits?.cast || [])].sort((a, b) => b.vote_count - a.vote_count)[0];
  const backdropUrl = topMovie?.backdrop_path ? getBackdropUrl(topMovie.backdrop_path, 'original') : null;

  // Age calculation
  const calculateAge = (birthday: string, deathday?: string | null) => {
    const birth = new Date(birthday);
    const end = deathday ? new Date(deathday) : new Date();
    let age = end.getFullYear() - birth.getFullYear();
    const monthDiff = end.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        background: '#0a0a0a',
        color: '#fff',
        overflow: 'hidden',
      }}
    >
      {/* Backdrop Background */}
      {backdropUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 1.2 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${backdropUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            zIndex: 0,
            filter: 'blur(20px)',
          }}
        />
      )}

      {/* Gradient Overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(10,10,10,0.9) 40%, #0a0a0a 100%)',
          zIndex: 1,
        }}
      />

      {/* Main Content */}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          paddingTop: '120px',
          paddingBottom: '80px',
          paddingLeft: '24px',
          paddingRight: '24px',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginBottom: '32px' }}
        >
          <button
            onClick={() => window.history.back()}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <LiquidSurface
              variant="button"
              padding="10px 20px"
              cornerRadius={50}
              displacementScale={40}
            >
              <span style={{ color: '#fff', fontWeight: 500 }}>← Go Back</span>
            </LiquidSurface>
          </button>
        </motion.div>

        {/* Person Header */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ marginBottom: '48px' }}
        >
          <LiquidSurface
            variant="modal"
            cornerRadius={32}
            padding="40px"
            displacementScale={70}
            aberrationIntensity={3}
            mouseContainer={containerRef}
          >
            <div
              style={{
                display: 'flex',
                gap: '40px',
                flexWrap: 'wrap',
              }}
            >
              {/* Profile Photo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                style={{ flexShrink: 0 }}
              >
                <LiquidSurface variant="card" cornerRadius={20} padding="0">
                  <img
                    src={getProfileUrl(person.profile_path, 'h632')}
                    alt={person.name}
                    style={{
                      width: '280px',
                      height: '420px',
                      objectFit: 'cover',
                      borderRadius: '16px',
                      display: 'block',
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 420"><rect fill="%23222" width="280" height="420"/><text x="140" y="220" font-size="80" text-anchor="middle" fill="%23555">👤</text></svg>';
                    }}
                  />
                </LiquidSurface>
              </motion.div>

              {/* Person Info */}
              <div style={{ flex: 1, minWidth: '300px' }}>
                {/* Name */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h1 style={{ fontSize: '42px', fontWeight: 700, marginBottom: '8px' }}>
                    {person.name}
                  </h1>
                  <p style={{ fontSize: '18px', opacity: 0.7, marginBottom: '24px' }}>
                    {person.known_for_department}
                  </p>
                </motion.div>

                {/* Stats Row */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}
                >
                  <LiquidSurface variant="button" padding="10px 18px" cornerRadius={12} displacementScale={35}>
                    <span style={{ fontWeight: 600 }}>🎬 {totalMovies} Movies</span>
                  </LiquidSurface>

                  <LiquidSurface variant="button" padding="10px 18px" cornerRadius={12} displacementScale={35}>
                    <span style={{ fontWeight: 600 }}>⭐ {avgRating} Avg</span>
                  </LiquidSurface>

                  <LiquidSurface variant="button" padding="10px 18px" cornerRadius={12} displacementScale={35}>
                    <span style={{ fontWeight: 600 }}>📅 {careerSpan}</span>
                  </LiquidSurface>
                </motion.div>

                {/* Personal Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                  style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}
                >
                  {person.birthday && (
                    <div>
                      <span style={{ opacity: 0.6, marginRight: '8px' }}>Born:</span>
                      <span style={{ fontWeight: 500 }}>
                        {new Date(person.birthday).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                        {!person.deathday && ` (${calculateAge(person.birthday)} years old)`}
                      </span>
                    </div>
                  )}

                  {person.deathday && (
                    <div>
                      <span style={{ opacity: 0.6, marginRight: '8px' }}>Died:</span>
                      <span style={{ fontWeight: 500 }}>
                        {new Date(person.deathday).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                        {person.birthday && ` (age ${calculateAge(person.birthday, person.deathday)})`}
                      </span>
                    </div>
                  )}

                  {person.place_of_birth && (
                    <div>
                      <span style={{ opacity: 0.6, marginRight: '8px' }}>Birthplace:</span>
                      <span style={{ fontWeight: 500 }}>{person.place_of_birth}</span>
                    </div>
                  )}
                </motion.div>

                {/* Biography */}
                {person.biography && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>Biography</h3>
                    <p
                      style={{
                        lineHeight: 1.7,
                        opacity: 0.85,
                        maxHeight: showFullBio ? 'none' : '150px',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      {person.biography}
                    </p>
                    {person.biography.length > 400 && (
                      <button
                        onClick={() => setShowFullBio(!showFullBio)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#667eea',
                          cursor: 'pointer',
                          marginTop: '8px',
                          fontWeight: 500,
                        }}
                      >
                        {showFullBio ? 'Show Less' : 'Read More'}
                      </button>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </LiquidSurface>
        </motion.section>

        {/* Filmography Tabs */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '24px' }}
        >
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {processedCastCredits.length > 0 && (
              <button
                onClick={() => setActiveTab('acting')}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <LiquidSurface
                  variant={activeTab === 'acting' ? 'modal' : 'button'}
                  padding="14px 24px"
                  cornerRadius={20}
                  displacementScale={45}
                >
                  <span style={{ fontWeight: 600, fontSize: '16px' }}>
                    🎭 Acting ({processedCastCredits.length})
                  </span>
                </LiquidSurface>
              </button>
            )}

            {processedCrewCredits.length > 0 && (
              <button
                onClick={() => setActiveTab('directing')}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <LiquidSurface
                  variant={activeTab === 'directing' ? 'modal' : 'button'}
                  padding="14px 24px"
                  cornerRadius={20}
                  displacementScale={45}
                >
                  <span style={{ fontWeight: 600, fontSize: '16px' }}>
                    🎬 Directing ({processedCrewCredits.length})
                  </span>
                </LiquidSurface>
              </button>
            )}

            <button
              onClick={() => setActiveTab('all')}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <LiquidSurface
                variant={activeTab === 'all' ? 'modal' : 'button'}
                padding="14px 24px"
                cornerRadius={20}
                displacementScale={45}
              >
                <span style={{ fontWeight: 600, fontSize: '16px' }}>
                  📚 All Credits ({allCredits.length})
                </span>
              </LiquidSurface>
            </button>
          </div>
        </motion.section>

        {/* Filmography Grid */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '24px',
            }}
          >
            {displayCredits.slice(0, 24).map((credit, index) => (
              <motion.div
                key={`${credit.id}-${credit.credit_id}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <FilmographyCard
                  credit={credit}
                  isActing={activeTab !== 'directing'}
                />
              </motion.div>
            ))}
          </div>

          {displayCredits.length > 24 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              style={{ textAlign: 'center', marginTop: '32px' }}
            >
              <LiquidSurface variant="button" padding="14px 32px" cornerRadius={50}>
                <span style={{ fontWeight: 500 }}>
                  +{displayCredits.length - 24} more credits
                </span>
              </LiquidSurface>
            </motion.div>
          )}
        </motion.section>
      </main>
    </div>
  );
}

// Filmography Card Component
function FilmographyCard({
  credit,
  isActing,
}: {
  credit: PersonMovieCredit;
  isActing: boolean;
}) {
  return (
    <Link to={`/movie/${credit.id}`} style={{ textDecoration: 'none' }}>
      <motion.div whileHover={{ scale: 1.05, y: -8 }} transition={{ type: 'spring', stiffness: 300 }}>
        <LiquidSurface variant="card" cornerRadius={16} padding="0" displacementScale={50}>
          <div style={{ position: 'relative' }}>
            {/* Poster */}
            <div
              style={{
                width: '100%',
                aspectRatio: '2/3',
                overflow: 'hidden',
                borderRadius: '12px 12px 0 0',
              }}
            >
              <img
                src={
                  credit.poster_path
                    ? `https://image.tmdb.org/t/p/w342${credit.poster_path}`
                    : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300"><rect fill="%23222" width="200" height="300"/><text x="100" y="160" font-size="40" text-anchor="middle" fill="%23444">🎬</text></svg>'
                }
                alt={credit.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>

            {/* Rating Badge */}
            {credit.vote_average > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'rgba(0,0,0,0.8)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '8px',
                  padding: '4px 8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#fbbf24',
                }}
              >
                ⭐ {credit.vote_average.toFixed(1)}
              </div>
            )}

            {/* Info */}
            <div style={{ padding: '12px' }}>
              <h4
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '4px',
                  color: '#fff',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {credit.title}
              </h4>
              <p
                style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.6)',
                  marginBottom: '2px',
                }}
              >
                {credit.release_date?.split('-')[0] || 'TBA'}
              </p>
              {isActing && credit.character && (
                <p
                  style={{
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.5)',
                    fontStyle: 'italic',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  as {credit.character}
                </p>
              )}
              {!isActing && credit.job && (
                <p
                  style={{
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.5)',
                    fontStyle: 'italic',
                  }}
                >
                  {credit.job}
                </p>
              )}
            </div>
          </div>
        </LiquidSurface>
      </motion.div>
    </Link>
  );
}

// Loading Screen
function PersonLoadingScreen() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        style={{ fontSize: '48px' }}
      >
        🎬
      </motion.div>
    </div>
  );
}

// Not Found Screen
function PersonNotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        color: '#fff',
        gap: '20px',
      }}
    >
      <span style={{ fontSize: '64px' }}>😕</span>
      <h1>Person Not Found</h1>
      <Link to="/">
        <LiquidSurface variant="button" padding="12px 24px" cornerRadius={50}>
          <span style={{ color: '#fff' }}>Go Home</span>
        </LiquidSurface>
      </Link>
    </div>
  );
}
