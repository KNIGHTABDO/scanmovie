/**
 * Home Route
 * ==========
 * Main entry point for ScanMovie app.
 * Uses LiquidGlass throughout for Apple-style UI.
 */

import type { Route } from "./+types/home";
import { Home } from "~/pages/Home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ScanMovie - Discover Movies" },
    { name: "description", content: "Discover trending movies, new releases, and more with ScanMovie's cinematic Liquid Glass UI." },
  ];
}

export default function HomePage() {
  return <Home />;
}
