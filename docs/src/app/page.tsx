import { docs } from "@docs";
import type { Metadata } from "next";

import DirectoryHome, { type DirectoryEntry } from "@/components/app/directory-home";
import { getComponentCategory, getComponentInstallMode } from "@/data/component-directory";

export const metadata: Metadata = {
  title: "Component directory",
  description: "Browse 47 neobrutalist components for the shadcn registry and Base UI.",
};

export default function Home() {
  const entries: DirectoryEntry[] = docs
    .filter((doc) => doc.slug.startsWith("components/"))
    .map((doc) => ({
      category: getComponentCategory(doc.slugAsParams),
      description: doc.description,
      href: `/docs/${doc.slugAsParams}`,
      installMode: getComponentInstallMode(doc.slugAsParams),
      name: doc.title,
      slug: doc.slugAsParams,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return <DirectoryHome entries={entries} />;
}
