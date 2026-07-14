"use client";

import { ArrowUpRight, Clock3, FileText, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BLOG_POSTS } from "@/lib/blog-posts";

const TEMPLATE_THEME =
  "[color-scheme:light] [--background:#fff5cc] [--secondary-background:#fff] [--foreground:#000] [--main-foreground:#000] [--main:#ffbe00] [--border:#000] [--ring:#000] [--box-shadow-x:0px] [--box-shadow-y:4px] [--reverse-box-shadow-x:0px] [--reverse-box-shadow-y:-4px] [--shadow:0px_4px_0px_0px_var(--border)] [--border-radius:10px] [--base-font-weight:500] [--heading-font-weight:700] dark:[color-scheme:dark] dark:[--background:#2c304c] dark:[--secondary-background:#222] dark:[--foreground:#ececec] dark:[--main:#ffbe00] dark:[--ring:#fff]";

type BlogTemplateProps = {
  basePath?: string;
};

function getPostHref(basePath: string, slug: string) {
  return `${basePath.replace(/\/$/, "")}/${slug}`;
}

export default function BlogTemplate({ basePath = "/blog" }: BlogTemplateProps) {
  const [query, setQuery] = useState("");

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return BLOG_POSTS;

    return BLOG_POSTS.filter((post) =>
      [post.title, post.summary, post.topic].join(" ").toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  return (
    <div
      id="top"
      className={`flex min-h-dvh flex-col bg-background text-foreground ${TEMPLATE_THEME}`}
    >
      <header className="border-b-2 border-border bg-secondary-background">
        <div className="mx-auto flex h-12 max-w-3xl items-center justify-between px-4 sm:px-6">
          <a href="#top" className="flex items-center gap-2 font-heading" aria-label="Worklog home">
            <span className="grid size-7 place-items-center rounded-base border-2 border-border bg-main text-main-foreground shadow-shadow">
              <FileText aria-hidden="true" className="size-3.5" />
            </span>
            <span className="text-sm">WORKLOG</span>
          </a>

          <nav
            className="flex items-center gap-3 text-xs font-heading"
            aria-label="Primary navigation"
          >
            <a className="underline-offset-4 hover:underline" href="#posts">
              Posts
            </a>
            <a className="underline-offset-4 hover:underline" href="#post-search">
              Search
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <section aria-labelledby="page-title">
          <h1 id="page-title" className="text-3xl leading-tight font-heading sm:text-4xl">
            Latest posts
          </h1>

          <search className="mt-4">
            <label className="sr-only" htmlFor="post-search">
              Search posts
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              />
              <Input
                id="post-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search posts..."
                className="h-11 bg-secondary-background pr-11 pl-10"
              />
              {query ? (
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  className="absolute top-1/2 right-2 -translate-y-1/2"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  title="Clear search"
                >
                  <X aria-hidden="true" />
                </Button>
              ) : null}
            </div>
            <p className="sr-only" aria-live="polite">
              {query
                ? `${filteredPosts.length} ${filteredPosts.length === 1 ? "result" : "results"}`
                : ""}
            </p>
          </search>
        </section>

        <section id="posts" className="mt-4 scroll-mt-4" aria-label="Post archive">
          {filteredPosts.length > 0 ? (
            <ol className="overflow-hidden rounded-base border-2 border-border bg-secondary-background shadow-shadow">
              {filteredPosts.map((post) => (
                <li key={post.slug} className="border-b-2 border-border last:border-b-0">
                  <article className="grid grid-cols-[minmax(0,1fr)_2.25rem] gap-x-3 gap-y-2 p-4 sm:grid-cols-[6rem_minmax(0,1fr)_2.25rem] sm:items-center sm:gap-4 sm:p-5">
                    <time
                      className="col-span-2 text-xs font-heading text-foreground/60 sm:col-span-1"
                      dateTime={post.publishedAt}
                    >
                      {post.publishedLabel}
                    </time>

                    <div className="min-w-0">
                      <h2 className="text-lg leading-snug font-heading sm:text-xl">
                        <a
                          className="underline-offset-4 hover:underline"
                          href={getPostHref(basePath, post.slug)}
                        >
                          {post.title}
                        </a>
                      </h2>
                      <p className="mt-1 text-sm leading-5 text-foreground/70">{post.summary}</p>
                      <p className="mt-2 flex items-center gap-3 text-xs font-heading text-foreground/60">
                        <span>{post.topic}</span>
                        <span className="flex items-center gap-1">
                          <Clock3 aria-hidden="true" className="size-3.5" />
                          {post.readTime}
                        </span>
                      </p>
                    </div>

                    <Button
                      asChild
                      nativeButton={false}
                      size="icon-sm"
                      variant="ghost"
                      className="self-center"
                    >
                      <a
                        href={getPostHref(basePath, post.slug)}
                        aria-label={`Read ${post.title}`}
                        title={`Read ${post.title}`}
                      >
                        <ArrowUpRight aria-hidden="true" />
                      </a>
                    </Button>
                  </article>
                </li>
              ))}
            </ol>
          ) : (
            <p className="py-10 text-center text-sm text-foreground/60">No posts found.</p>
          )}
        </section>
      </main>

      <footer className="border-t-2 border-border bg-secondary-background">
        <div className="mx-auto max-w-3xl px-4 py-4 text-xs sm:px-6">
          <p className="font-heading">WORKLOG / 2026</p>
        </div>
      </footer>
    </div>
  );
}
