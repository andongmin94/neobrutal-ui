import { useDocsSearch } from "fumadocs-core/search/client";
import { staticClient } from "fumadocs-core/search/client/orama-static";
import { ArrowRight, Command, Search, X } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router";

import { COMPONENT_DIRECTORY_LINKS } from "@/data/component-directory";
import TEMPLATES from "@/data/templates";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { trapTabFocus } from "~/lib/focus";
import { PRIMARY_NAVIGATION_LINKS } from "~/lib/navigation";

type SearchEntry = {
  group: string;
  href: string;
  label: string;
  terms?: string;
};

const resultListId = "docs-search-results";
const searchClient = staticClient();

const staticEntries: SearchEntry[] = [
  {
    group: "Directory",
    href: "/",
    label: "Component directory",
    terms: "home registry browse",
  },
  { group: "Getting started", href: "/docs", label: "Introduction" },
  { group: "Getting started", href: "/docs/installation", label: "Installation" },
  { group: "Getting started", href: "/docs/registry", label: "Registry" },
  { group: "Foundation", href: "/docs/design-tokens", label: "Design tokens" },
  ...PRIMARY_NAVIGATION_LINKS.filter((link) => link.href !== "/docs").map((link) => ({
    group: "Explore",
    href: link.href,
    label: link.text,
  })),
  { group: "Project", href: "/docs/stars", label: "GitHub stars data" },
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
  const launcher = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const resultList = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { query, search, setSearch } = useDocsSearch({
    client: searchClient,
    delayMs: 80,
  });

  const results = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    if (!normalized) return staticEntries.slice(0, 12);

    const localMatches = staticEntries.filter((entry) =>
      `${entry.label} ${entry.group} ${entry.terms ?? ""}`.toLowerCase().includes(normalized),
    );

    const indexedMatches: SearchEntry[] =
      query.data && query.data !== "empty"
        ? query.data.slice(0, 24).map((result) => ({
            group:
              result.breadcrumbs?.map(plainText).filter(Boolean).join(" / ") || "Documentation",
            href: result.url,
            label: plainText(result.content) || "Untitled section",
          }))
        : [];

    const deduplicated = new Map<string, SearchEntry>();
    for (const entry of [...localMatches, ...indexedMatches]) {
      if (!deduplicated.has(entry.href)) deduplicated.set(entry.href, entry);
    }

    return [...deduplicated.values()].slice(0, 12);
  }, [query.data, search]);

  function show() {
    const activeElement = document.activeElement;
    returnFocus.current =
      activeElement instanceof HTMLElement && activeElement !== document.body
        ? activeElement
        : launcher.current;
    setOpen(true);
  }

  function hide() {
    setOpen(false);
  }

  function go(entry: SearchEntry) {
    hide();
    navigate(entry.href);
  }

  function revealSelectedResult(index: number) {
    requestAnimationFrame(() => {
      resultList.current
        ?.querySelector<HTMLElement>(`#docs-search-result-${index}`)
        ?.scrollIntoView({ block: "nearest" });
    });
  }

  function moveSelection(index: number) {
    const nextIndex = Math.max(0, Math.min(index, results.length - 1));
    setSelectedIndex(nextIndex);
    revealSelectedResult(nextIndex);
  }

  function onInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveSelection(selectedIndex + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveSelection(selectedIndex - 1);
    } else if (event.key === "Enter" && results[selectedIndex]) {
      event.preventDefault();
      go(results[selectedIndex]);
    }
  }

  useEffect(() => {
    function onGlobalKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => {
          if (!current) {
            const activeElement = document.activeElement;
            returnFocus.current =
              activeElement instanceof HTMLElement && activeElement !== document.body
                ? activeElement
                : launcher.current;
          }
          return !current;
        });
      }

      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onGlobalKeyDown);
    return () => window.removeEventListener("keydown", onGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;

    const returnTarget = returnFocus.current;
    const launcherTarget = launcher.current;
    setSearch("");
    setSelectedIndex(0);
    document.documentElement.classList.add("search-open");
    document.querySelector<HTMLElement>(".site-frame")?.setAttribute("inert", "");
    requestAnimationFrame(() => input.current?.focus());

    return () => {
      document.documentElement.classList.remove("search-open");
      document.querySelector<HTMLElement>(".site-frame")?.removeAttribute("inert");
      const focusTarget = returnTarget?.isConnected ? returnTarget : launcherTarget;
      returnFocus.current = null;
      requestAnimationFrame(() => focusTarget?.focus());
    };
  }, [open, setSearch]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const activeResultId = results[selectedIndex] ? `docs-search-result-${selectedIndex}` : undefined;

  return (
    <>
      <button
        ref={launcher}
        className="search-launcher pressable"
        type="button"
        aria-label="Search documentation"
        title="Search documentation"
        aria-haspopup="dialog"
        onClick={show}
      >
        <Search aria-hidden="true" size={16} strokeWidth={2.4} />
        <span>Search</span>
        <kbd>
          <Command aria-hidden="true" size={11} />K
        </kbd>
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="search-overlay">
            <button
              className="search-overlay__dismiss"
              type="button"
              aria-label="Close search"
              onClick={hide}
            />
            <dialog
              open
              className="search-dialog"
              aria-modal="true"
              aria-label="Search documentation"
              onKeyDown={trapTabFocus}
            >
              <div className="search-dialog__input">
                <Search aria-hidden="true" size={20} strokeWidth={2.3} />
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
                  aria-activedescendant={activeResultId}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={onInputKeyDown}
                />
                <button
                  className="icon-button"
                  type="button"
                  aria-label="Close search"
                  onClick={hide}
                >
                  <X aria-hidden="true" size={18} strokeWidth={2.4} />
                </button>
              </div>

              <div
                ref={resultList}
                id={resultListId}
                className="search-dialog__results"
                role="listbox"
                aria-busy={query.isLoading || undefined}
              >
                {results.map((entry, index) => (
                  <button
                    id={`docs-search-result-${index}`}
                    key={`${entry.group}:${entry.href}`}
                    type="button"
                    role="option"
                    aria-selected={selectedIndex === index}
                    className={selectedIndex === index ? "is-selected" : undefined}
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
            </dialog>
          </div>,
          document.body,
        )}
    </>
  );
}
