import { useState } from "react";
import { createRoot } from "react-dom/client";
import BlogTemplate from "@/components/templates/blog-template";
import LinkHubTemplate from "@/components/templates/link-hub-template";
import type { BlogPost } from "@/lib/blog-posts";
import type { LinkHubLink, LinkHubProfile } from "@/lib/link-hub-data";
import "../../src/styling/globals.css";

const posts: readonly BlogPost[] = [
  {
    slug: "all-note",
    title: "Consumer all topic",
    summary: "An article whose actual topic is All.",
    topic: "All",
    publishedAt: "2025-01-01",
    publishedLabel: "Jan 1",
    readTime: "2 min",
    intro: "First note.",
    sections: [],
  },
  {
    slug: "research-note",
    title: "Consumer research note",
    summary: "A newer article from the application.",
    topic: "Research",
    publishedAt: "2026-01-01",
    publishedLabel: "Jan 1",
    readTime: "4 min",
    intro: "Second note.",
    sections: [],
  },
];
const updatedPosts: readonly BlogPost[] = [
  { ...posts[0], slug: "updated-note", title: "Updated application post", topic: "Release" },
];
const profile: LinkHubProfile = {
  name: "Mina Park",
  initials: "MP",
  handle: "@mina",
  bio: "Research notes from our application.",
  email: "mina+docs@example.org",
};
const links: readonly LinkHubLink[] = [
  { id: "guide", group: "All", title: "Consumer guide", detail: "Read the guide", href: "/guide" },
  {
    id: "research",
    group: "Research",
    title: "Consumer library",
    detail: "Research resources",
    href: "https://research.example.org",
    external: true,
    icon: "writing",
  },
];

function TemplateDataFixture() {
  const [updated, setUpdated] = useState(false);
  const [empty, setEmpty] = useState(false);
  const currentProfile = updated
    ? { ...profile, name: "Jae Kim", initials: "JK", email: "jae@example.org" }
    : profile;

  return (
    <>
      <button type="button" onClick={() => setUpdated(true)}>
        Load updated data
      </button>
      <button type="button" onClick={() => setEmpty(true)}>
        Clear data
      </button>
      <section aria-label="Consumer blog">
        <BlogTemplate posts={empty ? [] : updated ? updatedPosts : posts} basePath="/journal" />
      </section>
      <section aria-label="Consumer link hub">
        <LinkHubTemplate
          profile={{ ...currentProfile, email: empty ? undefined : currentProfile.email }}
          links={
            empty
              ? []
              : updated
                ? [
                    {
                      ...links[0],
                      id: "community",
                      title: "Community",
                      group: "Community",
                      href: "/community",
                    },
                  ]
                : links
          }
        />
      </section>
    </>
  );
}

createRoot(document.getElementById("root")!).render(<TemplateDataFixture />);
