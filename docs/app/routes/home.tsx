import type { Route } from "./+types/home";
import { SiteLayout } from "~/components/site-layout";

export function meta(_: Route.MetaArgs) {
  const title = "neobrutal-ui - Component directory";
  const description =
    "Browse editable neobrutalist React components for shadcn, Base UI, and Tailwind CSS.";

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
      description="Browse editable neobrutalist components, recipes, themes, and templates."
      title="Component directory"
    />
  );
}
