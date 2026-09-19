"use client";

import { Eye, Plus, RotateCcw, Save, Search } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type PostStatus = "draft" | "published";
type StatusFilter = "all" | PostStatus;

type Post = {
  body: string;
  dirty: boolean;
  id: string;
  status: PostStatus;
  summary: string;
  title: string;
  updatedLabel: string;
};

type PostChanges = Partial<Pick<Post, "body" | "status" | "summary" | "title">>;

const INITIAL_POSTS: Post[] = [
  {
    dirty: false,
    body: "This release brings clearer ownership, faster search, and a simpler review queue.\n\nStart with the updated workspace overview, then review the changes with your team.",
    id: "post-105",
    status: "published",
    summary: "Highlights from the latest workspace release.",
    title: "July product update",
    updatedLabel: "12 min",
  },
  {
    dirty: false,
    body: "Start with one shared space. Assign an owner to each area, write down the naming rules, and invite a small group to test the workflow.",
    id: "post-104",
    status: "draft",
    summary: "A practical structure for growing teams.",
    title: "Organize your first team space",
    updatedLabel: "38 min",
  },
  {
    dirty: false,
    body: "The team replaced scattered feedback with a single review queue. Every draft now has a named reviewer and a clear next action.",
    id: "post-103",
    status: "published",
    summary: "How Verdant Studio simplified editorial review.",
    title: "A faster review process",
    updatedLabel: "2 hr",
  },
  {
    dirty: false,
    body: "Check ownership and access. Read the page on a narrow screen. Test every link and confirm that the contact details are current.",
    id: "post-102",
    status: "draft",
    summary: "Final ownership, access, and link checks.",
    title: "Public page checklist",
    updatedLabel: "Yesterday",
  },
  {
    dirty: false,
    body: "Route each request to one responsible team. Keep unassigned requests visible and review routing rules when the team changes.",
    id: "post-101",
    status: "published",
    summary: "Set routing rules and keep requests visible.",
    title: "Shared inbox routing",
    updatedLabel: "Jul 11",
  },
];

const STATUS_TABS: Array<{ label: string; value: StatusFilter }> = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
];

function getFilteredPosts(posts: Post[], query: string, statusFilter: StatusFilter) {
  const normalizedQuery = query.trim().toLowerCase();
  return posts.filter((post) => {
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    return (
      matchesStatus && (post.title + " " + post.summary).toLowerCase().includes(normalizedQuery)
    );
  });
}

function getDisplayPostTitle(post: Post) {
  return post.title.trim() || "Untitled post";
}

function resolveSelectedPostId(posts: Post[], selectedId: string) {
  return posts.some((post) => post.id === selectedId) ? selectedId : (posts[0]?.id ?? "");
}

function PostStatusBadge({ status }: { status: PostStatus }) {
  return (
    <Badge variant={status === "published" ? "default" : "neutral"} className="justify-self-start">
      {status === "published" ? "Published" : "Draft"}
    </Badge>
  );
}

function PostListPane({
  onSelect,
  posts,
  selectedId,
}: {
  onSelect: (postId: string) => void;
  posts: Post[];
  selectedId: string;
}) {
  return (
    <section aria-label="Posts" className="min-w-0">
      {posts.length === 0 ? (
        <p className="px-4 py-12 text-center text-sm text-foreground/60">No posts found.</p>
      ) : (
        <ul>
          {posts.map((post) => {
            const isSelected = post.id === selectedId;

            return (
              <li key={post.id} className="border-b-2 border-border last:border-b-0">
                <button
                  type="button"
                  aria-pressed={isSelected}
                  className={
                    "grid min-h-[4.5rem] w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-l-4 px-3 py-3 text-left outline-none transition-colors hover:bg-background focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-4 " +
                    (isSelected ? "border-l-main bg-background" : "border-l-transparent")
                  }
                  onClick={() => onSelect(post.id)}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-heading">
                      {getDisplayPostTitle(post)}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-foreground/60">
                      {post.summary || "No summary"}
                    </span>
                  </span>

                  <span className="grid justify-items-end gap-1.5">
                    <PostStatusBadge status={post.status} />
                    <span className="text-xs text-foreground/60">
                      {post.dirty ? "Unsaved" : post.updatedLabel}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function PostEditorPane({
  hiddenByFilters,
  onClearFilters,
  onDiscard,
  onSubmit,
  onUpdate,
  post,
  titleInputRef,
}: {
  hiddenByFilters: boolean;
  onClearFilters: () => void;
  onDiscard: () => void;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onUpdate: (changes: PostChanges) => void;
  post: Post;
  titleInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <form className="flex h-full min-h-[24rem] flex-col" onSubmit={onSubmit}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border bg-background px-4 py-3">
        <div className="min-w-0">
          <h2 id="post-editor-title" className="text-sm font-heading">
            Edit post
          </h2>
          <p className="mt-0.5 text-xs text-foreground/60">
            {post.dirty ? "Unsaved changes" : `Updated ${post.updatedLabel}`}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="button" size="sm" variant="neutral" disabled={!post.dirty} onClick={onDiscard}>
            <RotateCcw aria-hidden="true" />
            Discard
          </Button>
          <Button type="submit" size="sm" disabled={!post.dirty}>
            <Save aria-hidden="true" />
            Save
          </Button>
        </div>
      </div>

      {hiddenByFilters ? (
        <div className="border-b-2 border-border px-4 py-3 text-sm">
          <p role="status">
            This post no longer matches the current filters. Your edits are still here.
          </p>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="mt-1 px-0"
            onClick={onClearFilters}
          >
            Clear filters
          </Button>
        </div>
      ) : null}

      <div className="grid flex-1 content-start gap-5 p-4 sm:p-5">
        <div className="space-y-1.5">
          <label htmlFor="post-title" className="block text-sm font-heading">
            Title
          </label>
          <Input
            ref={titleInputRef}
            id="post-title"
            required
            value={post.title}
            onChange={(event) => onUpdate({ title: event.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="post-summary" className="block text-sm font-heading">
            Summary
          </label>
          <Textarea
            id="post-summary"
            className="min-h-24 resize-y"
            value={post.summary}
            onChange={(event) => onUpdate({ summary: event.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="post-body" className="block text-sm font-heading">
            Content
          </label>
          <Textarea
            id="post-body"
            className="min-h-48 resize-y"
            value={post.body}
            onChange={(event) => onUpdate({ body: event.target.value })}
            aria-describedby="post-body-help"
          />
          <p id="post-body-help" className="text-xs text-foreground/70">
            Plain text. Paragraph breaks are preserved in the preview.
          </p>
        </div>

        <details className="border-y-2 border-border py-3">
          <summary className="flex cursor-pointer items-center gap-2 font-heading text-sm">
            <Eye aria-hidden="true" className="size-4" />
            Read preview
          </summary>
          <article aria-label="Post preview" className="mt-4 space-y-3 break-words">
            <PostStatusBadge status={post.status} />
            <h3 className="text-2xl font-heading">{getDisplayPostTitle(post)}</h3>
            <p className="text-sm text-foreground/70">{post.summary || "No summary yet."}</p>
            <p className="whitespace-pre-wrap text-sm leading-7">
              {post.body || "Start writing to preview your post."}
            </p>
          </article>
        </details>

        <div className="flex items-center justify-between gap-4 border-t-2 border-border pt-4">
          <label htmlFor="post-published" className="text-sm font-heading">
            Published
          </label>
          <Switch
            id="post-published"
            checked={post.status === "published"}
            onCheckedChange={(checked) =>
              onUpdate({
                status: checked ? "published" : "draft",
              })
            }
          />
        </div>
      </div>
    </form>
  );
}

function EmptyPostEditor({
  onClearFilters,
  onCreatePost,
}: {
  onClearFilters: () => void;
  onCreatePost: () => void;
}) {
  return (
    <div className="grid min-h-[24rem] place-content-center justify-items-center gap-3 p-6 text-center">
      <Search aria-hidden="true" className="size-6 text-foreground/60" />
      <h2 id="post-editor-title" className="text-base font-heading">
        No post selected
      </h2>
      <p className="max-w-xs text-sm text-foreground/60">
        Clear the current filters or start a new post.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Button type="button" variant="neutral" onClick={onClearFilters}>
          Clear filters
        </Button>
        <Button type="button" onClick={onCreatePost}>
          <Plus aria-hidden="true" />
          New post
        </Button>
      </div>
    </div>
  );
}

export default function CmsTemplate() {
  const [posts, setPosts] = React.useState<Post[]>(INITIAL_POSTS);
  const [savedPosts, setSavedPosts] = React.useState<Post[]>(INITIAL_POSTS);
  const [feedback, setFeedback] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState(INITIAL_POSTS[0].id);
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");

  const nextPostNumber = React.useRef(106);
  const titleInputRef = React.useRef<HTMLInputElement>(null);

  const filteredPosts = getFilteredPosts(posts, query, statusFilter);
  const selectedPost = posts.find((post) => post.id === selectedId);

  const changeFilters = (nextQuery: string, nextStatus: StatusFilter) => {
    const matches = getFilteredPosts(posts, nextQuery, nextStatus);
    setFeedback("");
    setQuery(nextQuery);
    setStatusFilter(nextStatus);
    setSelectedId(resolveSelectedPostId(matches, selectedId));
  };

  const clearFilters = () => changeFilters("", "all");

  const updateSelectedPost = (changes: PostChanges) => {
    setFeedback("");
    const saved = savedPosts.find((post) => post.id === selectedId);
    setPosts((current) =>
      current.map((post) => {
        if (post.id !== selectedId) return post;
        const next = { ...post, ...changes };
        next.dirty = !saved || (["body", "status", "summary", "title"] as const).some(
          (key) => next[key] !== saved[key],
        );
        return next;
      }),
    );
  };

  const saveSelectedPost = () => {
    if (!selectedPost || !selectedPost.dirty) return;
    const saved: Post = {
      ...selectedPost,
      body: selectedPost.body.trim(),
      dirty: false,
      summary: selectedPost.summary.trim(),
      title: getDisplayPostTitle(selectedPost),
      updatedLabel: "Just now",
    };
    setPosts((current) => current.map((post) => post.id === saved.id ? saved : post));
    setSavedPosts((current) => [...current.filter((post) => post.id !== saved.id), saved]);
    setFeedback("Saved in this preview. Refreshing the page resets all edits.");
  };

  const discardSelectedPost = () => {
    const saved = savedPosts.find((post) => post.id === selectedId);
    if (!saved) return;
    setPosts((current) => current.map((post) => post.id === selectedId ? saved : post));
    setFeedback("Restored the last locally saved version.");
    titleInputRef.current?.focus();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveSelectedPost();
  };

  const createDraftPost = () => {
    const post: Post = {
      body: "",
      dirty: true,
      id: "post-" + nextPostNumber.current,
      status: "draft",
      summary: "",
      title: "Untitled post",
      updatedLabel: "Now",
    };

    nextPostNumber.current += 1;
    setPosts((current) => [post, ...current]);
    setSavedPosts((current) => [{ ...post, dirty: false }, ...current]);
    setFeedback("");
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
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="border-b-2 border-border bg-secondary-background">
        <div className="mx-auto flex h-12 w-full max-w-screen-xl items-center justify-between px-4 sm:px-6">
          <h1 className="text-base font-heading">Folio CMS</h1>
          <Button type="button" size="sm" onClick={createDraftPost}>
            <Plus aria-hidden="true" />
            New post
          </Button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-screen-xl px-4 pt-5 sm:px-6">
        <div className="grid grid-cols-3 divide-x-2 divide-border border-y-2 border-border py-3">
          {[
            { label: "Total posts", value: posts.length },
            { label: "Published", value: publishedCount },
            { label: "Unsaved", value: posts.filter((post) => post.dirty).length },
          ].map((metric) => (
            <div key={metric.label} className="px-3 first:pl-0">
              <p className="text-xs text-foreground/70">{metric.label}</p>
              <p className="mt-1 text-2xl font-heading tabular-nums">{metric.value}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs leading-5 text-foreground/70">
          Local workspace demo. Save and discard affect this page only; nothing is published online.
        </p>
        {feedback ? <p role="status" className="mt-2 text-sm">{feedback}</p> : null}
      </div>

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
                  className="h-10 pl-9"
                  placeholder="Search posts"
                  value={query}
                  onChange={(event) => changeFilters(event.target.value, statusFilter)}
                />
              </div>

              <div
                role="group"
                aria-label="Filter posts by status"
                className="grid h-10 w-full grid-cols-3 overflow-hidden rounded-base border-2 border-border bg-secondary-background"
              >
                {STATUS_TABS.map((tab) => {
                  const isActive = statusFilter === tab.value;

                  return (
                    <button
                      key={tab.value}
                      type="button"
                      aria-pressed={isActive}
                      className={
                        "relative h-full min-w-0 border-0 border-r-2 border-border px-2 text-sm font-heading outline-none transition-colors last:border-r-0 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring " +
                        (isActive
                          ? "bg-main text-main-foreground"
                          : "bg-secondary-background text-foreground hover:bg-background")
                      }
                      onClick={() => changeFilters(query, tab.value)}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <PostListPane posts={filteredPosts} selectedId={selectedId} onSelect={(id) => { setSelectedId(id); setFeedback(""); }} />
          </div>

          <section aria-labelledby="post-editor-title" className="min-w-0">
            {selectedPost ? (
              <PostEditorPane
                hiddenByFilters={!filteredPosts.some((post) => post.id === selectedId)}
                onClearFilters={clearFilters}
                post={selectedPost}
                titleInputRef={titleInputRef}
                onDiscard={discardSelectedPost}
                onSubmit={handleSubmit}
                onUpdate={updateSelectedPost}
              />
            ) : (
              <EmptyPostEditor onClearFilters={clearFilters} onCreatePost={createDraftPost} />
            )}
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
