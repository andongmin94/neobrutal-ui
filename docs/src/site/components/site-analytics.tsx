"use client";

import { inject } from "@vercel/analytics";
import { useEffect } from "react";

import { SITE_URL } from "@/site/lib/site";

export function SiteAnalytics() {
  useEffect(() => {
    const site = new URL(SITE_URL);
    if (!import.meta.env.PROD || location.hostname !== site.hostname || navigator.webdriver) {
      return;
    }

    inject({
      mode: "production",
      debug: false,
      beforeSend(event) {
        if (event.type !== "pageview") return null;
        const url = new URL(event.url);
        if (url.origin !== site.origin) return null;
        url.search = "";
        url.hash = "";
        return { ...event, url: url.href };
      },
    });
  }, []);

  return null;
}
