import { Dialog } from "@base-ui/react/dialog";
import { useDocsSearch, type SearchClient } from "fumadocs-core/search/client";
import { ArrowRight, Command, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useLocation, useNavigate } from "react-router";

import { COMPONENT_DIRECTORY_LINKS } from "@/data/component-directory";
import TEMPLATES from "@/data/templates";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { PRIMARY_NAVIGATION_LINKS } from "~/lib/navigation";

type SearchEntry = { group: string; href: string; label: string; terms?: string };
const resultListId = "docs-search-results";

const staticEntries: SearchEntry[] = [
  { group: "Directory", href: "/", label: "Component directory", terms: "home registry browse" },
  { group: "Getting started", href: "/docs", label: "Introduction" },
  { group: "Getting started", href: "/docs/installation", label: "Installation" },
  { group: "Getting started", href: "/docs/registry", label: "Registry" },
  { group: "Foundation", href: "/docs/design-tokens", label: "Design tokens" },
  ...PRIMARY_NAVIGATION_LINKS.filter((link) => link.href !== "/docs").map((link) => ({
    group: "Explore",
    href: link.href,
    label: link.text,
  })),
  { group: "Project", href: "/docs/resources", label: "Resources" },
  { group: "Project", href: "/docs/credits", label: "Credits & license" },
  ...COMPONENT_DIRECTORY_LINKS.map((entry) => ({
    group: "Components",
    href: entry.href,
    label: entry.text,
    terms: `component ${entry.text}`,
  })),
  ...TEMPLATES.map((entry) => ({
    group: "Templates",
    href: `/templates/${entry.slug}`,
    label: `${entry.title} template`,
    terms: entry.description,
  })),
  ...BLOG_POSTS.map((entry) => ({
    group: "Blog",
    href: `/templates/blog/${entry.slug}`,
    label: entry.title,
    terms: `${entry.topic} ${entry.summary}`,
  })),
];

function plainText(value: string) {
  return value
    .replaceAll(/<[^>]+>/g, "")
    .replaceAll(/[*_`#[\]]/g, "")
    .trim();
}

export function SearchLauncher() {
  const navigate = useNavigate();
  const location = useLocation();
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [retry, setRetry] = useState(0);
  const client = useMemo<SearchClient>(
    () => ({
      deps: [retry],
      async search(value) {
        const { staticClient } = await import("fumadocs-core/search/client/orama-static");
        // The library caches index promises by URL, including a failed request.
        // Only an explicit retry gets a fresh key; normal queries reuse its index.
        return staticClient({
          from: retry ? `/api/search?attempt=${retry}` : "/api/search",
        }).search(value);
      },
    }),
    [retry],
  );
  const { query, search, setSearch } = useDocsSearch({ client, delayMs: 80 });

  const results = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return staticEntries.slice(0, 12);
    const local = staticEntries.filter((entry) =>
      `${entry.label} ${entry.group} ${entry.terms ?? ""}`.toLowerCase().includes(normalized),
    );
    const indexed: SearchEntry[] =
      !query.error && !query.isLoading && query.data && query.data !== "empty"
        ? query.data.slice(0, 24).map((result) => ({
            group:
              result.breadcrumbs?.map(plainText).filter(Boolean).join(" / ") || "Documentation",
            href: result.url,
            label: plainText(result.content) || "Untitled section",
          }))
        : [];
    const unique = new Map<string, SearchEntry>();
    for (const entry of [...local, ...indexed])
      if (!unique.has(entry.href)) unique.set(entry.href, entry);
    return [...unique.values()].slice(0, 12);
  }, [query.data, query.error, query.isLoading, search]);
  const activeIndex = Math.min(selectedIndex, Math.max(0, results.length - 1));

  function go(entry: SearchEntry) {
    setOpen(false);
    navigate(entry.href);
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) {
      event.stopPropagation();
      return;
    }
    const movement = {
      ArrowDown: activeIndex + 1,
      ArrowUp: activeIndex - 1,
      Home: 0,
      End: results.length - 1,
    };
    if (event.key in movement) {
      event.preventDefault();
      const next = Math.max(
        0,
        Math.min(movement[event.key as keyof typeof movement], results.length - 1),
      );
      setSelectedIndex(next);
      document.getElementById(`docs-search-result-${next}`)?.scrollIntoView({ block: "nearest" });
    } else if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault();
      go(results[activeIndex]);
    }
  }

  useEffect(() => {
    function shortcut(event: globalThis.KeyboardEvent) {
      if (
        !event.isComposing &&
        event.keyCode !== 229 &&
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  useEffect(() => {
    if (open) {
      setSearch("");
      setSelectedIndex(0);
    }
  }, [open, setSearch]);
  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        className="search-launcher pressable"
        aria-label="Search documentation"
        title="Search documentation"
      >
        <Search aria-hidden="true" size={16} strokeWidth={2.4} />
        <span>Search</span>
        <kbd>
          <Command aria-hidden="true" size={11} />K
        </kbd>
      </Dialog.Trigger>
      <Dialog.Portal>
        <div className="search-overlay">
          <Dialog.Backdrop className="search-overlay__dismiss" />
          <Dialog.Popup
            className="search-dialog"
            aria-label="Search documentation"
            initialFocus={input}
          >
            <div className="search-dialog__input">
              <Search aria-hidden="true" size={20} strokeWidth={2.3} />
              {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- The input owns a custom listbox. */}
              <input
                ref={input}
                value={search}
                type="search"
                placeholder="Search docs and components"
                aria-label="Search docs and components"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded="true"
                aria-controls={resultListId}
                aria-activedescendant={
                  results[activeIndex] ? `docs-search-result-${activeIndex}` : undefined
                }
                onChange={(event) => {
                  setSelectedIndex(0);
                  setSearch(event.target.value);
                }}
                onKeyDown={onInputKeyDown}
              />
              <Dialog.Close className="icon-button" aria-label="Close search">
                <X aria-hidden="true" size={18} strokeWidth={2.4} />
              </Dialog.Close>
            </div>
            {query.error && (
              <div className="search-dialog__empty" role="status">
                <p>Full-text search is unavailable. Local navigation results remain available.</p>
                <button
                  type="button"
                  disabled={query.isLoading}
                  onClick={() => setRetry((value) => value + 1)}
                >
                  Retry full-text search
                </button>
              </div>
            )}
            {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- Rich results use a custom listbox. */}
            <div
              id={resultListId}
              className="search-dialog__results"
              role="listbox"
              aria-label="Search results"
              aria-busy={query.isLoading || undefined}
            >
              {results.map((entry, index) => (
                // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- The input owns active-descendant focus.
                <button
                  id={`docs-search-result-${index}`}
                  key={entry.href}
                  type="button"
                  role="option"
                  tabIndex={-1}
                  aria-selected={activeIndex === index}
                  className={activeIndex === index ? "is-selected" : undefined}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => go(entry)}
                >
                  <span>
                    <small>{entry.group}</small>
                    <strong>{entry.label}</strong>
                  </span>
                  <ArrowRight aria-hidden="true" size={17} strokeWidth={2.4} />
                </button>
              ))}
              {results.length === 0 && (
                <div className="search-dialog__empty">
                  {query.isLoading ? "Loading full-text index..." : `No matches for "${search}"`}
                </div>
              )}
            </div>
            <footer className="search-dialog__footer">
              <span>
                <kbd>↑</kbd>
                <kbd>↓</kbd> Navigate
              </span>
              <span>
                <kbd>Enter</kbd> Open
              </span>
              <span>
                <kbd>Esc</kbd> Close
              </span>
            </footer>
          </Dialog.Popup>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
