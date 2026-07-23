import { use } from "react";

import type { Route } from "./+types/page";
import { getMDXComponents } from "~/components/mdx-components";
import { SiteLayout } from "~/components/site-layout";
import { docs, source } from "~/lib/source";

export async function loader({ params }: Route.LoaderArgs) {
  const slugs = (params["*"] ?? "").split("/").filter(Boolean);
  const page = source.getPage(slugs);

  if (!page) {
    throw new Response("Not found", { status: 404 });
  }

  return {
    description: page.data.description,
    path: page.path,
    shadcnDocsLink: page.data.shadcnDocsLink,
    title: page.data.title,
    url: page.url,
  };
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return [{ title: "neobrutal-ui" }];

  return [
    { title: `${loaderData.title} - neobrutal-ui` },
    { name: "description", content: loaderData.description ?? "" },
  ];
}

function Content({ description, path, shadcnDocsLink, title }: Route.ComponentProps["loaderData"]) {
  const page = docs.getPage(path);

  if (!page) {
    throw new Error(`Unknown content page: ${path}`);
  }

  const { toc } = use(page.load());
  const MDX = page.body;

  return (
    <SiteLayout description={description} shadcnDocsLink={shadcnDocsLink} title={title} toc={toc}>
      <MDX components={getMDXComponents()} />
    </SiteLayout>
  );
}

export default function Page({ loaderData }: Route.ComponentProps) {
  return <Content {...loaderData} />;
}
