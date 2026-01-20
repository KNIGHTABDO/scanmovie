# 🔥 Firebase Setup Guide for ScanMovie

Complete step-by-step guide to set up Firebase authentication and cloud sync.

---

## 📋 Prerequisites

- A Google account
- Access to [Firebase Console](https://console.firebase.google.com/)
- Access to [Vercel Dashboard](https://vercel.com/dashboard) (for environment variables)

---

## Step 1: Create Firebase Project

1. Go to **[Firebase Console](https://console.firebase.google.com/)**

2. Click **"Create a project"** (or "Add project")

3. Enter project name: `scanmovie-app`

4. **Disable Google Analytics** (optional, not needed for this app)
   - Toggle OFF "Enable Google Analytics for this project"

5. Click **"Create project"**

6. Wait for project creation, then click **"Continue"**

---

## Step 2: Register Your Web App

1. In your Firebase project dashboard, click the **Web icon** `</>` (under "Get started by adding Firebase to your app")

2. Enter app nickname: `ScanMovie Web`

3. ✅ Check **"Also set up Firebase Hosting"** (optional)

4. Click **"Register app"**

5. You'll see your Firebase config - **COPY THESE VALUES**:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",           // <- Copy this
  authDomain: "scanmovie-app.firebaseapp.com",
  projectId: "scanmovie-app",
  storageBucket: "scanmovie-app.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

6. Click **"Continue to console"**

---

## Step 3: Enable Google Sign-In Authentication

1. In Firebase Console sidebar, click **"Build"** → **"Authentication"**

2. Click **"Get started"**

3. Go to **"Sign-in method"** tab

4. Click on **"Google"** provider

5. Toggle **"Enable"** ON

6. Set **Project support email** (select your email)

7. Click **"Save"**

---

## Step 4: Add Authorized Domain

1. Still in **Authentication** → **"Settings"** tab

2. Scroll down to **"Authorized domains"**

3. Click **"Add domain"**

4. Add: `scanmovie-app.vercel.app`

5. Click **"Add"**

> ⚠️ **Important**: Without this step, Google Sign-in will fail on your production site!

---

## Step 5: Create Firestore Database

1. In Firebase Console sidebar, click **"Build"** → **"Firestore Database"**

2. Click **"Create database"**

3. Choose location:
   - Select a region close to your users
   - Recommended: `us-east1` or `europe-west1`

4. Start in **"Production mode"** (we'll add security rules next)

5. Click **"Create"**

---

## Step 6: Set Up Firestore Security Rules

1. In Firestore Database, click **"Rules"** tab

2. Replace the default rules with:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - profile data
    match /users/{userId} {
      // Users can only read/write their own profile
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User data collection - watchlist, favorites, etc.
    match /userData/{userId} {
      // Users can only read/write their own data
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Block all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click **"Publish"**

---

## Step 7: Get Your Firebase Config Values

1. Go to **Project Settings** (gear icon ⚙️ in sidebar)

2. Scroll down to **"Your apps"** section

3. Find your web app and copy these values:

| Firebase Console Field | Environment Variable |
|------------------------|---------------------|
| `apiKey` | `VITE_FIREBASE_API_KEY` |
| `authDomain` | `VITE_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `VITE_FIREBASE_PROJECT_ID` |
| `storageBucket` | `VITE_FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `VITE_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `VITE_FIREBASE_APP_ID` |

---

## Step 8: Add Environment Variables to Vercel

1. Go to **[Vercel Dashboard](https://vercel.com/dashboard)**

2. Select your **scanmovie** project

3. Click **"Settings"** tab

4. Click **"Environment Variables"** in sidebar

5. Add each variable one by one:

### Add these 6 variables:

| Key | Value (example) |
|-----|-----------------|
| `VITE_FIREBASE_API_KEY` | `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `scanmovie-app.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `scanmovie-app` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `scanmovie-app.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123456789012` |
| `VITE_FIREBASE_APP_ID` | `1:123456789012:web:abc123def456` |

6. For each variable:
   - Make sure **all environments** are selected (Production, Preview, Development)
   - Click **"Save"**

---

## Step 9: Redeploy Your App

After adding environment variables, you need to redeploy:

1. In Vercel, go to **"Deployments"** tab

2. Find the latest deployment

3. Click the **"..."** menu → **"Redeploy"**

4. Click **"Redeploy"** to confirm

---

## Step 10: Test the Integration

1. Go to your live site: **https://scanmovie-app.vercel.app**

2. Click the **"Sign In"** button in the navbar (or go to `/profile`)

3. Click **"Continue with Google"**

4. Sign in with your Google account

5. You should see:
   - ✅ Your Google profile photo in the navbar
   - ✅ Your name and email on the profile page
   - ✅ Cloud sync status showing "Just now"

6. Add a movie to your watchlist

7. Open the site in a different browser/incognito window

8. Sign in with the same Google account

9. **Your watchlist should be synced!** 🎉

---

## 🔧 Troubleshooting

### "Popup closed by user" error
- The user closed the Google sign-in popup
- Just try signing in again

### "Popup blocked" error
- Browser blocked the popup
- User needs to allow popups for your site
- Or click the popup icon in the address bar

### "Unauthorized domain" error
- You forgot to add `scanmovie-app.vercel.app` to authorized domains
- Go to Firebase Console → Authentication → Settings → Authorized domains

### Sign-in works but data doesn't sync
- Check Firestore security rules are published
- Check browser console for errors
- Make sure Firestore database is created

### "Missing or insufficient permissions" error
- Firestore security rules are wrong
- Copy the exact rules from Step 6 above

---

## 📁 Local Development

For local development, create a `.env` file in your project root:

```bash
# Copy from .env.example and fill in your values
cp .env.example .env
```

Then add your Firebase config values to `.env`:

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=scanmovie-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=scanmovie-app
VITE_FIREBASE_STORAGE_BUCKET=scanmovie-app.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123
```

> ⚠️ Never commit `.env` to git! It's already in `.gitignore`

---

## 🎯 Summary Checklist

- [ ] Created Firebase project
- [ ] Registered web app and copied config
- [ ] Enabled Google Sign-in provider
- [ ] Added `scanmovie-app.vercel.app` to authorized domains
- [ ] Created Firestore database
- [ ] Published Firestore security rules
- [ ] Added 6 environment variables to Vercel
- [ ] Redeployed the app
- [ ] Tested sign-in and cloud sync

---

## 🔐 Security Notes

1. **API Key Exposure**: The Firebase API key is meant to be public (it's in client-side code). Security comes from:
   - Firestore security rules
   - Authorized domains in Firebase Console
   - Authentication requirements

2. **Data Privacy**: Each user can only access their own data due to security rules

3. **No Backend Needed**: Firebase handles all authentication and data securely

---

Need help? Check the [Firebase Documentation](https://firebase.google.com/docs) or open an issue on GitHub.
