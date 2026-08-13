import { use } from "react";

import type { Route } from "./+types/page";
import { getMDXComponents } from "~/components/mdx-components";
import { SiteLayout } from "~/components/site-layout";
import { docs, source } from "~/lib/source";
import { SITE_DESCRIPTION, SITE_NAME } from "~/lib/site";

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
  const title = loaderData ? `${loaderData.title} - ${SITE_NAME}` : SITE_NAME;
  const description = loaderData?.description ?? SITE_DESCRIPTION;

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
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
