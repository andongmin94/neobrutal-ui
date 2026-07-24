import type { TOCItemType } from "fumadocs-core/toc";
import { List, MoveUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";

function scrollToHash(hash: string, focusTarget = false) {
  const target = document.getElementById(decodeURIComponent(hash.replace(/^#/, "")));
  if (!target) return;

  window.history.pushState(null, "", hash);
  if (focusTarget) target.focus({ preventScroll: true });
  target.scrollIntoView({ block: "start" });
}

export function TableOfContents({
  toc = [],
  variant = "aside",
}: {
  toc?: TOCItemType[];
  variant?: "aside" | "inline";
}) {
  const location = useLocation();
  const [activeId, setActiveId] = useState("");
  const headers = useMemo(() => toc.filter((item) => item.depth === 2 || item.depth === 3), [toc]);

  useEffect(() => {
    setActiveId("");

    const elements = headers
      .map((header) => document.getElementById(header.url.replace(/^#/, "")))
      .filter((element): element is HTMLElement => Boolean(element));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]?.target.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -68% 0px", threshold: [0, 1] },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [headers, location.pathname]);

  const links = (
    <>
      {headers.length > 0 ? (
        <nav>
          {headers.map((header) => {
            const id = header.url.replace(/^#/, "");
            return (
              <a
                key={header.url}
                className={[
                  activeId === id ? "is-active" : "",
                  header.depth === 3 ? "is-nested" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                href={header.url}
                onClick={(event) => {
                  event.preventDefault();
                  scrollToHash(header.url);
                }}
              >
                {header.title}
              </a>
            );
          })}
        </nav>
      ) : (
        <p className="docs-toc__empty">Overview</p>
      )}

      <a
        className="back-to-top"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          scrollToHash("#main-content", true);
        }}
      >
        <MoveUp aria-hidden="true" size={13} />
        Back to top
      </a>
    </>
  );

  if (variant === "inline") {
    return (
      <details className="docs-toc-inline">
        <summary>
          <span>
            <List aria-hidden="true" size={15} strokeWidth={2.4} />
            On this page
          </span>
          <small>{headers.length} sections</small>
        </summary>
        {links}
      </details>
    );
  }

  return (
    <aside className="docs-toc" aria-label="On this page">
      <div className="docs-toc__inner">
        <h2>
          <List aria-hidden="true" size={14} strokeWidth={2.4} />
          On this page
        </h2>
        {links}
      </div>
    </aside>
  );
}
