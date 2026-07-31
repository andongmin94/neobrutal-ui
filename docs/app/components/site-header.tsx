import { Menu, X as CloseIcon } from "lucide-react";
import { Link, useLocation } from "react-router";

import { isNavigationPathActive, PRIMARY_NAVIGATION_LINKS } from "~/lib/navigation";
import { SearchLauncher } from "./search-launcher";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader({
  menuLabel = "Toggle site navigation",
  menuOpen,
  onToggleMenu,
}: {
  menuLabel?: string;
  menuOpen: boolean;
  onToggleMenu: () => void;
}) {
  const location = useLocation();

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

        <Link className="site-brand" to="/" aria-label="neobrutal-ui home">
          <span className="site-brand__mark" aria-hidden="true">
            N
          </span>
          <span className="site-brand__name">neobrutal-ui</span>
        </Link>

        <nav className="primary-nav" aria-label="Primary navigation">
          {PRIMARY_NAVIGATION_LINKS.map((link) => {
            const active = isNavigationPathActive(location.pathname, link.href, true);

            return (
              <Link
                key={link.href}
                to={link.href}
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
            className="icon-button"
            href="https://github.com/andongmin94/neobrutal-ui"
            aria-label="Open GitHub repository"
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
