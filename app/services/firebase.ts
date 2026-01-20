/**
 * Firebase Configuration
 * ======================
 * Handles Firebase initialization for:
 * - Google Authentication
 * - Firestore Database (cloud sync)
 * 
 * Domain: scanmovie-app.vercel.app
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type Auth,
  type User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp,
  type Firestore 
} from 'firebase/firestore';

// Firebase configuration
// These will be populated from environment variables in production
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemo_placeholder",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "scanmovie-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "scanmovie-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "scanmovie-app.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abc123",
};

// Initialize Firebase (only once)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

if (isBrowser) {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  db = getFirestore(app);
}

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Custom parameters for Google sign-in
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<User | null> {
  if (!isBrowser) return null;
  
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Create/update user profile in Firestore
    await createOrUpdateUserProfile(user);
    
    return user;
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    
    // Handle specific errors
    if (error.code === 'auth/popup-closed-by-user') {
      console.log('Sign-in popup was closed');
    } else if (error.code === 'auth/popup-blocked') {
      console.error('Popup was blocked by the browser');
    }
    
    throw error;
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  if (!isBrowser) return;
  
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!isBrowser) return () => {};
  
  return onAuthStateChanged(auth, callback);
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  if (!isBrowser) return null;
  return auth?.currentUser || null;
}

/**
 * User profile type
 */
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: any;
  lastLoginAt: any;
  // Stats
  totalMoviesWatched: number;
  totalRatings: number;
  memberSince: string;
  // Preferences
  favoriteGenres: number[];
  theme: 'dark' | 'light' | 'auto';
}

/**
 * Create or update user profile in Firestore
 */
async function createOrUpdateUserProfile(user: User): Promise<void> {
  if (!isBrowser) return;
  
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    // New user - create profile
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      totalMoviesWatched: 0,
      totalRatings: 0,
      memberSince: new Date().toISOString().split('T')[0],
      favoriteGenres: [],
      theme: 'dark',
    };
    
    await setDoc(userRef, profile);
    console.log('Created new user profile');
  } else {
    // Existing user - update last login
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
      // Update profile info in case it changed
      displayName: user.displayName,
      photoURL: user.photoURL,
      email: user.email,
    });
    console.log('Updated user profile');
  }
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!isBrowser) return null;
  
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  if (!isBrowser) return;
  
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, updates);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Export instances for direct access if needed
export { auth, db };
