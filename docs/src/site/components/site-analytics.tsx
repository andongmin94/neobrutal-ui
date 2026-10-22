"use client";

import { useEffect } from "react";

import { SITE_URL } from "@/site/lib/site";

export function SiteAnalytics() {
  useEffect(() => {
    if (
      !import.meta.env.PROD ||
      location.hostname !== new URL(SITE_URL).hostname ||
      navigator.webdriver ||
      document.querySelector("script[data-cf-beacon]")
    ) {
      return;
    }

    const beacon = document.createElement("script");
    beacon.type = "module";
    beacon.src = "https://static.cloudflareinsights.com/beacon.min.js";
    beacon.dataset.cfBeacon = JSON.stringify({ token: "46a3e4b9ba064b08b6a501923ee191ee" });
    document.head.append(beacon);
  }, []);

  return null;
}
