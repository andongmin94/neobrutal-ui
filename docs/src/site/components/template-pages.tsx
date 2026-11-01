import { useState, type ComponentType } from "react";
import { Link } from "fumapress/client";

import BlogPostTemplate from "@/components/templates/blog-post-template";
import BlogTemplate from "@/components/templates/blog-template";
import CmsTemplate from "@/components/templates/cms-template";
import DashboardTemplate from "@/components/templates/dashboard-template";
import LandingTemplate from "@/components/templates/landing-template";
import LinkHubTemplate from "@/components/templates/link-hub-template";
import PortfolioTemplate from "@/components/templates/portfolio-template";
import { Pre } from "@/components/docs/pre";
import TEMPLATES from "@/data/templates";
import { BLOG_POSTS, getBlogPost } from "@/lib/blog-posts";
import { LINK_HUB_LINKS, LINK_HUB_PROFILE } from "@/lib/link-hub-data";
import { copyText } from "@/site/lib/clipboard";
import { TemplatePreview } from "./template-preview";
import { TemplateThumbnail } from "./template-thumbnail";

const templateComponents: Record<string, ComponentType> = {
  cms: CmsTemplate,
  dashboard: DashboardTemplate,
  landing: LandingTemplate,
  portfolio: PortfolioTemplate,
};

export function TemplatesPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  async function handleCopy(slug: string, command: string) {
    setFailed(null);
    setCopied(null);
    try {
      await copyText(command);
      setCopied(slug);
    } catch {
      setFailed(slug);
    }
    globalThis.setTimeout(() => {
      setCopied((current) => (current === slug ? null : current));
      setFailed((current) => (current === slug ? null : current));
    }, 1600);
  }

  return (
    <div className="not-prose grid gap-6 md:grid-cols-2">
      {TEMPLATES.map((template) => (
        <article
          className="flex flex-col overflow-hidden rounded-base border-2 border-border bg-secondary-background shadow-shadow"
          key={template.slug}
        >
          <div className="relative shrink-0 border-b-2 border-border">
            <TemplateThumbnail>
              <TemplateDemo slug={template.slug} />
            </TemplateThumbnail>
            <Link
              aria-label={`Open ${template.title} template`}
              className="template-preview-link absolute inset-0 outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-inset"
              href={`/templates/${template.slug}`}
            >
              <span className="sr-only">Open {template.title} template</span>
            </Link>
          </div>
          <div className="flex flex-1 flex-col p-5">
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
            <div className="mt-auto grid grid-cols-2 gap-3 pt-5">
              <Link
                className="pressable border-2 border-border bg-main px-3 py-2 text-center font-heading text-main-foreground"
                href={`/templates/${template.slug}`}
              >
                Open
              </Link>
              <button
                type="button"
                className="pressable border-2 border-border bg-secondary-background px-3 py-2 font-heading"
                onClick={() => void handleCopy(template.slug, template.installCommand)}
              >
                <span aria-live="polite">
                  {copied === template.slug
                    ? "Copied"
                    : failed === template.slug
                      ? "Copy failed"
                      : "Copy command"}
                </span>
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function TemplateDetailPage({ slug }: { slug?: string }) {
  const template = TEMPLATES.find((entry) => entry.slug === slug);
  if (!template) throw new Error(`Unknown template: ${slug}`);

  return (
    <>
      <section
        aria-label={`Install ${template.title} template`}
        className="not-prose mb-6 grid gap-3 rounded-base border-2 border-border bg-secondary-background p-4 sm:p-6"
      >
        <h2 className="font-heading text-xl">Use this template</h2>
        <p className="text-sm leading-6">
          <Link href="/docs/installation" className="underline underline-offset-4">
            Set up the shared base once
          </Link>
          , then run this command in your Next.js App Router project. Review existing page routes
          before replacing them.
        </p>
        <Pre __rawstring__={template.installCommand}>
          <code>{template.installCommand}</code>
        </Pre>
      </section>
      <TemplateDemo slug={template.slug} />
    </>
  );
}

function TemplateDemo({ slug }: { slug: string }) {
  if (slug === "blog") {
    return (
      <TemplatePreview name="blog">
        <BlogTemplate posts={BLOG_POSTS} basePath="/templates/blog" />
      </TemplatePreview>
    );
  }

  if (slug === "links") {
    return (
      <TemplatePreview name="links">
        <LinkHubTemplate profile={LINK_HUB_PROFILE} links={LINK_HUB_LINKS} />
      </TemplatePreview>
    );
  }

  const Template = templateComponents[slug];
  if (!Template) throw new Error(`Unknown template: ${slug}`);

  return (
    <TemplatePreview name={slug}>
      <Template />
    </TemplatePreview>
  );
}

export function BlogPostPage({ slug }: { slug?: string }) {
  const post = slug ? getBlogPost(slug) : undefined;

  if (!post) {
    throw new Error(slug ? `Unknown blog post: ${slug}` : "A blog post slug is required.");
  }

  return (
    <TemplatePreview name="blog">
      <BlogPostTemplate backHref="/templates/blog" post={post} />
    </TemplatePreview>
  );
}
