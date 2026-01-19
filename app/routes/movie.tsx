/**
 * Movie Route
 * ===========
 * Movie detail page for ScanMovie app.
 * Uses LiquidGlass throughout for Apple-style UI.
 */

import type { Route } from "./+types/movie";
import { MoviePage } from "~/pages/Movie";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Movie Details - ScanMovie` },
    { name: "description", content: "View movie details, cast, and similar movies with ScanMovie's cinematic Liquid Glass UI." },
  ];
}

export default function MovieRoute() {
  return <MoviePage />;
}
