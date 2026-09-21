"use client";

import { lazy, Suspense, type ReactNode } from "react";

import { ClientOnly } from "./client-only";
import { PreviewErrorBoundary } from "./preview-error-boundary";

export type SpecialPageName = "blog-post" | "charts" | "styling" | "template-detail" | "templates";

const BlogPostPage = lazy(() =>
  import("./template-pages").then((module) => ({ default: module.BlogPostPage })),
);
const ChartsPage = lazy(() => import("@/special-pages/charts-examples"));
const StylingPage = lazy(() => import("@/special-pages/styling/controls"));
const TemplateDetailPage = lazy(() =>
  import("./template-pages").then((module) => ({ default: module.TemplateDetailPage })),
);
const TemplatesPage = lazy(() =>
  import("./template-pages").then((module) => ({ default: module.TemplatesPage })),
);

function renderPage(kind: SpecialPageName, slug?: string): ReactNode {
  switch (kind) {
    case "blog-post":
      return <BlogPostPage slug={slug} />;
    case "charts":
      return <ChartsPage />;
    case "styling":
      return <StylingPage />;
    case "template-detail":
      return <TemplateDetailPage slug={slug} />;
    case "templates":
      return <TemplatesPage />;
  }
}

export function SpecialPage({ kind, slug }: { kind: SpecialPageName; slug?: string }) {
  const fallback = (
    <output className="react-host__status special-page-loading">Loading page...</output>
  );

  return (
    <ClientOnly fallback={fallback}>
      <PreviewErrorBoundary>
        <Suspense fallback={fallback}>{renderPage(kind, slug)}</Suspense>
      </PreviewErrorBoundary>
    </ClientOnly>
  );
}
