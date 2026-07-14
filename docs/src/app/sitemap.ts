import { docs } from "@docs";
import { MetadataRoute } from "next";

import TEMPLATES from "@/data/templates";

const root = process.env.NEXT_PUBLIC_DOCS_BASE_URL || "https://neobrutal-ui.andongmin.com";

const SITE_PAGES = ["/templates", "/showcase", "/stars", "/styling", "/charts"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: root,
      lastModified: new Date(),
      priority: 1,
    },
    ...SITE_PAGES.map((page) => ({
      url: root + page,
      lastModified: new Date(),
      priority: 1,
    })),
    ...TEMPLATES.map(({ slug }) => ({
      url: `${root}/templates/${slug}`,
      lastModified: new Date(),
      priority: 0.8,
    })),
    ...docs.map((doc) => ({
      url: root + (doc.slugAsParams ? `/docs/${doc.slugAsParams}` : "/docs"),
      lastModified: new Date(),
      priority: doc.slug.startsWith("components/") ? 0.8 : 1,
    })),
  ];
}
