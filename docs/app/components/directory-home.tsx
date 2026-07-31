import { ArrowRight, Box, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Link, useSearchParams } from "react-router";

import {
  COMPONENT_CATEGORIES,
  COMPONENT_DIRECTORY_LINKS,
  type ComponentCategory,
  type ComponentGroup,
  getComponentCategory,
  getComponentInstallMode,
} from "@/data/component-directory";

const categoryDescriptions: Record<ComponentGroup, string> = {
  Actions: "Controls that turn intent into an immediate action.",
  Forms: "Inputs and selection controls for structured user data.",
  Navigation: "Patterns that keep movement and context predictable.",
  Overlays: "Layered surfaces for focused tasks and secondary content.",
  Feedback: "Status, progress, and outcome signals for the interface.",
  Disclosure: "Compact controls that reveal content on demand.",
  "Data display": "Readable structures for content, values, and media.",
  Layout: "Primitives for arranging, scrolling, and resizing content.",
};

const entries = COMPONENT_DIRECTORY_LINKS.map((link) => {
  const slug = link.href.split("/").pop() ?? "";
  const category = getComponentCategory(slug);

  return {
    ...link,
    slug,
    category,
    installMode: getComponentInstallMode(slug),
    description: categoryDescriptions[category],
  };
});

function isComponentCategory(value: string | null): value is ComponentCategory {
  return COMPONENT_CATEGORIES.some((category) => category === value);
}

export function DirectoryHome() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInput = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const savedCategory = searchParams.get("category");
  const [category, setCategory] = useState<ComponentCategory>(
    isComponentCategory(savedCategory) ? savedCategory : "All",
  );

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return entries.filter((entry) => {
      const inCategory = category === "All" || entry.category === category;
      const inQuery = `${entry.text} ${entry.category} ${entry.description}`
        .toLowerCase()
        .includes(normalizedQuery);

      return inCategory && inQuery;
    });
  }, [category, query]);

  function countFor(item: ComponentCategory) {
    return item === "All"
      ? entries.length
      : entries.filter((entry) => entry.category === item).length;
  }

  function resetFilters() {
    setQuery("");
    setCategory("All");
  }

  useEffect(() => {
    const next = new URLSearchParams();
    const normalizedQuery = query.trim();

    if (normalizedQuery) next.set("q", normalizedQuery);
    if (category !== "All") next.set("category", category);

    setSearchParams(next, { replace: true });
  }, [category, query, setSearchParams]);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const target = event.target;
      if (
        event.key !== "/" ||
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }

      event.preventDefault();
      searchInput.current?.focus();
    }

    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  return (
    <main id="main-content" className="directory-page" tabIndex={-1}>
      <section className="directory-hero">
        <div className="directory-hero__inner">
          <div className="directory-hero__copy">
            <p className="eyebrow">Registry index / {entries.length} components</p>
            <h1>
              Find the piece.
              <br />
              Own the source.
            </h1>
            <p className="directory-hero__description">
              Browse the library by job, inspect the live behavior, then install editable React
              source into your project.
            </p>
          </div>

          <div className="directory-hero__stat" aria-label="Registry summary">
            <strong>{entries.length}</strong>
            <span>React components</span>
            <small>Base UI / Tailwind CSS / shadcn</small>
          </div>
        </div>
      </section>

      <section className="directory-tools" aria-label="Directory filters">
        <label className="directory-search">
          <Search aria-hidden="true" size={20} strokeWidth={2.3} />
          <input
            ref={searchInput}
            value={query}
            type="search"
            placeholder="Search components, categories, or jobs"
            aria-label="Search component directory"
            onChange={(event) => setQuery(event.target.value)}
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              title="Clear"
              onClick={() => setQuery("")}
            >
              <X aria-hidden="true" size={17} strokeWidth={2.4} />
            </button>
          ) : (
            <kbd>/</kbd>
          )}
        </label>

        <div className="directory-result-count" aria-live="polite">
          <strong>{filteredEntries.length}</strong>
          <span>{filteredEntries.length === 1 ? "result" : "results"}</span>
        </div>
      </section>

      <div className="directory-browser">
        <aside className="directory-categories">
          <h2>
            <SlidersHorizontal aria-hidden="true" size={15} strokeWidth={2.4} />
            Filter by job
          </h2>
          <div>
            {COMPONENT_CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={category === item}
                className={category === item ? "is-active" : undefined}
                onClick={() => setCategory(item)}
              >
                <span>{item}</span>
                <small>{countFor(item)}</small>
              </button>
            ))}
          </div>
        </aside>

        <section className="directory-results">
          <div className="directory-results__head">
            <p>
              <span>{category}</span>
              <span aria-hidden="true">/</span>
              {filteredEntries.length} entries
            </p>
            <span>Source owned</span>
          </div>

          {filteredEntries.length > 0 ? (
            <div className="directory-grid">
              {filteredEntries.map((entry, index) => (
                <Link
                  key={entry.slug}
                  className="directory-card pressable"
                  to={entry.href}
                  style={{ "--entry-index": index } as CSSProperties}
                >
                  <div className="directory-card__top">
                    <Box aria-hidden="true" size={18} strokeWidth={2.4} />
                    <span>{entry.installMode}</span>
                  </div>
                  <div className="directory-card__body">
                    <p>{entry.category}</p>
                    <h2>{entry.text}</h2>
                    <span>{entry.description}</span>
                  </div>
                  <ArrowRight
                    className="directory-card__arrow"
                    aria-hidden="true"
                    size={19}
                    strokeWidth={2.4}
                  />
                </Link>
              ))}
            </div>
          ) : (
            <div className="directory-empty">
              <Search aria-hidden="true" size={25} strokeWidth={2.3} />
              <h2>No components found</h2>
              <p>Try another term or reset the filters.</p>
              <button className="pressable" type="button" onClick={resetFilters}>
                Reset filters
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
