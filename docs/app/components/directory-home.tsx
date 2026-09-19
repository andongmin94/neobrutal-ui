import {
  ArrowRight,
  Bell,
  ChevronDown,
  Layers,
  Layout,
  MousePointer,
  Navigation,
  Search,
  SlidersHorizontal,
  Table,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  COMPONENT_CATEGORIES,
  COMPONENT_DIRECTORY_LINKS,
  getComponentCategory,
  getComponentInstallMode,
  type ComponentGroup,
} from "@/data/component-directory";
import descriptions from "@/data/component-descriptions.json";
import { HomeShowcase } from "./home-showcase";

const categoryIcons: Record<ComponentGroup, LucideIcon> = {
  Actions: MousePointer,
  Forms: SlidersHorizontal,
  Navigation,
  Overlays: Layers,
  Feedback: Bell,
  Disclosure: ChevronDown,
  "Data display": Table,
  Layout,
};
const entries = COMPONENT_DIRECTORY_LINKS.map((link) => {
  const slug = link.href.split("/").pop()!;
  return {
    ...link,
    slug,
    category: getComponentCategory(slug),
    installMode: getComponentInstallMode(slug),
    description: (descriptions as Record<string, string>)[slug],
  };
});

export function DirectoryHome() {
  const [params, setParams] = useSearchParams();
  const searchInput = useRef<HTMLInputElement>(null);
  const query = params.get("q") ?? "";
  const category = COMPONENT_CATEGORIES.find((value) => value === params.get("category")) ?? "All";
  const filteredEntries = entries.filter(
    (entry) =>
      (category === "All" || entry.category === category) &&
      `${entry.text} ${entry.category} ${entry.description}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  function setFilter(key: string, value: string) {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value && value !== "All") next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
  }
  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        event.key !== "/" ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        target?.closest("input, textarea, select, [contenteditable=true]")
      )
        return;
      event.preventDefault();
      searchInput.current?.focus();
    }
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, []);

  return (
    <main id="main-content" className="directory-page" tabIndex={-1}>
      <section className="directory-hero">
        <div className="directory-hero__inner">
          <div className="directory-hero__copy">
            <p className="eyebrow">React / Base UI / Tailwind CSS v4</p>
            <h1>
              Bold by design.
              <br />
              Clear in use.
            </h1>
            <p className="directory-hero__description">
              Raised controls that press down in stages. Clear selection and feedback. Build a
              complete interface with shared styles and source you can edit.
            </p>
            <div className="directory-hero__actions">
              <Link className={buttonVariants({ size: "lg" })} to="/docs/installation">
                Get started
                <ArrowRight aria-hidden="true" />
              </Link>
              <a
                className={`${buttonVariants({ variant: "outline", size: "lg" })} directory-action-link`}
                href="#components"
              >
                Browse {entries.length} components
              </a>
            </div>
            <p className="directory-hero__meta">Open source · MIT · Light and dark themes</p>
          </div>
          <HomeShowcase />
        </div>
      </section>
      <section className="directory-tools" id="components" aria-label="Component directory">
        <div>
          <h2>Find your building blocks.</h2>
          <p>Search by component, purpose, or category.</p>
        </div>
        <label className="directory-search">
          <Search aria-hidden="true" size={20} />
          <input
            ref={searchInput}
            value={query}
            type="search"
            placeholder="Search components…"
            aria-label="Search component directory"
            onChange={(event) => setFilter("q", event.target.value)}
          />
          {query ? (
            <button type="button" aria-label="Clear search" onClick={() => setFilter("q", "")}>
              <X aria-hidden="true" size={17} />
            </button>
          ) : (
            <kbd>/</kbd>
          )}
        </label>
      </section>
      <div className="directory-browser">
        <aside className="directory-categories">
          <h2>Categories</h2>
          <div>
            {COMPONENT_CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={category === item}
                className={category === item ? "is-active" : undefined}
                onClick={() => setFilter("category", item)}
              >
                <span>{item}</span>
                <small>
                  {item === "All"
                    ? entries.length
                    : entries.filter((entry) => entry.category === item).length}
                </small>
              </button>
            ))}
          </div>
        </aside>
        <section className="directory-results" aria-label="Components">
          <div className="directory-results__head">
            <p aria-live="polite">
              <strong>{filteredEntries.length}</strong>{" "}
              {filteredEntries.length === 1 ? "component" : "components"}
              {category !== "All" ? ` in ${category}` : ""}
            </p>
            <Link
              className={`${buttonVariants({ variant: "outline", size: "sm" })} directory-action-link`}
              to="/templates"
            >
              Explore complete templates <ArrowRight aria-hidden="true" size={14} />
            </Link>
          </div>
          {filteredEntries.length ? (
            <div className="directory-grid">
              {filteredEntries.map((entry) => {
                const Icon = categoryIcons[entry.category];
                return (
                  <Link key={entry.slug} className="directory-card pressable" to={entry.href}>
                    <div className="directory-card__top">
                      <Icon aria-hidden="true" size={22} />
                      <span>{entry.installMode}</span>
                    </div>
                    <div className="directory-card__body">
                      <h2>{entry.text}</h2>
                      <span>{entry.description}</span>
                    </div>
                    <div className="directory-card__bottom">
                      <span>{entry.category}</span>
                      <ArrowRight aria-hidden="true" size={17} />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="directory-empty">
              <Search aria-hidden="true" size={25} />
              <h2>No components found</h2>
              <p>Try another term or clear the filters.</p>
              <button
                className="pressable"
                type="button"
                onClick={() => setParams({}, { replace: true, preventScrollReset: true })}
              >
                Reset filters
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
