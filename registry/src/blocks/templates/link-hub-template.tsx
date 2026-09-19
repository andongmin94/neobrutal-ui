"use client";

import { AtSign, BookOpen, GitFork, LayoutGrid, Mail, UserRound } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";

const LINKS = [
  {
    group: "Work",
    title: "Portfolio",
    detail: "example.com",
    href: "https://example.com",
    icon: LayoutGrid,
    highlighted: true,
    external: true,
  },
  {
    group: "Work",
    title: "GitHub",
    detail: "github.com",
    href: "https://github.com",
    icon: GitFork,
    highlighted: false,
    external: true,
  },
  {
    group: "Connect",
    title: "X",
    detail: "x.com",
    href: "https://x.com",
    icon: AtSign,
    highlighted: false,
    external: true,
  },
  {
    group: "Writing",
    title: "Newsletter",
    detail: "buttondown.email",
    href: "https://buttondown.email",
    icon: BookOpen,
    highlighted: false,
    external: true,
  },
  {
    group: "Connect",
    title: "LinkedIn",
    detail: "linkedin.com",
    href: "https://www.linkedin.com",
    icon: UserRound,
    highlighted: false,
    external: true,
  },
  {
    group: "Connect",
    title: "Email",
    detail: "hello@example.com",
    href: "mailto:hello@example.com",
    icon: Mail,
    highlighted: false,
    external: false,
  },
] as const;

export default function LinkHubTemplate() {
  const [group, setGroup] = useState("All");
  const [copyState, setCopyState] = useState("");
  const filteredLinks = LINKS.filter((link) => group === "All" || link.group === group);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText("hello@example.com");
      setCopyState("Email copied.");
    } catch {
      setCopyState("Could not copy. Select the email address above and copy it manually.");
    }
  }

  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground">
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

        <div className="mt-7 border-y-2 border-border py-4">
          <p className="text-xs font-heading uppercase tracking-wide">Find your next stop</p>
          <div role="group" aria-label="Filter links" className="mt-3 flex flex-wrap gap-2">
            {["All", "Work", "Writing", "Connect"].map((item) => (
              <Button
                key={item}
                type="button"
                size="sm"
                variant={group === item ? "default" : "neutral"}
                aria-pressed={group === item}
                onClick={() => setGroup(item)}
              >
                {item}
              </Button>
            ))}
          </div>
          <p role="status" className="mt-3 text-xs text-foreground/70">
            {filteredLinks.length} {filteredLinks.length === 1 ? "link" : "links"}
          </p>
        </div>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {filteredLinks.map((link) => {
            const LinkIcon = link.icon;

            return (
              <li key={link.title}>
                <a
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noreferrer" : undefined}
                  className={buttonVariants({
                    variant: link.highlighted ? "default" : "neutral",
                    className:
                      "h-auto min-h-20 w-full justify-start whitespace-normal p-0 text-left [&_svg]:size-5",
                  })}
                >
                  <span className="flex w-full min-w-0 items-center gap-3 p-4">
                    <LinkIcon className="shrink-0" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-heading text-base leading-tight">
                        {link.title}
                      </span>
                      <span className="mt-1 block truncate text-xs opacity-70">{link.detail}</span>
                      {link.external ? <span className="sr-only">Opens in a new tab</span> : null}
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
        <section aria-label="Contact" className="mt-7 border-t-2 border-border pt-5">
          <h2 className="text-base font-heading">Let's build something useful.</h2>
          <p className="mt-2 break-all text-sm text-foreground/75">hello@example.com</p>
          <Button
            type="button"
            className="mt-3"
            variant="neutral"
            size="sm"
            onClick={() => void copyEmail()}
          >
            Copy email
          </Button>
          <p role="status" className="mt-3 text-xs leading-5 text-foreground/75">
            {copyState}
          </p>
        </section>
      </main>

      <footer className="px-4 py-4 text-center text-xs text-foreground/60">
        <p>(c) 2026 Alex Doe</p>
      </footer>
    </div>
  );
}
