import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("movie/:id", "routes/movie.tsx"),
  route("ai", "routes/ai.tsx"),
] satisfies RouteConfig;
