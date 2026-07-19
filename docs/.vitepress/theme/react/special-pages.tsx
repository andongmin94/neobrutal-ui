import { useState, type ComponentType } from "react";

import BlogPostTemplate from "../../../src/components/templates/blog-post-template";
import BlogTemplate from "../../../src/components/templates/blog-template";
import CmsTemplate from "../../../src/components/templates/cms-template";
import LinkHubTemplate from "../../../src/components/templates/link-hub-template";
import PortfolioTemplate from "../../../src/components/templates/portfolio-template";
import STARS from "../../../src/data/stars";
import TEMPLATES from "../../../src/data/templates";
import { getBlogPost } from "../../../src/lib/blog-posts";
import ChartsExamples from "../../../src/special-pages/charts-examples";
import StylingControls from "../../../src/special-pages/styling/controls";
import StylingExamples from "../../../src/special-pages/styling/example-components";

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

const templateComponents: Record<string, ComponentType> = {
  cms: CmsTemplate,
  links: LinkHubTemplate,
  portfolio: PortfolioTemplate,
};

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

async function copyText(value: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  if (typeof document === "undefined") {
    throw new Error("Clipboard access is only available in the browser.");
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function StylingPage() {
  return (
    <div className="not-prose space-y-12">
      <div className="flex justify-center">
        <StylingControls />
      </div>
      <StylingExamples />
    </div>
  );
}

function StarsPage() {
  const [copied, setCopied] = useState<number | null>(null);

  const handleCopy = async (index: number, code: string) => {
    await copyText(code);
    setCopied(index);
    globalThis.setTimeout(() => setCopied((current) => (current === index ? null : current)), 1600);
  };

  return (
    <div className="not-prose grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {STARS.map((star, index) => {
        const Star = star.componentExample;

        return (
          <article
            className="flex flex-col items-center justify-center gap-4 rounded-base border-2 border-border bg-secondary-background p-5 shadow-shadow"
            key={index}
          >
            <div className="size-[120px] md:size-[160px]">
              <Star />
            </div>
            <h2 className="m-0 font-heading text-base">Star {index + 1}</h2>
            <button
              type="button"
              className="border-2 border-border bg-main px-3 py-2 font-heading text-main-foreground shadow-shadow transition-[translate,box-shadow] hover:translate-x-pressX hover:translate-y-pressY hover:shadow-press"
              onClick={() => void handleCopy(index, star.code)}
            >
              {copied === index ? "Copied" : "Copy source"}
            </button>
          </article>
        );
      })}
    </div>
  );
}

function TemplatesPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (slug: string, command: string) => {
    await copyText(command);
    setCopied(slug);
    globalThis.setTimeout(() => setCopied((current) => (current === slug ? null : current)), 1600);
  };

  return (
    <div className="not-prose grid gap-6 md:grid-cols-2">
      {TEMPLATES.map((template) => (
        <article
          className="overflow-hidden rounded-base border-2 border-border bg-secondary-background shadow-shadow"
          key={template.slug}
        >
          <a
            aria-label={`Open ${template.title} template`}
            className="block border-b-2 border-border bg-background"
            href={`/templates/${template.slug}`}
          >
            <img
              alt=""
              className="aspect-video w-full object-cover"
              loading="lazy"
              src={template.preview}
            />
          </a>
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="m-0 font-heading text-xl">{template.title}</h2>
                <p className="mt-2 text-sm leading-6 opacity-75">{template.description}</p>
              </div>
              <span
                aria-hidden="true"
                className="size-6 shrink-0 rounded-full border-2 border-border"
                style={{ backgroundColor: template.color }}
              />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <a
                className="border-2 border-border bg-main px-3 py-2 text-center font-heading text-main-foreground shadow-shadow transition-[translate,box-shadow] hover:translate-x-pressX hover:translate-y-pressY hover:shadow-press"
                href={`/templates/${template.slug}`}
              >
                Open
              </a>
              <button
                type="button"
                className="border-2 border-border bg-secondary-background px-3 py-2 font-heading shadow-shadow transition-[translate,box-shadow] hover:translate-x-pressX hover:translate-y-pressY hover:shadow-press"
                onClick={() => void handleCopy(template.slug, template.installCommand)}
              >
                {copied === template.slug ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function TemplateDetailPage({ slug }: { slug?: string }) {
  if (!slug) {
    throw new Error("A template slug is required.");
  }

  if (slug === "blog") {
    return <BlogTemplate basePath="/templates/blog" />;
  }

  const Template = templateComponents[slug];

  if (!Template) {
    throw new Error(`Unknown template: ${slug}`);
  }

  return <Template />;
}

function BlogPostPage({ slug }: { slug?: string }) {
  const post = slug ? getBlogPost(slug) : undefined;

  if (!post) {
    throw new Error(slug ? `Unknown blog post: ${slug}` : "A blog post slug is required.");
  }

  return <BlogPostTemplate backHref="/templates/blog" post={post} />;
}

export function SpecialPageRenderer({ argument, page }: SpecialPageRendererProps) {
  const normalizedPage = normalizeSpecialPageName(page);

  switch (normalizedPage) {
    case "styling":
      return <StylingPage />;
    case "charts":
      return <ChartsExamples />;
    case "stars":
      return <StarsPage />;
    case "templates":
      return <TemplatesPage />;
    case "template-detail":
      return <TemplateDetailPage slug={argument} />;
    case "blog-post":
      return <BlogPostPage slug={argument} />;
    default:
      throw new Error(`Unsupported special page: ${page || "(empty)"}`);
  }
}
