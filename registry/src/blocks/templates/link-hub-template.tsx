"use client";

import { AtSign, BookOpen, GitFork, LayoutGrid, Mail, UserRound } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import type { LinkHubLink, LinkHubProfile } from "@/lib/link-hub-data";

const linkIcons = {
  website: LayoutGrid,
  code: GitFork,
  social: AtSign,
  writing: BookOpen,
  profile: UserRound,
  email: Mail,
};

type LinkHubTemplateProps = {
  profile: LinkHubProfile;
  links: readonly LinkHubLink[];
};

export default function LinkHubTemplate({ profile, links }: LinkHubTemplateProps) {
  const [group, setGroup] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<{ email: string; message: string } | null>(null);
  const groups = [...new Set(links.map((link) => link.group))];
  const selectedGroup = group !== null && groups.includes(group) ? group : null;
  const filteredLinks = links.filter(
    (link) => selectedGroup === null || link.group === selectedGroup,
  );

  async function copyEmail() {
    const email = profile.email;
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setCopyState({ email, message: "Email copied." });
    } catch {
      setCopyState({
        email,
        message: "Could not copy. Select the email address above and copy it manually.",
      });
    }
  }

  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground">
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <section aria-labelledby="profile-name" className="text-center">
          <div className="mx-auto grid size-24 place-items-center rounded-full border-2 border-border bg-main text-main-foreground">
            <span className="font-heading text-2xl" aria-hidden="true">
              {profile.initials}
            </span>
          </div>

          <h1 id="profile-name" className="mt-4 font-heading text-2xl sm:text-3xl">
            {profile.name}
          </h1>
          <p className="mt-1 text-sm text-foreground/65">{profile.handle}</p>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-foreground/80 sm:text-base">
            {profile.bio}
          </p>
        </section>

        <div className="mt-7 border-y-2 border-border py-4">
          <p className="text-xs font-heading uppercase tracking-wide">Find your next stop</p>
          <div role="group" aria-label="Filter links" className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={selectedGroup === null ? "default" : "neutral"}
              aria-pressed={selectedGroup === null}
              onClick={() => setGroup(null)}
            >
              All links
            </Button>
            {groups.map((item) => (
              <Button
                key={item}
                type="button"
                size="sm"
                variant={selectedGroup === item ? "default" : "neutral"}
                aria-pressed={selectedGroup === item}
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
            const LinkIcon = link.icon ? linkIcons[link.icon] : null;

            return (
              <li key={link.id}>
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
                    {LinkIcon ? <LinkIcon className="shrink-0" aria-hidden="true" /> : null}
                    <span className="min-w-0 flex-1">
                      <span className="block font-heading text-base leading-tight">
                        {link.title}
                      </span>
                      <span className="mt-1 block truncate text-xs">{link.detail}</span>
                      {link.external ? <span className="sr-only">Opens in a new tab</span> : null}
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
        {profile.email ? (
          <section aria-label="Contact" className="mt-7 border-t-2 border-border pt-5">
            <h2 className="text-base font-heading">Let's build something useful.</h2>
            <p className="mt-2 break-all text-sm text-foreground/75">{profile.email}</p>
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
              {copyState?.email === profile.email ? copyState.message : ""}
            </p>
          </section>
        ) : null}
      </main>

      <footer className="px-4 py-4 text-center text-xs text-foreground/60">
        <p>© {profile.name}</p>
      </footer>
    </div>
  );
}
