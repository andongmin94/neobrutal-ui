"use client";

import type { TOCItemType } from "fumadocs-core/toc";
import { List, MoveUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "fumapress/client";

export function TableOfContents({
  toc = [],
  variant = "aside",
}: {
  toc?: TOCItemType[];
  variant?: "aside" | "inline";
}) {
  const { path: pathname } = useRouter();
  const [activeId, setActiveId] = useState("");
  const headers = useMemo(() => toc.filter((item) => item.depth === 2 || item.depth === 3), [toc]);

  useEffect(() => {
    setActiveId("");

    const elements = headers
      .map((header) => document.getElementById(header.url.replace(/^#/, "")))
      .filter((element): element is HTMLElement => Boolean(element));

    if (elements.length === 0) return;

    // Use the same offset as native heading links, including anchor rounding.
    const scrollOffset = Number.parseFloat(getComputedStyle(elements[0]).scrollMarginTop) + 1;
    let frame = 0;

    function updateActive() {
      frame = 0;
      let current = "";
      for (const element of elements) {
        if (element.getBoundingClientRect().top > scrollOffset) break;
        current = element.id;
      }
      setActiveId(current);
    }

    function scheduleUpdate() {
      if (!frame) frame = requestAnimationFrame(updateActive);
    }

    updateActive();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      cancelAnimationFrame(frame);
    };
  }, [headers, pathname]);

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
              >
                {header.title}
              </a>
            );
          })}
        </nav>
      ) : (
        <p className="docs-toc__empty">Overview</p>
      )}

      <a className="back-to-top" href="#main-content">
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
