import type { Route } from "./+types/home";
import { SiteLayout } from "~/components/site-layout";

export function meta(_: Route.MetaArgs) {
  const title = "neobrutal-ui - Component directory";
  const description = "Browse source-owned neobrutalist React components for Base UI and shadcn.";

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
}

export default function Home() {
  return (
    <SiteLayout
      description="Browse 49 neobrutalist components for the shadcn registry and Base UI."
      title="Component directory"
    />
  );
}
