"use client";

import { ArrowUpRight, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";

const TEMPLATE_THEME =
  "[color-scheme:light] [--background:#fff0dc] [--secondary-background:#fff] [--foreground:#000] [--main-foreground:#000] [--main:#ff7b07] [--border:#000] [--ring:#000] [--box-shadow-x:4px] [--box-shadow-y:4px] [--reverse-box-shadow-x:-4px] [--reverse-box-shadow-y:-4px] [--shadow:4px_4px_0px_0px_var(--border)] [--border-radius:5px] [--base-font-weight:500] [--heading-font-weight:700] dark:[color-scheme:dark] dark:[--background:#2c304c] dark:[--secondary-background:#222] dark:[--foreground:#ececec] dark:[--main:#ff7b07] dark:[--ring:#fff]";

const NAV_ITEMS = [
  { label: "Work", href: "#work" },
  { label: "Contact", href: "#contact" },
] as const;

const PROJECTS = [
  {
    title: "Wayline",
    type: "Product design and front-end",
    year: "2026",
    href: "https://example.com/wayline",
  },
  {
    title: "Ledgerline",
    type: "Product design",
    year: "2025",
    href: "https://example.com/ledgerline",
  },
  {
    title: "Open Index",
    type: "Web design and development",
    year: "2025",
    href: "https://example.com/open-index",
  },
] as const;

export default function PortfolioTemplate() {
  return (
    <div
      id="top"
      className={`min-h-dvh flex flex-col bg-background text-foreground selection:bg-main selection:text-main-foreground ${TEMPLATE_THEME}`}
    >
      <header className="border-b-2 border-border">
        <div className="mx-auto flex h-12 w-full max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
          <a href="#top" className="font-heading text-sm" aria-label="Sora Han home">
            Sora Han
          </a>

          <nav aria-label="Primary navigation" className="flex items-center gap-4 text-sm">
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} className="hover:underline">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
          <section aria-labelledby="portfolio-title">
            <h1 id="portfolio-title" className="font-heading text-4xl sm:text-5xl">
              Sora Han
            </h1>
            <p className="mt-3 font-heading text-lg sm:text-xl">
              Product designer and front-end developer.
            </p>
            <div className="mt-6 max-w-2xl space-y-2 leading-relaxed">
              <p>I design focused digital products for people doing complex work.</p>
              <p>I work from early product thinking through accessible front-end delivery.</p>
            </div>
          </section>

          <section id="work" aria-labelledby="work-title" className="mt-9 scroll-mt-16">
            <h2 id="work-title" className="font-heading text-lg">
              Selected work
            </h2>

            <ul className="mt-3 border-y-2 border-border">
              {PROJECTS.map((project) => (
                <li key={project.title} className="border-b-2 border-border last:border-b-0">
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between gap-6 py-3 hover:bg-secondary-background sm:px-3"
                  >
                    <span className="min-w-0">
                      <span className="block font-heading">{project.title}</span>
                      <span className="mt-1 block text-sm opacity-70">{project.type}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3 text-sm">
                      {project.year}
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <div
            id="contact"
            aria-label="Contact links"
            className="mt-6 flex scroll-mt-16 flex-wrap items-center gap-x-5 gap-y-3 border-t-2 border-border pt-4"
          >
            <Button asChild nativeButton={false} size="sm">
              <a href="mailto:hello@sorahan.design">
                <Mail aria-hidden="true" />
                Email
              </a>
            </Button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm hover:underline"
            >
              GitHub
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm hover:underline"
            >
              LinkedIn
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </main>

      <footer className="border-t-2 border-border">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-4 text-xs sm:px-6">
          <p>(c) 2026 Sora Han</p>
          <a href="#top" className="hover:underline">
            Back to top
          </a>
        </div>
      </footer>
    </div>
  );
}
