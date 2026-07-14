// @ts-nocheck
"use client";

import { ListTree } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

interface TocProps {
  items: Array<{
    depth: number;
    value: string;
    id: string;
  }>;
}

export function TableOfContents({ items }: TocProps) {
  const itemIds = React.useMemo(() => items.map((item) => item.id), [items]);
  const activeHeading = useActiveItem(itemIds);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !items?.length) {
    return null;
  }

  return (
    <div className="toc-scrollbar overflow-y-auto p-4">
      <h3 className="flex items-center gap-2 border-b-2 border-border pb-3 text-sm font-heading">
        <ListTree className="size-4" />
        On this page
      </h3>
      <div className="mt-3 space-y-0.5">
        {items.map(({ depth, id, value }) => (
          <a
            key={id}
            href={`#${id}`}
            className={cn(
              "block border-l-4 border-transparent py-2 pr-2 text-sm text-foreground hover:border-border hover:bg-background",
              depth === 2 ? "pl-3" : depth === 3 ? "pl-6" : "pl-9",
              id === activeHeading &&
                "border-border bg-main font-heading text-main-foreground hover:bg-main",
            )}
          >
            {value}
          </a>
        ))}
      </div>
    </div>
  );
}

function useActiveItem(itemIds: string[]) {
  const [activeId, setActiveId] = React.useState(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0% -66%" },
    );

    itemIds?.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      itemIds?.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [itemIds]);

  return activeId;
}
