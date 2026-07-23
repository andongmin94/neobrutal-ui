import type { TOCItemType } from "fumadocs-core/toc";
import { ExternalLink } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation } from "react-router";

import { COMPONENT_DIRECTORY_LINKS } from "@/data/component-directory";
import { normalizePath } from "~/lib/navigation";
import { DirectoryHome } from "./directory-home";
import { SidebarNav } from "./sidebar-nav";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { TableOfContents } from "./table-of-contents";

const componentPaths = new Set(COMPONENT_DIRECTORY_LINKS.map((link) => normalizePath(link.href)));
const specialPagePaths = new Set(["/styling", "/charts", "/stars", "/templates"]);

export function SiteLayout({
  children,
  description,
  shadcnDocsLink,
  title,
  toc,
}: {
  children?: ReactNode;
  description?: string;
  shadcnDocsLink?: string;
  title: string;
  toc?: TOCItemType[];
}) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const normalizedPath = normalizePath(location.pathname);
  const isDirectoryHome = normalizedPath === "/";
  const isDocsPage = normalizedPath === "/docs" || normalizedPath.startsWith("/docs/");
  const isComponentPage = componentPaths.has(normalizedPath);
  const isSpecialIndexPage = specialPagePaths.has(normalizedPath);
  const isTemplatePreviewPage = normalizedPath.startsWith("/templates/");
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  const menuLabel = useMemo(
    () => (isDocsPage ? "Toggle documentation navigation" : "Toggle site navigation"),
    [isDocsPage],
  );

  useEffect(() => {
    closeMobileMenu();
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>("#main-content")?.focus({ preventScroll: true });
    });
  }, [closeMobileMenu, location.pathname]);

  return (
    <div className="site-frame">
      <SiteHeader
        menuOpen={mobileMenuOpen}
        menuLabel={menuLabel}
        onToggleMenu={() => setMobileMenuOpen((open) => !open)}
      />

      {!isDocsPage && (
        <SidebarNav mode="site" mobileOpen={mobileMenuOpen} onClose={closeMobileMenu} />
      )}

      {isDirectoryHome ? (
        <DirectoryHome />
      ) : isDocsPage ? (
        <div className={isComponentPage ? "docs-frame docs-frame--component" : "docs-frame"}>
          <SidebarNav mobileOpen={mobileMenuOpen} onClose={closeMobileMenu} />

          <main id="main-content" className="docs-main" tabIndex={-1}>
            <header className="docs-page-header">
              <div className="docs-page-kicker">
                <span>{isComponentPage ? "Component reference" : "Project docs"}</span>
                <span aria-hidden="true">/</span>
                <span>{isComponentPage ? "Source owned" : "neobrutal-ui"}</span>
              </div>

              <div className="docs-page-heading">
                <div>
                  <h1>{title}</h1>
                  {description && <p>{description}</p>}
                </div>

                {shadcnDocsLink && (
                  <a
                    className="upstream-link pressable"
                    href={shadcnDocsLink}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Upstream reference
                    <ExternalLink aria-hidden="true" size={14} strokeWidth={2.4} />
                  </a>
                )}
              </div>
            </header>

            <TableOfContents toc={toc} variant="inline" />

            <article
              className={
                isComponentPage
                  ? "docs-content docs-content--component"
                  : "docs-content docs-content--guide"
              }
            >
              {children}
            </article>
          </main>

          <TableOfContents toc={toc} />
        </div>
      ) : (
        <main id="main-content" className="special-main" tabIndex={-1}>
          {isSpecialIndexPage && (
            <header className="special-page-header">
              <div className="special-page-header__inner">
                <div className="docs-page-kicker">
                  <span>Explore</span>
                  <span aria-hidden="true">/</span>
                  <span>neobrutal-ui</span>
                </div>
                <h1>{title}</h1>
                {description && <p>{description}</p>}
              </div>
            </header>
          )}

          <article
            className={
              isSpecialIndexPage ? "special-content special-content--index" : "special-content"
            }
          >
            {children}
          </article>
        </main>
      )}

      {!isTemplatePreviewPage && <SiteFooter />}
    </div>
  );
}
