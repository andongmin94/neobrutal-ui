"use client";

import { ArrowUpRight, ChevronDown, Mail } from "lucide-react";

import { buttonVariants } from "@/components/ui/button-variants";

const NAV_ITEMS = [
  { label: "Work", href: "#work" },
  { label: "Contact", href: "#contact" },
] as const;

const PROJECTS = [
  {
    challenge: "Dispatchers needed to distinguish urgent route changes from routine updates.",
    approach: "Mapped the handoff between planning and dispatch, then prototyped one shared queue.",
    deliverables: "Workflow map, interaction prototype, accessible React workspace.",
    outcome: "A single view of ownership, exceptions, and the next action for each route.",
    title: "Wayline",
    type: "Product design and front-end",
    year: "2026",
    summary: "A dispatch planning workspace that turns route changes into clear next actions.",
  },
  {
    challenge: "Monthly reporting scattered assumptions across tables, slides, and messages.",
    approach: "Designed a common review structure with comparable periods and visible definitions.",
    deliverables: "Reporting model, chart language, reusable review components.",
    outcome: "Reviewers can trace each summary back to its source and see unresolved questions.",
    title: "Ledgerline",
    type: "Product design",
    year: "2025",
    summary: "A calm reporting system for finance teams reviewing a busy monthly close.",
  },
  {
    challenge: "A growing collection of public resources was difficult to browse and maintain.",
    approach: "Organized resources around user tasks and tested search, filters, and empty states.",
    deliverables: "Information architecture, responsive directory, keyboard interaction checks.",
    outcome: "A searchable directory with clear categories and maintainable contribution rules.",
    title: "Open Index",
    type: "Web design and development",
    year: "2025",
    summary: "An accessible public directory for shared tools, datasets, and practical guides.",
  },
] as const;

export default function PortfolioTemplate() {
  return (
    <div
      id="top"
      className="min-h-dvh flex flex-col bg-background text-foreground selection:bg-main selection:text-main-foreground"
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
            <p className="mb-3 font-mono text-xs uppercase tracking-widest">
              Independent practice / Seoul
            </p>
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

          <dl className="mt-7 grid gap-4 border-y-2 border-border py-5 sm:grid-cols-3">
            {[
              [
                "01 / Frame",
                "Product direction",
                "Scope, workflows, and information architecture.",
              ],
              [
                "02 / Shape",
                "Interface systems",
                "Components, interaction states, and visual language.",
              ],
              [
                "03 / Ship",
                "Front-end delivery",
                "Responsive React interfaces and usability checks.",
              ],
            ].map(([step, title, detail]) => (
              <div key={step}>
                <dt className="text-xs text-foreground/70">{step}</dt>
                <dd className="mt-2 text-sm font-heading">{title}</dd>
                <dd className="mt-1 text-xs leading-5 text-foreground/75">{detail}</dd>
              </div>
            ))}
          </dl>

          <section id="work" aria-labelledby="work-title" className="mt-9 scroll-mt-16">
            <h2 id="work-title" className="font-heading text-lg">
              Selected work
            </h2>

            <ul className="mt-3 border-y-2 border-border">
              {PROJECTS.map((project) => (
                <li key={project.title} className="border-b-2 border-border last:border-b-0">
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-3 hover:bg-secondary-background sm:px-3 [&::-webkit-details-marker]:hidden">
                      <span className="min-w-0">
                        <span className="block font-heading">{project.title}</span>
                        <span className="mt-1 block text-sm opacity-70">{project.type}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-3 text-sm">
                        {project.year}
                        <ChevronDown
                          className="size-4 transition-transform group-open:rotate-180"
                          aria-hidden="true"
                        />
                      </span>
                    </summary>
                    <p className="border-t-2 border-border px-0 py-3 text-sm leading-relaxed text-foreground/75 sm:px-3">
                      {project.summary}
                    </p>
                    <dl className="grid gap-5 bg-secondary-background p-4 sm:grid-cols-2 sm:p-5">
                      {[
                        ["The challenge", project.challenge],
                        ["The approach", project.approach],
                        ["Delivered", project.deliverables],
                        ["The outcome", project.outcome],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <dt className="text-xs font-heading uppercase tracking-wide">{label}</dt>
                          <dd className="mt-2 text-sm leading-6 text-foreground/80">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </details>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-9" aria-label="Start a project">
            <h2 className="text-xl font-heading">Have a complex workflow to simplify?</h2>
            <p className="mt-2 text-sm leading-6 text-foreground/75">
              Tell me about the people using it, the current friction, and what a useful first
              release would do.
            </p>
          </section>
          <div
            id="contact"
            aria-label="Contact links"
            className="mt-6 flex scroll-mt-16 flex-wrap items-center gap-x-5 gap-y-3 border-t-2 border-border pt-4"
          >
            <a href="mailto:hello@example.com" className={buttonVariants({ size: "sm" })}>
              <Mail aria-hidden="true" />
              Email
            </a>
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
