import type { Route } from "./+types/home";
import { SiteLayout } from "~/components/site-layout";

export function meta(_: Route.MetaArgs) {
  const title = "neobrutal-ui - Component directory";
  const description =
    "Neobrutalist React UI with staged press feedback, clear selection, and editable screen templates.";

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
      description="Build clear interfaces with bold controls, shared themes, and editable templates."
      title="Component directory"
    />
  );
}
