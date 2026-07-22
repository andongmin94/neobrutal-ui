"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MAIN_SIDEBAR } from "@/data/sidebar-links";

import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="scrollbar fixed top-[70px] hidden h-[calc(100svh-70px)] max-h-[calc(100svh-70px)] w-[260px] overflow-y-auto border-r-2 border-border bg-secondary-background lg:block">
      <nav className="p-3">
        {MAIN_SIDEBAR.map((item, id) => {
          if (typeof item === "string") {
            return (
              <p
                className="mt-5 px-2 pb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground/55 first:mt-1"
                key={id}
              >
                {item}
              </p>
            );
          }

          const active = item.href === pathname;

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "mb-0.5 block border-l-4 border-transparent px-3 py-2 text-sm text-foreground hover:border-border hover:bg-background",
                active &&
                  "border-border bg-main font-heading text-main-foreground hover:bg-main hover:text-main-foreground",
              )}
              href={item.href}
              key={id}
            >
              {item.text}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
