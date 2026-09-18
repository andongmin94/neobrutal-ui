import { useState, type ComponentType } from "react";
import { Link } from "react-router";

import BlogPostTemplate from "@/components/templates/blog-post-template";
import BlogTemplate from "@/components/templates/blog-template";
import CmsTemplate from "@/components/templates/cms-template";
import LinkHubTemplate from "@/components/templates/link-hub-template";
import PortfolioTemplate from "@/components/templates/portfolio-template";
import TEMPLATES from "@/data/templates";
import { getBlogPost } from "@/lib/blog-posts";
import { copyText } from "~/lib/clipboard";

const templateComponents: Record<string, ComponentType> = {
  cms: CmsTemplate,
  links: LinkHubTemplate,
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
          <Link
            aria-label={`Open ${template.title} template`}
            className="template-preview-link block shrink-0 overflow-hidden border-b-2 border-border bg-background outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            to={`/templates/${template.slug}`}
          >
            <img
              alt=""
              className="aspect-video w-full object-cover"
              loading="lazy"
              src={template.preview}
            />
          </Link>
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
                to={`/templates/${template.slug}`}
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
                      : "Copy"}
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
  if (!slug) throw new Error("A template slug is required.");

  if (slug === "blog") return <BlogTemplate basePath="/templates/blog" />;

  const Template = templateComponents[slug];
  if (!Template) throw new Error(`Unknown template: ${slug}`);

  return <Template />;
}

export function BlogPostPage({ slug }: { slug?: string }) {
  const post = slug ? getBlogPost(slug) : undefined;

  if (!post) {
    throw new Error(slug ? `Unknown blog post: ${slug}` : "A blog post slug is required.");
  }

  return <BlogPostTemplate backHref="/templates/blog" post={post} />;
}
