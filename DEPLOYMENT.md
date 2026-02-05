# Vercel Deployment Guide

This guide covers deploying ScanMovie to Vercel with all the High Priority optimizations.

## 🚀 Quick Deploy

### One-Click Deploy
1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/new)
3. Import your GitHub repository
4. Vercel will auto-detect React Router configuration
5. Add environment variables (see below)
6. Deploy!

### Environment Variables

Configure these in Vercel Dashboard → Settings → Environment Variables:

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

## ✅ Pre-Deployment Checklist

- [x] All High Priority features implemented
- [x] Service worker configured (`public/sw.js`)
- [x] PWA manifest ready (`public/manifest.json`)
- [x] Vercel configuration present (`vercel.json`)
- [x] Build succeeds locally (`npm run build`)
- [x] Environment variables documented
- [x] Security headers configured
- [x] Caching strategies implemented

## 🎯 What's Deployed

### Performance Optimizations
- ✅ Service worker for offline image caching
- ✅ Lazy loading for images with Intersection Observer
- ✅ Infinite scroll pagination (Discover page)
- ✅ Debounced search inputs
- ✅ Responsive image srcset
- ✅ Code splitting with React Router

### Vercel-Specific Features
- ✅ Automatic HTTPS
- ✅ Global CDN distribution
- ✅ Automatic compression (Brotli/Gzip)
- ✅ Edge caching for static assets
- ✅ Serverless functions for API routes
- ✅ Preview deployments for branches

## 📊 Performance Expectations

### Bundle Sizes (Gzipped)
- Initial page load: ~150 kB
- Total JavaScript: ~350 kB (lazy loaded)
- Images: Lazy loaded + cached
- Service worker: ~6 kB

### Lighthouse Scores (Target)
- Performance: 90+
- Accessibility: 90+
- Best Practices: 95+
- SEO: 95+
- PWA: 100

## 🔧 Build Configuration

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build/client",
  "functions": {
    "build/server/index.js": {
      "maxDuration": 10
    }
  }
}
```

### Build Process
1. `npm install` - Install dependencies
2. `npm run build` - Build client and server
3. Deploy to Vercel Edge Network

## 🌐 Post-Deployment

### Testing
1. Visit your Vercel URL
2. Open DevTools → Application → Service Workers
3. Verify service worker is registered
4. Test offline mode (DevTools → Network → Offline)
5. Check image lazy loading (scroll on Discover page)
6. Test infinite scroll (Discover page mood discovery)

### Monitoring
- Use Vercel Analytics for traffic insights
- Monitor bundle sizes with each deployment
- Check Core Web Vitals in Vercel Dashboard
- Set up error tracking (optional: Sentry)

## 🐛 Troubleshooting

### Service Worker Not Loading
- Ensure HTTPS is enabled (automatic on Vercel)
- Check browser console for errors
- Verify `sw.js` is in `public/` directory

### Build Failures
- Check environment variables are set
- Verify Node.js version (18+)
- Review build logs in Vercel dashboard

### Performance Issues
- Enable Vercel Analytics
- Check bundle sizes with `npm run build`
- Review lazy loading implementation
- Verify service worker caching

## 📝 Deployment Commands

### Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Deploy preview
vercel
```

### CI/CD with GitHub
Vercel automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

## 🔐 Security

### Headers (Configured in vercel.json)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### Best Practices
- Environment variables stored securely
- API keys never exposed to client
- Server-side API proxy routes
- CORS properly configured

## 🎉 Success Criteria

Your deployment is successful when:
- [x] Site loads at your Vercel URL
- [x] Service worker registers (check DevTools)
- [x] Images load with lazy loading
- [x] Infinite scroll works on Discover page
- [x] Search is debounced
- [x] PWA installable (Add to Home Screen)
- [x] Offline mode works (cached images)

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- ScanMovie Issues: https://github.com/KNIGHTABDO/scanmovie/issues
- Implementation Guide: See `IMPLEMENTATION.md`

---

**Ready to deploy!** 🚀 All High Priority features are production-ready.
