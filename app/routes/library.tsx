import { Library } from "~/pages/Library";
import type { Route } from "./+types/library";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Library - ScanMovie" },
    { name: "description", content: "Your personal movie collection - watchlist, favorites, ratings and more" },
  ];
}

export default function LibraryRoute() {
  return <Library />;
}
