import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from "next/constants.js";

export default async function createNextConfig(phase) {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  const isBuild = phase === PHASE_PRODUCTION_BUILD;

  if (!process.env.VELITE_STARTED && (isDev || isBuild)) {
    process.env.VELITE_STARTED = "1";
    const { build } = await import("velite");
    await build({ watch: isDev, clean: !isDev });
  }

  /** @type {import('next').NextConfig} */
  const nextConfig = {
    allowedDevOrigins: ["127.0.0.1"],
    async redirects() {
      return [
        {
          source: "/components/:slug*",
          destination: "/docs/:slug*",
          permanent: !isDev,
        },
        {
          source: "/docs/migrating-from-v3",
          destination: "/docs/installation",
          permanent: !isDev,
        },
        {
          source: "/docs/figma",
          destination: "/docs/design-tokens",
          permanent: !isDev,
        },
        {
          source: "/docs/changelog",
          destination: "/docs/credits",
          permanent: !isDev,
        },
        {
          source: "/showcase",
          destination: "/docs",
          permanent: !isDev,
        },
      ];
    },
    async rewrites() {
      return [
        {
          source: "/ingest/static/:path*",
          destination: "https://eu-assets.i.posthog.com/static/:path*",
        },
        {
          source: "/ingest/:path*",
          destination: "https://eu.i.posthog.com/:path*",
        },
        {
          source: "/ingest/decide",
          destination: "https://eu.i.posthog.com/decide",
        },
      ];
    },
    // This is required to support PostHog trailing slash API requests
    skipTrailingSlashRedirect: true,
  };

  return nextConfig;
}
