# 🎬 ScanMovie

A modern, feature-rich movie discovery and tracking application with an elegant Liquid Glass UI design. Discover trending movies, manage your watchlist, and experience cinema like never before.

[![React Router](https://img.shields.io/badge/React_Router-v7.12-CA4245?logo=react-router&logoColor=white)](https://reactrouter.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.8-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## ✨ Features

### 🎥 Movie Discovery
- **Trending Movies** - Stay up-to-date with what's popular right now
- **Now Playing** - See what's currently in theaters
- **Upcoming Releases** - Never miss an anticipated film
- **AI-Powered Search** - Find movies using natural language queries powered by OpenAI
- **Advanced Filters** - Discover movies by genre, rating, release date, and more

### 📚 Personal Library
- **Watchlist Management** - Save movies you want to watch
- **Favorites Collection** - Curate your personal favorites
- **Watch History** - Track what you've already seen
- **Cloud Sync** - Your data syncs across all devices via Firebase

### 🎉 Social Features
- **Watch Parties** - Create and join virtual movie nights with friends
- **Real-time Collaboration** - Synchronized viewing experiences
- **Party Chat** - Discuss movies while watching together

### 🎨 Beautiful UI/UX
- **Liquid Glass Design** - Stunning glassmorphism effects throughout
- **Smooth Animations** - Powered by Framer Motion for silky interactions
- **Responsive Design** - Perfect experience on mobile, tablet, and desktop
- **Dark Mode** - Easy on the eyes in any lighting condition

### 🏆 Gamification
- **Achievements System** - Unlock badges as you explore
- **Statistics Dashboard** - Track your viewing patterns and preferences
- **Progress Tracking** - Monitor your movie-watching journey

### 🔐 Authentication & Security
- **Google Sign-In** - Secure authentication via Firebase
- **User Profiles** - Personalized experience for each user
- **Data Privacy** - Your data is yours, protected by Firestore security rules

---

## 🚀 Technology Stack

### Frontend
- **[React 19](https://react.dev/)** - Modern UI library with concurrent features
- **[React Router 7](https://reactrouter.com/)** - Full-stack web framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first styling
- **[Framer Motion](https://www.framer.com/motion/)** - Production-ready animations
- **[Liquid Glass React](https://www.npmjs.com/package/liquid-glass-react)** - Glassmorphism effects

### Backend & Services
- **[Firebase Authentication](https://firebase.google.com/products/auth)** - User authentication
- **[Cloud Firestore](https://firebase.google.com/products/firestore)** - Cloud database
- **[OpenAI API](https://openai.com/)** - AI-powered movie search
- **[TMDB API](https://www.themoviedb.org/)** - Comprehensive movie data

### Build & Development
- **[Vite 7](https://vitejs.dev/)** - Lightning-fast build tool
- **Server-Side Rendering** - Optimal performance and SEO
- **Hot Module Replacement** - Instant feedback during development
- **Docker Support** - Containerized deployment ready

---

## 📦 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **pnpm**
- **Firebase Account** (for authentication and cloud sync)
- **TMDB API Key** (for movie data)
- **OpenAI API Key** (optional, for AI search features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KNIGHTABDO/scanmovie.git
   cd scanmovie
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   # API Keys
   VITE_TMDB_API_KEY=your_tmdb_api_key
   VITE_OPENAI_API_KEY=your_openai_api_key
   ```

   > 📖 **Need help with Firebase setup?** See our detailed [Firebase Setup Guide](FIREBASE_SETUP.md)

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at **http://localhost:5173**

### Type Checking

Run TypeScript type checking:

```bash
npm run typecheck
```

---

## 🏗️ Building for Production

Create an optimized production build:

```bash
npm run build
```

The build outputs to:
```
build/
├── client/    # Static assets (HTML, CSS, JS)
└── server/    # Server-side code
```

### Running in Production

```bash
npm start
```

---

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t scanmovie .
```

### Run Container

```bash
docker run -p 3000:3000 scanmovie
```

### Deployment Platforms

The containerized application can be deployed to:

- **AWS ECS** - Elastic Container Service
- **Google Cloud Run** - Serverless container platform
- **Azure Container Apps** - Fully managed container service
- **Digital Ocean App Platform** - Simple container hosting
- **Fly.io** - Global application platform
- **Railway** - Infrastructure made simple
- **Vercel** - Recommended for Next.js/React Router apps

---

## 🔧 Configuration

### Firebase Setup

This application requires Firebase for authentication and data storage. Follow our comprehensive [Firebase Setup Guide](FIREBASE_SETUP.md) for step-by-step instructions.

**Key Firebase Services Used:**
- Firebase Authentication (Google Sign-In)
- Cloud Firestore (User data storage)
- Firestore Security Rules (Data protection)

### API Keys

**TMDB (The Movie Database)**
1. Sign up at [themoviedb.org](https://www.themoviedb.org/)
2. Request an API key in your account settings
3. Add to your `.env` file

**OpenAI (Optional)**
1. Create an account at [openai.com](https://openai.com/)
2. Generate an API key in your dashboard
3. Add to your `.env` file for AI search features

---

## 📂 Project Structure

```
scanmovie/
├── app/
│   ├── components/       # Reusable UI components
│   ├── contexts/         # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── routes/           # Route handlers
│   ├── services/         # API services & utilities
│   └── styles/           # Global styles
├── public/               # Static assets
├── build/                # Production build output
├── Dockerfile            # Docker configuration
├── FIREBASE_SETUP.md     # Firebase setup guide
└── package.json          # Dependencies & scripts
```

---

## 📋 TODO & Roadmap

### 🔴 Critical Priority (Security & Stability)

- [x] **Move TMDB API Key to Server-Side** - ~~Currently hardcoded in client, should be proxied through backend~~ **DONE:** Implemented server-side API proxy routes
- [x] **Secure AI API Calls** - ~~Remove `dangerouslyAllowBrowser: true` and proxy GitHub Models API through backend~~ **DONE:** AI calls now go through secure server-side proxy
- [x] **Complete ScanMovie Import Feature** - ~~Import callback is not implemented in `ExportImportModal.tsx`~~ **DONE:** Fully implemented import with progress tracking
- [x] **Add React Error Boundaries** - ~~Implement error boundaries to gracefully handle crashes~~ **DONE:** Enhanced root error boundary with custom styling
- [x] **Implement Rate Limiting** - ~~Add protection against API abuse and excessive requests~~ **DONE:** Client-side rate limiting and throttling utilities
- [x] **Add Input Validation & Sanitization** - ~~Sanitize all user inputs before processing (AI queries, search terms)~~ **DONE:** Comprehensive validation service with sanitization
- [x] **Environment Variables Validation** - ~~Add startup checks to ensure all required env vars are configured~~ **DONE:** Startup validation in root component

### 🟡 High Priority (Features & UX)

#### Performance & Optimization
- [x] **Implement Image Caching Strategy** - ~~Add service worker for offline image caching~~ **DONE:** Service worker with LRU cache implemented
- [x] **Lazy Load Components** - ~~Code-split routes and heavy components for faster initial load~~ **DONE:** Lazy loading utility created
- [x] **Add Pagination UI** - ~~Implement infinite scroll or pagination for Discover page~~ **DONE:** Infinite scroll with Intersection Observer
- [x] **Optimize Images** - ~~Support WebP/AVIF formats with responsive srcset~~ **DONE:** OptimizedImage component with lazy loading
- [x] **Request Debouncing** - ~~Add debouncing for search and filter inputs~~ **DONE:** Debouncing hooks created and applied
- [x] **Bundle Size Optimization** - ~~Analyze and reduce bundle size (check liquid-glass-react impact)~~ **DONE:** Analysis complete, optimization strategies documented

#### Core Features
- [ ] **Personalized Recommendations** - Build "For You" feed based on watch history and ratings
- [ ] **Search History** - Persist and display recent searches for better UX
- [ ] **Streaming Availability** - Complete integration of `StreamingAvailability.tsx` component
- [ ] **Real-time Watch Party Sync** - Implement synchronized playback and live updates
- [ ] **User Reviews System** - Allow users to write detailed reviews (not just ratings)
- [ ] **Advanced Discovery Filters**:
  - Date range filters (release date, added to watchlist)
  - Budget and revenue filters
  - Original language filter
  - Runtime range filter
  - Certification/rating filter (G, PG, R, etc.)

#### Social Features
- [ ] **User Profiles** - Public user profiles with stats and favorite movies
- [ ] **Follow System** - Follow friends and see their activity
- [ ] **Activity Feed** - Real-time feed of friends' ratings, reviews, and watchlist additions
- [ ] **Collaborative Lists** - Shared lists that multiple users can edit
- [ ] **Movie Ratings Comparison** - Compare your ratings with friends
- [ ] **Email/SMS Watch Party Invites** - Alternative to link-only sharing
- [ ] **Watch Party History** - Keep track of past watch parties

#### UI/UX Enhancements
- [ ] **Loading Skeletons** - Add skeleton screens for all async data loading
- [ ] **Toast Notifications** - Real-time notifications for achievements, party updates
- [ ] **Accessibility Improvements**:
  - Add ARIA labels throughout the app
  - Improve keyboard navigation
  - Add screen reader support
  - Ensure color contrast meets WCAG standards
- [ ] **Onboarding Flow** - Guided tour for new users
- [ ] **Empty States** - Better empty state designs for lists, search results
- [ ] **Advanced Voice Input** - Expand `useVoiceInput` hook integration across the app

### 🟢 Medium Priority (Quality & Developer Experience)

#### Testing & Quality
- [ ] **Add Unit Tests** - Jest + React Testing Library for components
- [ ] **Add Integration Tests** - Test critical user flows (login, add to watchlist, etc.)
- [ ] **Add E2E Tests** - Playwright/Cypress for end-to-end testing
- [ ] **Setup CI/CD Pipeline** - Automated testing and deployment
- [ ] **Code Coverage Reports** - Aim for >80% coverage on critical paths
- [ ] **TypeScript Strict Mode** - Remove `as any` type coercions, enable strict checks
- [ ] **Implement Logging Service** - Replace console statements with centralized logging
- [ ] **Add Monitoring & Analytics** - Track errors and user behavior (Sentry, Mixpanel)

#### Developer Experience
- [ ] **API Response Caching** - Implement caching layer for TMDB API responses
- [ ] **Add Storybook** - Component library documentation and visual testing
- [ ] **Setup ESLint & Prettier** - Enforce code style consistency
- [ ] **Improve Error Handling** - Standardize error handling across services
- [ ] **Add JSDoc Comments** - Document complex functions and components
- [ ] **Setup Pre-commit Hooks** - Husky + lint-staged for quality gates

### 🔵 Low Priority (Nice to Have)

#### Additional Features
- [ ] **Custom Movie Lists** - User-curated thematic lists (Top 10, By Decade, By Director)
- [ ] **Movie Trivia** - Fun facts and trivia for each movie
- [ ] **Similar Users** - Discover users with similar taste
- [ ] **Export to Other Services** - Export watchlist to Letterboxd, IMDb, Trakt
- [ ] **Browser Extension** - Quick-add movies from TMDB/IMDb pages
- [ ] **Mobile Apps** - React Native apps for iOS and Android
- [ ] **Offline Mode** - Full offline support with service workers
- [ ] **Multi-language Subtitles** - Info about available subtitle languages
- [ ] **Box Office Data** - Display box office performance
- [ ] **Awards & Nominations** - Show Oscar/Golden Globe wins and nominations

#### Advanced Analytics
- [ ] **Personal Statistics Dashboard**:
  - Most-watched director/actor/genre
  - Favorite decade
  - Average movie length
  - Total watch time
  - Rating distribution
  - Mood-based viewing patterns
- [ ] **Year in Review** - Annual viewing summary (Spotify Wrapped style)
- [ ] **Predictive Ratings** - ML model to predict if you'll like a movie

#### Gamification Enhancements
- [ ] **More Achievement Badges**:
  - Genre explorer (watched 10+ movies in every genre)
  - Marathon viewer (3+ movies in one day)
  - Early bird (watched movie on release day)
  - Critic (100+ ratings submitted)
  - Social butterfly (10+ watch parties hosted)
- [ ] **Leaderboards** - Compare stats with friends
- [ ] **Streaks** - Encourage daily/weekly movie watching habits
- [ ] **Challenges** - Monthly/weekly viewing challenges

#### Content Enhancements
- [ ] **TV Shows Support** - Expand beyond movies to include TV series
- [ ] **Podcast Integration** - Link to movie-related podcasts
- [ ] **Behind the Scenes** - Production trivia, filming locations
- [ ] **Film Festival Integration** - Track festival screenings and availability
- [ ] **Indie Film Discovery** - Curated independent film recommendations

### 🛠️ Technical Debt

- [ ] **Remove Console Statements** - Clean up 30+ console.log/error statements in production
- [ ] **Fix Placeholder Images** - Commit actual placeholder images or use data URIs
- [ ] **Standardize Component Structure** - Consistent file organization and naming
- [ ] **Reduce Prop Drilling** - Consider Zustand or Jotai for state management
- [ ] **Extract Magic Numbers** - Move hardcoded values to constants
- [ ] **Deduplicate Error Handling** - Create reusable error handling utilities
- [ ] **Improve Firebase Security Rules** - Review and tighten Firestore security rules
- [ ] **Add API Response Types** - Properly type all TMDB and OpenAI responses

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

**Working on a TODO item?** Please check the TODO list above and consider tackling one of the listed improvements. Mark it as in-progress in your PR description!

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **TMDB** for providing comprehensive movie data
- **Firebase** for authentication and cloud infrastructure
- **OpenAI** for AI-powered search capabilities
- **React Router** team for the amazing framework
- **Liquid Glass React** for beautiful glassmorphism effects

---

## 📞 Support

If you encounter any issues or have questions:

- 🐛 [Report a Bug](https://github.com/KNIGHTABDO/scanmovie/issues)
- 💡 [Request a Feature](https://github.com/KNIGHTABDO/scanmovie/issues)
- 📖 [Read the Docs](FIREBASE_SETUP.md)

---

<p align="center">Built with ❤️ using React Router & Firebase</p>
