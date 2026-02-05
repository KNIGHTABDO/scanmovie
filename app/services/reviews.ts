/**
 * Reviews Service
 * ===============
 * Manages user reviews for movies using Firebase Firestore
 */

import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore';
import { app } from './firebase';

export interface MovieReview {
  id: string;
  movieId: number;
  movieTitle: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number; // 1-10
  reviewText: string;
  spoilers: boolean;
  createdAt: number;
  updatedAt: number;
}

const db = getFirestore(app);

/**
 * Add or update a review
 */
export async function saveReview(
  userId: string,
  userName: string,
  movieId: number,
  movieTitle: string,
  rating: number,
  reviewText: string,
  spoilers: boolean = false,
  userPhoto?: string
): Promise<MovieReview> {
  try {
    const reviewId = `${userId}_${movieId}`;
    const reviewRef = doc(db, 'reviews', reviewId);
    
    const now = Date.now();
    
    // Check if review exists
    const existingReview = await getDoc(reviewRef);
    const createdAt = existingReview.exists() 
      ? existingReview.data().createdAt 
      : now;
    
    const review: MovieReview = {
      id: reviewId,
      movieId,
      movieTitle,
      userId,
      userName,
      userPhoto,
      rating,
      reviewText: reviewText.trim(),
      spoilers,
      createdAt,
      updatedAt: now,
    };
    
    await setDoc(reviewRef, review);
    
    return review;
  } catch (error) {
    console.error('Failed to save review:', error);
    throw new Error('Failed to save review');
  }
}

/**
 * Get all reviews for a movie
 */
export async function getMovieReviews(movieId: number): Promise<MovieReview[]> {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('movieId', '==', movieId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const reviews: MovieReview[] = [];
    
    snapshot.forEach(doc => {
      reviews.push(doc.data() as MovieReview);
    });
    
    return reviews;
  } catch (error) {
    console.error('Failed to get movie reviews:', error);
    return [];
  }
}

/**
 * Get a user's review for a specific movie
 */
export async function getUserReview(
  userId: string,
  movieId: number
): Promise<MovieReview | null> {
  try {
    const reviewId = `${userId}_${movieId}`;
    const reviewRef = doc(db, 'reviews', reviewId);
    const snapshot = await getDoc(reviewRef);
    
    if (snapshot.exists()) {
      return snapshot.data() as MovieReview;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get user review:', error);
    return null;
  }
}

/**
 * Get all reviews by a user
 */
export async function getUserReviews(userId: string): Promise<MovieReview[]> {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const reviews: MovieReview[] = [];
    
    snapshot.forEach(doc => {
      reviews.push(doc.data() as MovieReview);
    });
    
    return reviews;
  } catch (error) {
    console.error('Failed to get user reviews:', error);
    return [];
  }
}

/**
 * Delete a review
 */
export async function deleteReview(
  userId: string,
  movieId: number
): Promise<void> {
  try {
    const reviewId = `${userId}_${movieId}`;
    const reviewRef = doc(db, 'reviews', reviewId);
    await deleteDoc(reviewRef);
  } catch (error) {
    console.error('Failed to delete review:', error);
    throw new Error('Failed to delete review');
  }
}

/**
 * Get review statistics for a movie
 */
export async function getReviewStats(movieId: number): Promise<{
  count: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
}> {
  try {
    const reviews = await getMovieReviews(movieId);
    
    const ratingDistribution: Record<number, number> = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
      6: 0, 7: 0, 8: 0, 9: 0, 10: 0,
    };
    
    let totalRating = 0;
    
    reviews.forEach(review => {
      ratingDistribution[review.rating]++;
      totalRating += review.rating;
    });
    
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    
    return {
      count: reviews.length,
      averageRating,
      ratingDistribution,
    };
  } catch (error) {
    console.error('Failed to get review stats:', error);
    return {
      count: 0,
      averageRating: 0,
      ratingDistribution: {},
    };
  }
}
