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

export default function PaginationDemo() {
  const [page, setPage] = React.useState(2);
  const tokens = getPageTokens(page);

  const selectPage = (event: React.MouseEvent<HTMLAnchorElement>, nextPage: number) => {
    event.preventDefault();
    setPage(nextPage);
    window.history.replaceState(window.history.state, "", `?page=${nextPage}`);
  };

  return (
    <Pagination aria-label={`Pagination, page ${page} of ${pageCount}`}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            text="Prev"
            href={`?page=${Math.max(1, page - 1)}`}
            aria-disabled={page === 1}
            tabIndex={page === 1 ? -1 : undefined}
            onClick={(event) => selectPage(event, Math.max(1, page - 1))}
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
                onClick={(event) => selectPage(event, token)}
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
            href={`?page=${Math.min(pageCount, page + 1)}`}
            aria-disabled={page === pageCount}
            tabIndex={page === pageCount ? -1 : undefined}
            onClick={(event) => selectPage(event, Math.min(pageCount, page + 1))}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
