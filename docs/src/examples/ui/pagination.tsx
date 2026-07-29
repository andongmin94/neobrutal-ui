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

export default function PaginationDemo() {
  const [page, setPage] = React.useState(2);

  const selectPage = (event: React.MouseEvent<HTMLAnchorElement>, nextPage: number) => {
    event.preventDefault();
    setPage(nextPage);
    window.history.replaceState(window.history.state, "", `?page=${nextPage}`);
  };

  return (
    <Pagination aria-label={`Pagination, page ${page} of 3`}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={`?page=${Math.max(1, page - 1)}`}
            aria-disabled={page === 1}
            tabIndex={page === 1 ? -1 : undefined}
            onClick={(event) => selectPage(event, Math.max(1, page - 1))}
          />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            href="?page=1"
            isActive={page === 1}
            onClick={(event) => selectPage(event, 1)}
          >
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            href="?page=2"
            isActive={page === 2}
            onClick={(event) => selectPage(event, 2)}
          >
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem className="hidden md:block">
          <PaginationLink
            href="?page=3"
            isActive={page === 3}
            onClick={(event) => selectPage(event, 3)}
          >
            3
          </PaginationLink>
        </PaginationItem>
        {page < 3 ? (
          <PaginationItem className="hidden md:block">
            <PaginationEllipsis />
          </PaginationItem>
        ) : null}
        <PaginationItem>
          <PaginationNext
            href={`?page=${Math.min(3, page + 1)}`}
            aria-disabled={page === 3}
            tabIndex={page === 3 ? -1 : undefined}
            onClick={(event) => selectPage(event, Math.min(3, page + 1))}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
