
/**
 * Movie Reviews Components
 * ========================
 * Components for displaying and writing movie reviews
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Surface } from './Surface';
import { useAuth } from '~/contexts/AuthContext';
import { 
  getMovieReviews, 
  getUserReview, 
  saveReview, 
  deleteReview,
  type MovieReview 
} from '~/services/reviews';

interface ReviewsDisplayProps {
  movieId: number;
  movieTitle: string;
}

export function MovieReviews({ movieId, movieTitle }: ReviewsDisplayProps) {
  const [reviews, setReviews] = useState<MovieReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const { user, isAuthenticated } = useAuth();
  
  useEffect(() => {
    loadReviews();
  }, [movieId]);
  
  const loadReviews = async () => {
    setLoading(true);
    const movieReviews = await getMovieReviews(movieId);
    setReviews(movieReviews);
    setLoading(false);
  };
  
  const userReview = reviews.find(r => r.userId === user?.uid);
  const otherReviews = reviews.filter(r => r.userId !== user?.uid);
  
  return (
    <div style={{ marginTop: '32px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: 'rgba(255,255,255,0.9)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span>📝</span>
          <span>Reviews</span>
          <span style={{ 
            fontSize: '14px', 
            fontWeight: 400, 
            color: 'rgba(255,255,255,0.5)',
          }}>
            ({reviews.length})
          </span>
        </h3>
        
        {isAuthenticated && !userReview && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowWriteReview(true)}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.8) 0%, rgba(168, 85, 247, 0.8) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.5)',
              borderRadius: '20px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Write a Review
          </motion.button>
        )}
      </div>
      
      {/* Write Review Modal */}
      <AnimatePresence>
        {showWriteReview && user && (
          <WriteReviewModal
            movieId={movieId}
            movieTitle={movieTitle}
            userId={user.uid}
            userName={user.displayName || 'Anonymous'}
            userPhoto={user.photoURL || undefined}
            onClose={() => setShowWriteReview(false)}
            onSave={() => {
              setShowWriteReview(false);
              loadReviews();
            }}
          />
        )}
      </AnimatePresence>
      
      {/* User's Review (if exists) */}
      {userReview && (
        <div style={{ marginBottom: '20px' }}>
          <ReviewCard
            review={userReview}
            isOwnReview={true}
            onEdit={() => setShowWriteReview(true)}
            onDelete={() => loadReviews()}
          />
        </div>
      )}
      
      {/* Other Reviews */}
      {loading ? (
        <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '40px' }}>
          Loading reviews...
        </div>
      ) : otherReviews.length === 0 && !userReview ? (
        <Surface style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
            No reviews yet. Be the first to review this movie!
          </p>
        </Surface>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {otherReviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewCard({ 
  review, 
  isOwnReview = false,
  onEdit,
  onDelete,
}: { 
  review: MovieReview; 
  isOwnReview?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const [showSpoilers, setShowSpoilers] = useState(!review.spoilers);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    setIsDeleting(true);
    try {
      await deleteReview(review.userId, review.movieId);
      onDelete?.();
    } catch (error) {
      alert('Failed to delete review');
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <Surface style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* User Avatar */}
        {review.userPhoto ? (
          <img
            src={review.userPhoto}
            alt={review.userName}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.5) 0%, rgba(168, 85, 247, 0.5) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 600,
              color: '#fff',
            }}
          >
            {review.userName.charAt(0).toUpperCase()}
          </div>
        )}
        
        {/* Review Content */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 600, 
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '4px',
              }}>
                {review.userName}
                {isOwnReview && (
                  <span style={{ 
                    marginLeft: '8px',
                    fontSize: '11px',
                    padding: '2px 8px',
                    background: 'rgba(139, 92, 246, 0.3)',
                    borderRadius: '10px',
                  }}>
                    You
                  </span>
                )}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: 'rgba(255,255,255,0.4)',
                marginBottom: '8px',
              }}>
                {new Date(review.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
                {review.updatedAt !== review.createdAt && ' (edited)'}
              </div>
            </div>
            
            {/* Rating */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 165, 0, 0.2) 100%)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              borderRadius: '12px',
            }}>
              <span style={{ fontSize: '14px' }}>⭐</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffd700' }}>
                {review.rating}/10
              </span>
            </div>
          </div>
          
          {/* Review Text */}
          {review.spoilers && !showSpoilers ? (
            <div style={{ marginTop: '12px' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSpoilers(true)}
                style={{
                  padding: '12px 20px',
                  background: 'rgba(255, 0, 0, 0.1)',
                  border: '1px solid rgba(255, 0, 0, 0.3)',
                  borderRadius: '12px',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                ⚠️ This review contains spoilers. Click to reveal.
              </motion.button>
            </div>
          ) : (
            <p style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.75)',
              lineHeight: 1.6,
              marginTop: '12px',
              whiteSpace: 'pre-wrap',
            }}>
              {review.reviewText}
            </p>
          )}
          
          {/* Action Buttons for Own Review */}
          {isOwnReview && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEdit}
                style={{
                  padding: '6px 14px',
                  background: 'rgba(99, 102, 241, 0.2)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: '12px',
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Edit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDelete}
                disabled={isDeleting}
                style={{
                  padding: '6px 14px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '12px',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  opacity: isDeleting ? 0.5 : 1,
                }}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </Surface>
  );
}

function WriteReviewModal({
  movieId,
  movieTitle,
  userId,
  userName,
  userPhoto,
  onClose,
  onSave,
}: {
  movieId: number;
  movieTitle: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  onClose: () => void;
  onSave: () => void;
}) {
  const [rating, setRating] = useState(8);
  const [reviewText, setReviewText] = useState('');
  const [spoilers, setSpoilers] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Load existing review if any
    async function loadExistingReview() {
      const existing = await getUserReview(userId, movieId);
      if (existing) {
        setRating(existing.rating);
        setReviewText(existing.reviewText);
        setSpoilers(existing.spoilers);
      }
      setIsLoading(false);
    }
    loadExistingReview();
  }, [userId, movieId]);
  
  const handleSave = async () => {
    if (reviewText.trim().length < 10) {
      alert('Please write at least 10 characters');
      return;
    }
    
    setIsSaving(true);
    try {
      await saveReview(
        userId,
        userName,
        movieId,
        movieTitle,
        rating,
        reviewText,
        spoilers,
        userPhoto
      );
      onSave();
    } catch (error) {
      alert('Failed to save review');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
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
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '600px' }}
      >
        <Surface style={{ padding: '32px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '8px',
          }}>
            {reviewText ? 'Edit Your Review' : 'Write a Review'}
          </h2>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '24px',
          }}>
            {movieTitle}
          </p>
          
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading...</p>
            </div>
          ) : (
            <>
              {/* Rating */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.8)',
                  marginBottom: '10px',
                }}>
                  Rating: {rating}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={rating}
                  onChange={(e) => setRating(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    accentColor: '#8b5cf6',
                  }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.4)',
                  marginTop: '4px',
                }}>
                  <span>1 - Terrible</span>
                  <span>10 - Masterpiece</span>
                </div>
              </div>
              
              {/* Review Text */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.8)',
                  marginBottom: '10px',
                }}>
                  Your Review
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your thoughts about this movie..."
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.4)',
                  marginTop: '4px',
                }}>
                  {reviewText.length} characters (minimum 10)
                </div>
              </div>
              
              {/* Spoilers Toggle */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '24px',
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={spoilers}
                  onChange={(e) => setSpoilers(e.target.checked)}
                  style={{ accentColor: '#8b5cf6' }}
                />
                <span style={{
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.7)',
                }}>
                  This review contains spoilers
                </span>
              </label>
              
              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  style={{
                    padding: '12px 24px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '20px',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={isSaving || reviewText.trim().length < 10}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.8) 0%, rgba(168, 85, 247, 0.8) 100%)',
                    border: '1px solid rgba(139, 92, 246, 0.5)',
                    borderRadius: '20px',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: isSaving || reviewText.trim().length < 10 ? 'not-allowed' : 'pointer',
                    opacity: isSaving || reviewText.trim().length < 10 ? 0.5 : 1,
                  }}
                >
                  {isSaving ? 'Saving...' : 'Save Review'}
                </motion.button>
              </div>
            </>
          )}
        </Surface>
      </motion.div>
    </motion.div>
  );
}
