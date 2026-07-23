import { lazy, Suspense } from "react";

import { ClientOnly } from "./client-only";
import { PreviewErrorBoundary } from "./preview-error-boundary";

const LazySpecialPage = lazy(async () => {
  const module = await import("./special-pages");
  return { default: module.SpecialPageRenderer };
});

export function SpecialPage({ kind, slug }: { kind: string; slug?: string }) {
  const fallback = (
    <output className="react-host__status special-page-loading">Loading page...</output>
  );

  return (
    <ClientOnly fallback={fallback}>
      <PreviewErrorBoundary>
        <Suspense fallback={fallback}>
          <LazySpecialPage argument={slug} page={kind} />
        </Suspense>
      </PreviewErrorBoundary>
    </ClientOnly>
  );
}
