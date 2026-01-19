import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("movie/:id", "routes/movie.tsx"),
  route("ai", "routes/ai.tsx"),
  route("library", "routes/library.tsx"),
  route("discover", "routes/discover.tsx"),
] satisfies RouteConfig;
