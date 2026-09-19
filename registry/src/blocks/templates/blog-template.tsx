"use client";

import { ArrowUpRight, Clock3, FileText, Search, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Input } from "@/components/ui/input";
import { BLOG_POSTS } from "@/lib/blog-posts";

const TOPICS = ["All", ...new Set(BLOG_POSTS.map((post) => post.topic))];

type BlogTemplateProps = {
  basePath?: string;
};

function getPostHref(basePath: string, slug: string) {
  return `${basePath.replace(/\/$/, "")}/${slug}`;
}

export default function BlogTemplate({ basePath = "/blog" }: BlogTemplateProps) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("All");
  const [sort, setSort] = useState("newest");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return BLOG_POSTS.filter(
      (post) =>
        (topic === "All" || post.topic === topic) &&
        [post.title, post.summary, post.topic].join(" ").toLowerCase().includes(normalizedQuery),
    ).sort((a, b) => {
      if (sort === "shortest")
        return Number.parseInt(a.readTime, 10) - Number.parseInt(b.readTime, 10);
      return sort === "oldest"
        ? a.publishedAt.localeCompare(b.publishedAt)
        : b.publishedAt.localeCompare(a.publishedAt);
    });
  }, [query, topic, sort]);

  return (
    <div id="top" className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="border-b-2 border-border bg-secondary-background">
        <div className="mx-auto flex h-12 max-w-3xl items-center justify-between px-4 sm:px-6">
          <a
            href="#top"
            className="group flex items-center gap-2 font-heading"
            aria-label="Worklog home"
          >
            <span className="grid size-7 place-items-center rounded-base border-2 border-border bg-main text-main-foreground shadow-shadow transition-[translate,box-shadow] duration-[140ms] ease-[ease] motion-reduce:transition-none group-hover:translate-x-pressX group-hover:translate-y-pressY group-hover:shadow-press group-focus-visible:translate-x-pressX group-focus-visible:translate-y-pressY group-focus-visible:shadow-press group-active:translate-x-boxShadowX group-active:translate-y-boxShadowY group-active:shadow-[0_0_0_0_var(--border)]">
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
          <p className="mb-3 font-mono text-xs uppercase tracking-widest">
            Field notes / Design & engineering
          </p>
          <h1 id="page-title" className="text-3xl leading-tight font-heading sm:text-4xl">
            Latest posts
          </h1>

          <p className="mt-3 max-w-lg text-sm leading-6 text-foreground/75">
            Ideas from the workbench. Practical notes on building products that stay useful.
          </p>
          <search className="mt-6">
            <label className="sr-only" htmlFor="post-search">
              Search posts
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              />
              {/* Keep one explicit clear action instead of browser-specific search controls. */}
              <Input
                ref={searchInputRef}
                id="post-search"
                type="text"
                role="searchbox"
                enterKeyHint="search"
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
                  onClick={() => {
                    setQuery("");
                    searchInputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  title="Clear search"
                >
                  <X aria-hidden="true" />
                </Button>
              ) : null}
            </div>
          </search>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div role="group" aria-label="Filter posts by topic" className="flex flex-wrap gap-2">
              {TOPICS.map((item) => (
                <Button
                  key={item}
                  type="button"
                  size="sm"
                  variant={topic === item ? "default" : "neutral"}
                  aria-pressed={topic === item}
                  onClick={() => setTopic(item)}
                >
                  {item}
                </Button>
              ))}
            </div>
            <label className="grid gap-1 text-xs font-heading">
              Sort posts
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="min-h-10 rounded-base border-2 border-border bg-secondary-background px-3 text-sm text-foreground"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="shortest">Shortest read</option>
              </select>
            </label>
          </div>
          <p role="status" className="mt-4 text-xs text-foreground/70">
            {filteredPosts.length} {filteredPosts.length === 1 ? "post" : "posts"}
            {topic === "All" ? " across all topics" : ` in ${topic}`}
          </p>
        </section>

        <section id="posts" className="mt-4 scroll-mt-4" aria-label="Post archive">
          {filteredPosts.length > 0 ? (
            <ol className="overflow-hidden rounded-base border-2 border-border bg-secondary-background shadow-shadow">
              {filteredPosts.map((post, index) => (
                <li key={post.slug} className="border-b-2 border-border last:border-b-0">
                  <article className="grid grid-cols-[minmax(0,1fr)_2.25rem] gap-x-3 gap-y-2 p-4 sm:grid-cols-[6rem_minmax(0,1fr)_2.25rem] sm:items-center sm:gap-4 sm:p-5">
                    <time
                      className="col-span-2 text-xs font-heading text-foreground/60 sm:col-span-1"
                      dateTime={post.publishedAt}
                    >
                      {post.publishedLabel}
                    </time>

                    <div className="min-w-0">
                      {index === 0 && !query && topic === "All" && sort === "newest" ? (
                        <span className="mb-2 inline-block bg-main px-2 py-1 text-xs font-heading text-main-foreground">
                          Editor's pick
                        </span>
                      ) : null}
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

                    <a
                      href={getPostHref(basePath, post.slug)}
                      aria-label={`Read ${post.title}`}
                      title={`Read ${post.title}`}
                      className={buttonVariants({
                        size: "icon-sm",
                        variant: "ghost",
                        className: "self-center",
                      })}
                    >
                      <ArrowUpRight aria-hidden="true" />
                    </a>
                  </article>
                </li>
              ))}
            </ol>
          ) : (
            <div className="grid justify-items-center gap-4 border-2 border-dashed border-border py-10">
              <p className="text-sm text-foreground/70">No posts found.</p>
              <Button
                type="button"
                variant="neutral"
                onClick={() => {
                  setTopic("All");
                  setQuery("");
                  searchInputRef.current?.focus();
                }}
              >
                Reset filters
              </Button>
            </div>
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
