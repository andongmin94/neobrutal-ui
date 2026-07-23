import type { Route } from "./+types/home";
import { SiteLayout } from "~/components/site-layout";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "neobrutal-ui - Component directory" },
    {
      name: "description",
      content: "Browse source-owned neobrutalist React components for Base UI and shadcn.",
    },
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
