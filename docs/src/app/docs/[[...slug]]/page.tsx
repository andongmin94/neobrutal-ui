import "@/styling/code.css";

import { docs } from "@docs";
import { ExternalLink } from "lucide-react";

import Link from "next/link";
import { notFound } from "next/navigation";

import { MAIN_SIDEBAR } from "@/data/sidebar-links";

import { MDXContent, MDXTableOfContents } from "@/components/app/mdx-components";
import Pagination from "@/components/app/pagination";
import { TableOfContents } from "@/components/app/toc";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DocPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateMetadata(props: DocPageProps) {
  const doc = await getDocFromParams(props);
  if (doc == null) return {};
  return { title: doc.title, description: doc.description };
}

export async function generateStaticParams(): Promise<
  {
    slug: string[];
  }[]
> {
  return docs.map((doc) => ({
    slug: doc.slugAsParams.split("/"),
  }));
}

async function getDocFromParams({ params }: DocPageProps) {
  const slug = (await params).slug?.join("/") || "";
  const doc = docs.find((doc) => doc.slugAsParams === slug);

  if (!doc) {
    return null;
  }

  return doc;
}

interface TOCItem {
  depth: number;
  value: string;
  id: string;
}

function transformTableOfContents(items: any[]): TOCItem[] {
  const flattened: TOCItem[] = [];

  items.forEach((item) => {
    flattened.push({
      depth: item.depth,
      value: item.value,
      id: item.id,
    });

    if (item.children) {
      flattened.push(...transformTableOfContents(item.children));
    }
  });

  return flattened;
}

export default async function DocPage(props: DocPageProps) {
  const doc = await getDocFromParams(props);
  if (doc == null) notFound();

  const { description, title, body, shadcnDocsLink, slug, slugAsParams } = doc;

  const filteredSidebar = MAIN_SIDEBAR.filter(
    (item): item is { href: string; text: string } => typeof item === "object",
  );

  const currentIndex = filteredSidebar.findIndex((item) => {
    const isIndex = slugAsParams === "";

    if (isIndex) {
      return item.href === "/docs";
    }

    return item.href === "/docs/" + slugAsParams;
  });

  const prevItem = filteredSidebar[currentIndex - 1];
  const nextItem = filteredSidebar[currentIndex + 1];

  const rawTableOfContents = MDXTableOfContents({ code: body });
  const tableOfContents = transformTableOfContents(rawTableOfContents);

  const paginationProps = {
    prev: prevItem ? { name: prevItem.text, path: prevItem.href } : undefined,
    next: nextItem ? { name: nextItem.text, path: nextItem.href } : undefined,
  };

  const isTocEmpty = tableOfContents.length < 2;
  const directorySection = slug.startsWith("components/") ? "Components" : "Documentation";

  return (
    <div className="docs min-h-[100dvh] w-full bg-background pt-[70px]">
      <div className={cn("lg:ml-[260px]", !isTocEmpty && "xl:mr-[240px]")}>
        <header className="border-b-2 border-border bg-main px-5 py-10 text-main-foreground sm:py-12 lg:px-10">
          <div className="mx-auto max-w-[960px]">
            <div className="mb-5 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">
              <Link className="underline-offset-4 hover:underline" href="/">
                Directory
              </Link>
              <span className="opacity-45">/</span>
              <span>{directorySection}</span>
            </div>
            <h1 className="text-4xl font-black leading-none sm:text-5xl">{title}</h1>
            {description && (
              <p className="mt-5 max-w-3xl text-base leading-7 sm:text-lg">{description}</p>
            )}
            {shadcnDocsLink && (
              <a className="mt-6 inline-flex" href={shadcnDocsLink} target="_blank">
                <Badge className="gap-2 bg-secondary-background text-foreground" variant="neutral">
                  shadcn/ui docs
                  <ExternalLink />
                </Badge>
              </a>
            )}
          </div>
        </header>

        <div className="px-5 py-12 leading-relaxed prose-p:mt-6 prose-p:text-foreground prose-headings:scroll-mt-32 prose-headings:font-heading prose-h2:mt-10 prose-h2:mb-6 prose-h2:text-xl prose-h3:mt-8 prose-h3:mb-6 prose-h3:text-lg prose-ul:list-disc prose-ul:pl-5 prose-li:mt-2 prose-li:text-sm prose-li:font-base prose-p:text-sm prose-p:leading-7 prose-p:font-base prose-code:mx-0.5 prose-code:break-normal prose-code:rounded-base prose-code:border prose-code:border-border prose-code:bg-main prose-code:px-[5px] prose-code:py-[3px] prose-code:text-sm prose-code:font-bold prose-code:text-main-foreground prose-a:font-heading prose-a:underline sm:py-16 sm:prose-h2:text-2xl sm:prose-h3:text-xl sm:prose-li:text-base sm:prose-p:text-base lg:px-10">
          <div className="mx-auto w-full max-w-[760px]">
            <article>
              <MDXContent code={body} />

              <div className="mt-14">
                <Pagination {...paginationProps} />
              </div>
            </article>
          </div>
        </div>
      </div>

      {!isTocEmpty && (
        <aside className="fixed right-0 top-[70px] hidden h-[calc(100svh-70px)] w-[240px] flex-col justify-between overflow-y-auto border-l-2 border-l-border bg-secondary-background xl:flex">
          <TableOfContents items={tableOfContents} />
        </aside>
      )}
    </div>
  );
}
