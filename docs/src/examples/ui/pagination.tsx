"use client";

import * as React from "react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const pageCount = 7;
type PageToken = number | "start-ellipsis" | "end-ellipsis";

function getPageTokens(page: number): PageToken[] {
  const visible = [...new Set([1, page - 1, page, page + 1, pageCount])]
    .filter((value) => value >= 1 && value <= pageCount)
    .sort((a, b) => a - b);
  const tokens: PageToken[] = [];

  visible.forEach((value, index) => {
    const previous = visible[index - 1];
    if (index > 0 && value - previous > 1) {
      tokens.push(previous === 1 ? "start-ellipsis" : "end-ellipsis");
    }
    tokens.push(value);
  });

  return tokens;
}

function getCurrentPage() {
  const page = Number(new URLSearchParams(window.location.search).get("page"));
  return Number.isInteger(page) && page >= 1 && page <= pageCount ? page : 2;
}

function subscribeToNavigation(update: () => void) {
  window.addEventListener("popstate", update);
  return () => window.removeEventListener("popstate", update);
}

export default function PaginationDemo() {
  const page = React.useSyncExternalStore(subscribeToNavigation, getCurrentPage, () => 2);
  const tokens = getPageTokens(page);

  return (
    <Pagination aria-label={`Pagination, page ${page} of ${pageCount}`}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            text="Prev"
            href={page === 1 ? undefined : `?page=${page - 1}`}
            aria-disabled={page === 1}
            tabIndex={page === 1 ? -1 : undefined}
          />
        </PaginationItem>
        {tokens.map((token) =>
          typeof token === "number" ? (
            <PaginationItem key={token}>
              <PaginationLink
                href={`?page=${token}`}
                isActive={page === token}
                aria-label={`Go to page ${token}`}
                className={
                  token !== 1 && token !== page && token !== pageCount
                    ? "hidden sm:inline-flex"
                    : undefined
                }
              >
                {token}
              </PaginationLink>
            </PaginationItem>
          ) : (
            <PaginationItem key={token} className="hidden sm:block">
              <PaginationEllipsis />
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            href={page === pageCount ? undefined : `?page=${page + 1}`}
            aria-disabled={page === pageCount}
            tabIndex={page === pageCount ? -1 : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
