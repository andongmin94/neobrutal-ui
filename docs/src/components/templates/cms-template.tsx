"use client";

import { Plus, Save, Search } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const TEMPLATE_THEME =
  "[color-scheme:light] [--background:#e7e8ff] [--secondary-background:#fff] [--foreground:#000] [--main-foreground:#000] [--main:#7983ff] [--border:#000] [--ring:#000] [--box-shadow-x:4px] [--box-shadow-y:4px] [--reverse-box-shadow-x:-4px] [--reverse-box-shadow-y:-4px] [--shadow:4px_4px_0px_0px_var(--border)] [--border-radius:5px] [--base-font-weight:600] [--heading-font-weight:700] dark:[color-scheme:dark] dark:[--background:#2c304c] dark:[--secondary-background:#222] dark:[--foreground:#ececec] dark:[--main:#7983ff] dark:[--ring:#fff]";

type PostStatus = "draft" | "published";
type StatusFilter = "all" | PostStatus;

type Post = {
  dirty: boolean;
  id: string;
  status: PostStatus;
  summary: string;
  title: string;
  updatedAt: string;
};

const INITIAL_POSTS: Post[] = [
  {
    dirty: false,
    id: "post-105",
    status: "published",
    summary: "Highlights from the latest workspace release.",
    title: "July product update",
    updatedAt: "12 min",
  },
  {
    dirty: false,
    id: "post-104",
    status: "draft",
    summary: "A practical structure for growing teams.",
    title: "Organize your first team space",
    updatedAt: "38 min",
  },
  {
    dirty: false,
    id: "post-103",
    status: "published",
    summary: "How Verdant Studio simplified editorial review.",
    title: "A faster review process",
    updatedAt: "2 hr",
  },
  {
    dirty: false,
    id: "post-102",
    status: "draft",
    summary: "Final ownership, access, and link checks.",
    title: "Public page checklist",
    updatedAt: "Yesterday",
  },
  {
    dirty: false,
    id: "post-101",
    status: "published",
    summary: "Set routing rules and keep requests visible.",
    title: "Shared inbox routing",
    updatedAt: "Jul 11",
  },
];

const STATUS_TABS: Array<{ label: string; value: StatusFilter }> = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
];

function getPostTitle(post: Post) {
  return post.title.trim() || "Untitled post";
}

function PostStatusBadge({ status }: { status: PostStatus }) {
  return (
    <Badge variant={status === "published" ? "default" : "neutral"} className="justify-self-start">
      {status === "published" ? "Published" : "Draft"}
    </Badge>
  );
}

export default function CmsTemplate() {
  const [posts, setPosts] = React.useState<Post[]>(INITIAL_POSTS);
  const [query, setQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState(INITIAL_POSTS[0].id);
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");

  const nextPostId = React.useRef(106);
  const titleInputRef = React.useRef<HTMLInputElement>(null);

  const selectedPost = posts.find((post) => post.id === selectedId);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredPosts = React.useMemo(
    () =>
      posts.filter((post) => {
        const matchesStatus = statusFilter === "all" || post.status === statusFilter;
        const searchText = (post.title + " " + post.summary).toLowerCase();
        return matchesStatus && searchText.includes(normalizedQuery);
      }),
    [normalizedQuery, posts, statusFilter],
  );

  const handleFilterChange = (value: string) => {
    if (value === "all" || value === "draft" || value === "published") {
      setStatusFilter(value);
    }
  };

  const updateSelected = (changes: Partial<Pick<Post, "status" | "summary" | "title">>) => {
    setPosts((current) =>
      current.map((post) => (post.id === selectedId ? { ...post, ...changes, dirty: true } : post)),
    );
  };

  const saveSelected = () => {
    setPosts((current) =>
      current.map((post) =>
        post.id === selectedId
          ? {
              ...post,
              dirty: false,
              summary: post.summary.trim(),
              title: getPostTitle(post),
              updatedAt: "Just now",
            }
          : post,
      ),
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveSelected();
  };

  const createPost = () => {
    const post: Post = {
      dirty: true,
      id: "post-" + nextPostId.current,
      status: "draft",
      summary: "",
      title: "Untitled post",
      updatedAt: "Now",
    };

    nextPostId.current += 1;
    setPosts((current) => [post, ...current]);
    setSelectedId(post.id);
    setQuery("");
    setStatusFilter("all");

    window.requestAnimationFrame(() => {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    });
  };

  const publishedCount = posts.filter((post) => post.status === "published").length;

  return (
    <div className={`flex min-h-dvh flex-col bg-background text-foreground ${TEMPLATE_THEME}`}>
      <header className="border-b-2 border-border bg-secondary-background">
        <div className="mx-auto flex h-12 w-full max-w-screen-xl items-center justify-between px-4 sm:px-6">
          <h1 className="text-base font-heading">Folio CMS</h1>
          <Button type="button" size="sm" onClick={createPost}>
            <Plus aria-hidden="true" />
            New post
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-screen-xl flex-1 px-4 py-4 sm:px-6 sm:py-5">
        <section
          aria-label="CMS workspace"
          className="grid w-full min-w-0 overflow-hidden rounded-base border-2 border-border bg-secondary-background lg:grid-cols-[minmax(18rem,2fr)_minmax(22rem,3fr)]"
        >
          <div className="min-w-0 border-b-2 border-border lg:border-r-2 lg:border-b-0">
            <div className="space-y-2 border-b-2 border-border bg-background p-3">
              <div className="relative min-w-0">
                <label htmlFor="post-search" className="sr-only">
                  Search posts
                </label>
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/50"
                />
                <Input
                  id="post-search"
                  type="search"
                  className="h-9 pl-9"
                  placeholder="Search posts"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>

              <Tabs value={statusFilter} onValueChange={handleFilterChange}>
                <TabsList
                  aria-label="Filter posts by status"
                  className="grid h-9 w-full grid-cols-3 p-0"
                >
                  {STATUS_TABS.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value} className="min-w-0 px-2">
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <section aria-label="Posts" className="min-w-0">
              {filteredPosts.length === 0 ? (
                <p className="px-4 py-12 text-center text-sm text-foreground/60">No posts found.</p>
              ) : (
                <ul>
                  {filteredPosts.map((post) => {
                    const isSelected = post.id === selectedId;

                    return (
                      <li key={post.id} className="border-b-2 border-border last:border-b-0">
                        <button
                          type="button"
                          aria-pressed={isSelected}
                          className={
                            "grid min-h-[4.5rem] w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-l-4 px-3 py-3 text-left outline-none transition-colors hover:bg-background focus-visible:bg-background sm:px-4 " +
                            (isSelected ? "border-l-main bg-background" : "border-l-transparent")
                          }
                          onClick={() => setSelectedId(post.id)}
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-heading">
                              {getPostTitle(post)}
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-foreground/60">
                              {post.summary || "No summary"}
                            </span>
                          </span>

                          <span className="grid justify-items-end gap-1.5">
                            <PostStatusBadge status={post.status} />
                            <span className="text-xs text-foreground/60">
                              {post.dirty ? "Unsaved" : post.updatedAt}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          <section aria-labelledby="post-editor-title" className="min-w-0">
            {selectedPost ? (
              <form className="flex h-full min-h-[24rem] flex-col" onSubmit={handleSubmit}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border bg-background px-4 py-3">
                  <div className="min-w-0">
                    <h2 id="post-editor-title" className="text-sm font-heading">
                      Edit post
                    </h2>
                    <p className="mt-0.5 text-xs text-foreground/60">
                      {selectedPost.dirty ? "Unsaved changes" : `Updated ${selectedPost.updatedAt}`}
                    </p>
                  </div>

                  <Button type="submit" size="sm" disabled={!selectedPost.dirty}>
                    <Save aria-hidden="true" />
                    Save
                  </Button>
                </div>

                <div className="grid flex-1 content-start gap-5 p-4 sm:p-5">
                  <div className="space-y-1.5">
                    <label htmlFor="post-title" className="block text-sm font-heading">
                      Title
                    </label>
                    <Input
                      ref={titleInputRef}
                      id="post-title"
                      value={selectedPost.title}
                      onChange={(event) => updateSelected({ title: event.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="post-summary" className="block text-sm font-heading">
                      Summary
                    </label>
                    <Textarea
                      id="post-summary"
                      className="min-h-40 resize-y"
                      value={selectedPost.summary}
                      onChange={(event) => updateSelected({ summary: event.target.value })}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 border-t-2 border-border pt-4">
                    <label htmlFor="post-published" className="text-sm font-heading">
                      Published
                    </label>
                    <Switch
                      id="post-published"
                      size="sm"
                      checked={selectedPost.status === "published"}
                      onCheckedChange={(checked) =>
                        updateSelected({
                          status: checked ? "published" : "draft",
                        })
                      }
                    />
                  </div>
                </div>
              </form>
            ) : null}
          </section>
        </section>
      </main>

      <footer className="border-t-2 border-border bg-secondary-background">
        <div className="mx-auto flex h-9 w-full max-w-screen-xl items-center justify-between px-4 text-xs text-foreground/60 sm:px-6">
          <p>{posts.length} posts</p>
          <p>{publishedCount} published</p>
        </div>
      </footer>
    </div>
  );
}
