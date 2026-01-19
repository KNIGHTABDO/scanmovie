import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("movie/:id", "routes/movie.tsx"),
  route("person/:id", "routes/person.tsx"),
  route("ai", "routes/ai.tsx"),
  route("library", "routes/library.tsx"),
  route("discover", "routes/discover.tsx"),
  route("watch-party", "routes/watch-party.tsx"),
  route("create-party", "routes/create-party.tsx"),
] satisfies RouteConfig;
