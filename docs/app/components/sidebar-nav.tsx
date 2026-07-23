import { BookOpen, Box, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

import { COMPONENT_DIRECTORY_LINKS } from "@/data/component-directory";
import { trapTabFocus } from "~/lib/focus";
import { isNavigationPathActive, SITE_NAVIGATION_LINKS } from "~/lib/navigation";

const documentGroups = [
  {
    label: "Getting started",
    links: [
      { href: "/docs", text: "Introduction" },
      { href: "/docs/installation", text: "Installation" },
      { href: "/docs/registry", text: "Registry" },
    ],
  },
  {
    label: "Foundation",
    links: [{ href: "/docs/design-tokens", text: "Design tokens" }],
  },
];

const siteGroups = [
  {
    label: "Explore",
    links: SITE_NAVIGATION_LINKS,
  },
  {
    label: "Project",
    links: [
      { href: "/docs/stars", text: "Stars data" },
      { href: "/docs/resources", text: "Resources" },
      { href: "/docs/credits", text: "Credits & license" },
    ],
  },
];

const projectLinks = [
  { href: "/docs/stars", text: "Stars" },
  { href: "/docs/resources", text: "Resources" },
  { href: "/docs/credits", text: "Credits & license" },
];

export function SidebarNav({
  mobileOpen,
  mode = "docs",
  onClose,
}: {
  mobileOpen: boolean;
  mode?: "docs" | "site";
  onClose: () => void;
}) {
  const location = useLocation();
  const sidebar = useRef<HTMLElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const [componentQuery, setComponentQuery] = useState("");
  const navigationLabel = mode === "site" ? "Site navigation" : "Documentation navigation";

  const filteredComponents = useMemo(() => {
    const query = componentQuery.trim().toLowerCase();
    if (!query) return COMPONENT_DIRECTORY_LINKS;

    return COMPONENT_DIRECTORY_LINKS.filter((link) => link.text.toLowerCase().includes(query));
  }, [componentQuery]);

  function isActive(href: string) {
    return isNavigationPathActive(location.pathname, href);
  }

  const setBackgroundInert = useCallback(
    (inert: boolean) => {
      const selectors =
        mode === "site"
          ? [".site-header", "#main-content"]
          : [".site-header", ".docs-main", ".docs-toc"];

      for (const selector of selectors) {
        document.querySelector<HTMLElement>(selector)?.toggleAttribute("inert", inert);
      }
    },
    [mode],
  );

  const closeAndRestoreFocus = useCallback(() => {
    onClose();
    requestAnimationFrame(() =>
      document.querySelector<HTMLButtonElement>(".mobile-menu-button")?.focus(),
    );
  }, [onClose]);

  const revealActiveLink = useCallback(() => {
    requestAnimationFrame(() => {
      const container = sidebar.current;
      const activeLink = container?.querySelector<HTMLElement>('a[aria-current="page"]');
      if (!container || !activeLink) return;

      const containerRect = container.getBoundingClientRect();
      const activeRect = activeLink.getBoundingClientRect();
      const edgePadding = 24;
      const visible =
        activeRect.top >= containerRect.top + edgePadding &&
        activeRect.bottom <= containerRect.bottom - edgePadding;

      if (!visible) {
        container.scrollTo({
          top:
            container.scrollTop +
            activeRect.top -
            containerRect.top -
            containerRect.height / 2 +
            activeRect.height / 2,
        });
      }
    });
  }, []);

  useEffect(() => {
    const viewport = window.matchMedia("(max-width: 1023px)");

    function onViewportChange(event: MediaQueryListEvent) {
      if (!event.matches && mobileOpen) onClose();
    }

    viewport.addEventListener("change", onViewportChange);
    if (!viewport.matches && mobileOpen) onClose();

    return () => viewport.removeEventListener("change", onViewportChange);
  }, [mobileOpen, onClose]);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", mobileOpen);
    setBackgroundInert(mobileOpen);

    if (mobileOpen) {
      requestAnimationFrame(() => {
        if (mode === "docs") searchInput.current?.focus();
        else sidebar.current?.querySelector<HTMLAnchorElement>(".docs-nav a")?.focus();
      });
    }

    return () => {
      document.documentElement.classList.remove("menu-open");
      setBackgroundInert(false);
    };
  }, [mobileOpen, mode, setBackgroundInert]);

  useEffect(() => {
    const container = sidebar.current;
    if (!mobileOpen || !container) return;

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeAndRestoreFocus();
        return;
      }

      trapTabFocus(event);
    }

    container.addEventListener("keydown", onKeyDown);
    return () => container.removeEventListener("keydown", onKeyDown);
  }, [closeAndRestoreFocus, mobileOpen]);

  useEffect(() => {
    onClose();
    revealActiveLink();
  }, [location.pathname, onClose, revealActiveLink]);

  return (
    <>
      {mobileOpen && (
        <button
          className="sidebar-scrim"
          type="button"
          aria-label={`Close ${navigationLabel.toLowerCase()}`}
          onClick={closeAndRestoreFocus}
        />
      )}

      <aside
        ref={sidebar}
        className={[
          "docs-sidebar",
          mode === "site" ? "docs-sidebar--site" : "",
          mobileOpen ? "is-open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label={navigationLabel}
        role={mobileOpen ? "dialog" : undefined}
        aria-modal={mobileOpen ? true : undefined}
      >
        <div className="docs-sidebar__mobile-head">
          <strong>{mode === "site" ? "Browse site" : "Browse docs"}</strong>
          <button
            className="icon-button"
            type="button"
            aria-label="Close navigation"
            onClick={closeAndRestoreFocus}
          >
            <X aria-hidden="true" size={18} strokeWidth={2.4} />
          </button>
        </div>

        <nav className="docs-nav">
          {mode === "site" ? (
            siteGroups.map((group) => (
              <section key={group.label} className="docs-nav__group">
                <h2>
                  <BookOpen aria-hidden="true" size={13} />
                  {group.label}
                </h2>
                {group.links.map((link) => {
                  const active = isActive(link.href);
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
              </section>
            ))
          ) : (
            <>
              <section className="docs-nav__group docs-nav__mobile-site">
                <h2>
                  <BookOpen aria-hidden="true" size={13} />
                  Explore site
                </h2>
                {SITE_NAVIGATION_LINKS.map((link) => {
                  const active = isActive(link.href);
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
              </section>

              {documentGroups.map((group) => (
                <section key={group.label} className="docs-nav__group">
                  <h2>
                    <BookOpen aria-hidden="true" size={13} />
                    {group.label}
                  </h2>
                  {group.links.map((link) => {
                    const active = isActive(link.href);
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
                </section>
              ))}

              <section className="docs-nav__group docs-nav__components">
                <div className="docs-nav__group-heading">
                  <h2>
                    <Box aria-hidden="true" size={13} />
                    Components
                  </h2>
                  <span>
                    {filteredComponents.length}/{COMPONENT_DIRECTORY_LINKS.length}
                  </span>
                </div>

                <label className="sidebar-filter">
                  <Search aria-hidden="true" size={14} />
                  <input
                    ref={searchInput}
                    value={componentQuery}
                    type="search"
                    placeholder="Filter components"
                    aria-label="Filter components"
                    onChange={(event) => setComponentQuery(event.target.value)}
                  />
                </label>

                <div className="component-nav-list">
                  {filteredComponents.map((link) => {
                    const active = isActive(link.href);
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
                  {filteredComponents.length === 0 && (
                    <p className="component-nav-empty">No matches</p>
                  )}
                </div>
              </section>

              <section className="docs-nav__group">
                <h2>Project</h2>
                {projectLinks.map((link) => {
                  const active = isActive(link.href);
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
              </section>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
