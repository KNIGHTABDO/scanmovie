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

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

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
