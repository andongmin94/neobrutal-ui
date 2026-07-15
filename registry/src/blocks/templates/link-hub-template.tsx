"use client";

import { AtSign, BookOpen, GitFork, LayoutGrid, Mail, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";

const TEMPLATE_THEME =
  "[color-scheme:light] [--background:#dceafe] [--secondary-background:#fff] [--foreground:#000] [--main-foreground:#000] [--main:#5093fe] [--border:#000] [--ring:#000] [--box-shadow-x:4px] [--box-shadow-y:4px] [--reverse-box-shadow-x:-4px] [--reverse-box-shadow-y:-4px] [--shadow:4px_4px_0px_0px_var(--border)] [--border-radius:5px] [--base-font-weight:400] [--heading-font-weight:600] dark:[color-scheme:dark] dark:[--background:#2c304c] dark:[--secondary-background:#222] dark:[--foreground:#ececec] dark:[--main:#5093fe] dark:[--ring:#fff]";

const LINKS = [
  {
    title: "Portfolio",
    detail: "example.com",
    href: "https://example.com",
    icon: LayoutGrid,
    highlighted: true,
    external: true,
  },
  {
    title: "GitHub",
    detail: "github.com",
    href: "https://github.com",
    icon: GitFork,
    highlighted: false,
    external: true,
  },
  {
    title: "X",
    detail: "x.com",
    href: "https://x.com",
    icon: AtSign,
    highlighted: false,
    external: true,
  },
  {
    title: "Newsletter",
    detail: "buttondown.email",
    href: "https://buttondown.email",
    icon: BookOpen,
    highlighted: false,
    external: true,
  },
  {
    title: "LinkedIn",
    detail: "linkedin.com",
    href: "https://www.linkedin.com",
    icon: UserRound,
    highlighted: false,
    external: true,
  },
  {
    title: "Email",
    detail: "hello@example.com",
    href: "mailto:hello@example.com",
    icon: Mail,
    highlighted: false,
    external: false,
  },
] as const;

export default function LinkHubTemplate() {
  return (
    <div className={`min-h-dvh flex flex-col bg-background text-foreground ${TEMPLATE_THEME}`}>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <section aria-labelledby="profile-name" className="text-center">
          <div className="mx-auto grid size-24 place-items-center rounded-full border-2 border-border bg-main text-main-foreground">
            <span className="font-heading text-2xl" aria-hidden="true">
              AD
            </span>
          </div>

          <h1 id="profile-name" className="mt-4 font-heading text-2xl sm:text-3xl">
            Alex Doe
          </h1>
          <p className="mt-1 text-sm text-foreground/65">@alexbuilds</p>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-foreground/80 sm:text-base">
            Designer and developer sharing small tools, notes, and experiments.
          </p>
        </section>

        <ul className="mt-7 grid gap-3 sm:grid-cols-2">
          {LINKS.map((link) => {
            const LinkIcon = link.icon;

            return (
              <li key={link.title}>
                <Button
                  asChild
                  nativeButton={false}
                  variant={link.highlighted ? "default" : "neutral"}
                  className="h-auto min-h-20 w-full justify-start whitespace-normal p-0 text-left [&_svg]:size-5"
                >
                  <a
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noreferrer" : undefined}
                  >
                    <span className="flex w-full min-w-0 items-center gap-3 p-4">
                      <LinkIcon className="shrink-0" aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block font-heading text-base leading-tight">
                          {link.title}
                        </span>
                        <span className="mt-1 block truncate text-xs opacity-70">
                          {link.detail}
                        </span>
                        {link.external ? <span className="sr-only">Opens in a new tab</span> : null}
                      </span>
                    </span>
                  </a>
                </Button>
              </li>
            );
          })}
        </ul>
      </main>

      <footer className="px-4 py-4 text-center text-xs text-foreground/60">
        <p>(c) 2026 Alex Doe</p>
      </footer>
    </div>
  );
}
