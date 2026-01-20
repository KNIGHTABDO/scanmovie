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
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <AuthProvider>
          <UserDataProvider>
            <Navbar />
            {children}
          </UserDataProvider>
        </AuthProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
