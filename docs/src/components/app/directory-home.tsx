"use client";

import { ArrowRight, Package, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import {
  COMPONENT_CATEGORIES,
  type ComponentCategory,
  type ComponentGroup,
  type ComponentInstallMode,
} from "@/data/component-directory";

export type DirectoryEntry = {
  category: ComponentGroup;
  description: string;
  href: string;
  installMode: ComponentInstallMode;
  name: string;
  slug: string;
};

type DirectoryHomeProps = {
  entries: DirectoryEntry[];
};

export default function DirectoryHome({ entries }: DirectoryHomeProps) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<ComponentCategory>("All");
  const searchRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        event.key !== "/" ||
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable
      ) {
        return;
      }

      event.preventDefault();
      searchRef.current?.focus();
    };

    document.addEventListener("keydown", focusSearch);
    return () => document.removeEventListener("keydown", focusSearch);
  }, []);

  const filteredEntries = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return entries.filter((entry) => {
      const matchesCategory = category === "All" || entry.category === category;
      const matchesQuery = `${entry.name} ${entry.description} ${entry.category}`
        .toLowerCase()
        .includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [category, entries, query]);

  return (
    <main className="flex min-h-[100dvh] flex-col bg-background pt-[70px] text-foreground">
      <section className="border-b-2 border-border bg-main px-5 py-9 text-main-foreground sm:py-12">
        <div className="mx-auto max-w-[1540px]">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em]">
                Registry index / {entries.length} components
              </p>
              <h1 className="text-4xl font-black sm:text-6xl">Component directory.</h1>
            </div>
            <p className="max-w-md text-sm leading-6 sm:text-base">
              Search the library, inspect each component, and install source you can fully own.
            </p>
          </div>

          <label className="mt-8 flex h-14 max-w-4xl items-center gap-3 border-2 border-border bg-secondary-background px-4 text-foreground shadow-[5px_5px_0_#000]">
            <Search className="size-5 shrink-0" />
            <input
              aria-keyshortcuts="/"
              className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-foreground/45"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search button, forms, overlays..."
              ref={searchRef}
              value={query}
            />
            {query ? (
              <button
                aria-label="Clear search"
                className="grid size-8 shrink-0 place-items-center border-2 border-transparent hover:border-border hover:bg-main hover:text-main-foreground"
                onClick={() => setQuery("")}
                title="Clear search"
                type="button"
              >
                <X className="size-4" />
              </button>
            ) : (
              <span className="hidden border border-border bg-main px-2 py-1 font-mono text-[10px] text-main-foreground sm:block">
                /
              </span>
            )}
          </label>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1540px] grid-cols-[minmax(0,1fr)] lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="border-b-2 border-border p-4 sm:p-6 lg:border-r-2 lg:border-b-0">
          <div className="flex items-center gap-2 lg:mb-5">
            <SlidersHorizontal className="size-4" />
            <p className="font-mono text-[10px] uppercase tracking-[0.14em]">Filter</p>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mt-0 lg:block lg:space-y-1">
            {COMPONENT_CATEGORIES.map((item) => {
              const count =
                item === "All"
                  ? entries.length
                  : entries.filter((entry) => entry.category === item).length;

              return (
                <button
                  aria-pressed={category === item}
                  className={`flex h-9 shrink-0 items-center justify-between gap-5 border-2 px-3 text-sm lg:w-full ${
                    category === item
                      ? "border-border bg-main font-bold text-main-foreground"
                      : "border-transparent hover:border-border hover:bg-secondary-background"
                  }`}
                  key={item}
                  onClick={() => setCategory(item)}
                  type="button"
                >
                  {item}
                  <span className="font-mono text-[10px] opacity-60">{count}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="mb-5 flex items-center justify-between border-b-2 border-border pb-3">
            <p className="font-mono text-xs uppercase">{filteredEntries.length} results</p>
            <span className="hidden font-mono text-[10px] uppercase opacity-55 sm:block">
              Source-owned components
            </span>
          </div>

          {filteredEntries.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredEntries.map((entry) => (
                <Link
                  className="group flex min-h-48 flex-col border-2 border-border bg-main p-4 text-main-foreground shadow-shadow transition-all duration-150 hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  href={entry.href}
                  key={entry.slug}
                >
                  <div className="mb-7 flex items-center justify-between">
                    <Package className="size-5" />
                    <span className="border border-current bg-secondary-background px-2 py-0.5 font-mono text-[10px] uppercase text-foreground">
                      {entry.installMode}
                    </span>
                  </div>
                  <h2 className="text-xl font-black">{entry.name}</h2>
                  <p className="mt-1 text-sm leading-5">{entry.description}</p>
                  <div className="mt-auto flex items-end justify-between pt-6">
                    <span className="font-mono text-[10px] uppercase">{entry.category}</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid min-h-64 place-items-center border-2 border-dashed border-border bg-secondary-background p-8 text-center">
              <div>
                <Search className="mx-auto mb-3 size-6" />
                <h2 className="text-xl font-black">No components found</h2>
                <button
                  className="mt-3 font-heading underline underline-offset-4"
                  onClick={() => {
                    setCategory("All");
                    setQuery("");
                  }}
                  type="button"
                >
                  Reset filters
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      <footer className="mt-auto border-t-2 border-border bg-main px-5 py-5 text-center text-sm text-main-foreground">
        Open source under the MIT License. Built for the shadcn registry and Base UI.
      </footer>
    </main>
  );
}
