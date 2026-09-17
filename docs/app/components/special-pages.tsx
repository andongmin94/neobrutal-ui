import { lazy, Suspense, type ReactNode } from "react";

export type SpecialPageName =
  | "blog-post"
  | "charts"
  | "stars"
  | "styling"
  | "template-detail"
  | "templates";

type SpecialPageRendererProps = {
  argument?: string;
  page: string;
};

const BlogPostPage = lazy(() =>
  import("./template-pages").then((module) => ({ default: module.BlogPostPage })),
);
const ChartsPage = lazy(() => import("@/special-pages/charts-examples"));
const StarsPage = lazy(() => import("./stars-page"));
const StylingPage = lazy(() => import("@/special-pages/styling/controls"));
const TemplateDetailPage = lazy(() =>
  import("./template-pages").then((module) => ({ default: module.TemplateDetailPage })),
);
const TemplatesPage = lazy(() =>
  import("./template-pages").then((module) => ({ default: module.TemplatesPage })),
);

const specialPageAliases: Record<string, SpecialPageName> = {
  blogpost: "blog-post",
  template: "template-detail",
  templatedetail: "template-detail",
};

function normalizeSpecialPageName(page: string): SpecialPageName | undefined {
  const normalizedPage = specialPageAliases[page] ?? page;
  const supportedPages: SpecialPageName[] = [
    "blog-post",
    "charts",
    "stars",
    "styling",
    "template-detail",
    "templates",
  ];

  return supportedPages.find((candidate) => candidate === normalizedPage);
}

function DeferredPage({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <output className="block rounded-base border-2 border-border bg-secondary-background p-6 shadow-shadow">
          Loading page…
        </output>
      }
    >
      {children}
    </Suspense>
  );
}

export function SpecialPageRenderer({ argument, page }: SpecialPageRendererProps) {
  switch (normalizeSpecialPageName(page)) {
    case "styling":
      return (
        <DeferredPage>
          <StylingPage />
        </DeferredPage>
      );
    case "charts":
      return (
        <DeferredPage>
          <ChartsPage />
        </DeferredPage>
      );
    case "stars":
      return (
        <DeferredPage>
          <StarsPage />
        </DeferredPage>
      );
    case "templates":
      return (
        <DeferredPage>
          <TemplatesPage />
        </DeferredPage>
      );
    case "template-detail":
      return (
        <DeferredPage>
          <TemplateDetailPage slug={argument} />
        </DeferredPage>
      );
    case "blog-post":
      return (
        <DeferredPage>
          <BlogPostPage slug={argument} />
        </DeferredPage>
      );
    default:
      throw new Error(`Unsupported special page: ${page || "(empty)"}`);
  }
}
