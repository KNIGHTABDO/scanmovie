import { Discover } from "~/pages/Discover";
import type { Route } from "./+types/discover";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Discover Movies - ScanMovie" },
    { name: "description", content: "Random movie picker and mood-based discovery" },
  ];
}

export default function DiscoverRoute() {
  return <Discover />;
}
