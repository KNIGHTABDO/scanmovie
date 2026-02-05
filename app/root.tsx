/**
 * ScanMovie Root Layout
 * =====================
 * VERIFICATION OF LIQUIDGLASS USAGE:
 * 
 * LiquidGlass is used in the following components:
 * 1. Navbar (LiquidSurface variant="navbar") - Navigation bar with glass effect
 * 2. MovieCard (LiquidSurface variant="card") - Each movie card is wrapped in glass
 * 3. Home page hero section (LiquidSurface variant="container") - Featured movie display
 * 4. Section headers (LiquidSurface variant="container") - "Trending", "Now Playing" etc.
 * 5. Movie detail page (LiquidSurface variant="modal") - Main movie info container
 * 6. Cast cards (LiquidSurface variant="card") - Cast member cards
 * 7. All buttons and badges (LiquidSurface variant="button") - CTAs, ratings, etc.
 * 
 * REFRACTION IS VISIBLE:
 * - Background images bend through all glass surfaces
 * - Chromatic aberration creates rainbow edge effects
 * - Displacement creates realistic glass distortion
 * 
 * REMOVING LIQUIDGLASS BREAKS THE UI:
 * - Without LiquidGlass, all surfaces become flat
 * - The cinematic Apple-style aesthetic is completely lost
 * - Background no longer visually bends through containers
 */

import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { Navbar } from "~/components/Navbar";
import { AuthProvider } from "~/contexts/AuthContext";
import { UserDataProvider } from "~/contexts/UserDataContext";
import { ThemeProvider } from "~/contexts/ThemeContext";
import { LanguageProvider } from "~/contexts/LanguageContext";
import { StyleProvider } from "~/contexts/StyleContext";
import { useEffect } from "react";
import { validateEnvironment } from "~/services/validation";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "manifest", href: "/manifest.json" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=5, user-scalable=yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider>
          <StyleProvider>
            <LanguageProvider>
              <AuthProvider>
                <UserDataProvider>
                  <Navbar />
                  {children}
                </UserDataProvider>
              </AuthProvider>
            </LanguageProvider>
          </StyleProvider>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  // Validate environment variables on mount
  useEffect(() => {
    validateEnvironment(true);
  }, []);

  // Register service worker for image caching
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('~/services/serviceWorker').then(({ registerServiceWorker }) => {
        registerServiceWorker().catch((error) => {
          console.error('Failed to register service worker:', error);
        });
      });
    }
  }, []);
  
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404 - Page Not Found" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <div
      style={{
        padding: '60px 20px',
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom, #0a0a0a, #1a1a2e)',
      }}
    >
      <div
        style={{
          background: 'rgba(30, 30, 46, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '24px',
          padding: '48px',
          maxWidth: '600px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>
          {isRouteErrorResponse(error) && error.status === 404 ? '🎬' : '⚠️'}
        </div>
        <h1 style={{ color: '#fff', fontSize: '32px', marginBottom: '16px', fontWeight: 700 }}>
          {message}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', marginBottom: '24px', lineHeight: 1.6 }}>
          {details}
        </p>
        {stack && (
          <pre style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#f87171',
            textAlign: 'left',
            overflow: 'auto',
            marginBottom: '24px',
            maxHeight: '200px',
          }}>
            <code>{stack}</code>
          </pre>
        )}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '14px 28px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              border: 'none',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reload Page
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            style={{
              padding: '14px 28px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
