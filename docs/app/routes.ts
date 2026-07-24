import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("api/search", "routes/search.ts"),
  route("sitemap.xml", "routes/sitemap.ts"),
  route("*", "routes/page.tsx"),
] satisfies RouteConfig;
