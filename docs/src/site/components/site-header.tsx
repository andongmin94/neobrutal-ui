"use client";

import { Link, useRouter } from "fumapress/client";
import { Menu, Star, X as CloseIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { isNavigationPathActive, PRIMARY_NAVIGATION_LINKS } from "@/site/lib/navigation";
import { SearchLauncher } from "./search-launcher";
import { ThemeToggle } from "./theme-toggle";

const GITHUB_REPOSITORY_URL = "https://github.com/andongmin94/neobrutal-ui";
const GITHUB_STARS_URL = "/api/github-stars";

let githubStarsRequest: Promise<number | null> | undefined;

function getGitHubStars() {
  if (typeof window === "undefined") return Promise.resolve(null);

  githubStarsRequest ??= fetch(GITHUB_STARS_URL)
    .then(async (response) => {
      if (!response.ok) return null;
      const payload = await response.json();
      return typeof payload.count === "number" ? payload.count : null;
    })
    .catch(() => null);

  return githubStarsRequest;
}

function formatGitHubStars(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function useGitHubStars() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    void getGitHubStars().then((value) => {
      if (active) setStars(value);
    });
    return () => {
      active = false;
    };
  }, []);

  return stars;
}

export function SiteHeader({
  menuLabel = "Toggle site navigation",
  menuOpen,
  onToggleMenu,
}: {
  menuLabel?: string;
  menuOpen: boolean;
  onToggleMenu: () => void;
}) {
  const { path: pathname } = useRouter();
  const githubStars = useGitHubStars();
  const githubLabel =
    githubStars === null
      ? "Open GitHub repository"
      : `Open GitHub repository, ${new Intl.NumberFormat("en-US").format(githubStars)} stars`;

  return (
    <header className="site-header" data-site-navbar>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <div className="site-header__inner">
        <button
          className="icon-button mobile-menu-button"
          type="button"
          aria-expanded={menuOpen}
          aria-label={menuLabel}
          onClick={onToggleMenu}
        >
          {menuOpen ? (
            <CloseIcon aria-hidden="true" size={19} strokeWidth={2.4} />
          ) : (
            <Menu aria-hidden="true" size={19} strokeWidth={2.4} />
          )}
        </button>

        <Link className="site-brand" href="/" aria-label="neobrutal-ui home">
          <span className="site-brand__mark" aria-hidden="true">
            N
          </span>
          <span className="site-brand__name">neobrutal-ui</span>
        </Link>

        <nav className="primary-nav" aria-label="Primary navigation">
          {PRIMARY_NAVIGATION_LINKS.map((link) => {
            const active = isNavigationPathActive(pathname, link.href, true);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={active ? "is-active" : undefined}
              >
                {link.text}
              </Link>
            );
          })}
        </nav>

        <div className="site-actions">
          <SearchLauncher />
          <a
            className="github-repo-button pressable"
            href={GITHUB_REPOSITORY_URL}
            aria-label={githubLabel}
            rel="noreferrer"
            target="_blank"
            title="GitHub"
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24">
              <path
                d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z"
                fill="currentColor"
              />
            </svg>
            <span className="github-repo-button__stars" data-github-stars aria-hidden="true">
              <Star size={13} strokeWidth={2.4} />
              {githubStars === null ? "—" : formatGitHubStars(githubStars)}
            </span>
          </a>
          <a
            className="icon-button"
            href="https://x.com/andongmin94"
            aria-label="Open andongmin94 on X"
            rel="noreferrer"
            target="_blank"
            title="X"
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24">
              <path
                d="M18.9 2H22l-6.8 7.8L23.2 22H17l-4.9-6.4L6.5 22H3.4l7.3-8.3L1 2h6.4l4.4 5.8L18.9 2Zm-1.1 17.8h1.7L6.5 4.1H4.7l13.1 15.7Z"
                fill="currentColor"
              />
            </svg>
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
