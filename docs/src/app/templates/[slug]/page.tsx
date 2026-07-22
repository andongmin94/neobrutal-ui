import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import BlogTemplate from "@/components/templates/blog-template";
import CmsTemplate from "@/components/templates/cms-template";
import LinkHubTemplate from "@/components/templates/link-hub-template";
import PortfolioTemplate from "@/components/templates/portfolio-template";
import TEMPLATES from "@/data/templates";

const templateComponents = {
  blog: BlogTemplate,
  cms: CmsTemplate,
  links: LinkHubTemplate,
  portfolio: PortfolioTemplate,
};

type TemplatePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ capture?: string }>;
};

export function generateStaticParams() {
  return TEMPLATES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: TemplatePageProps): Promise<Metadata> {
  const { slug } = await params;
  const template = TEMPLATES.find((item) => item.slug === slug);

  if (!template) return {};

  return {
    title: `${template.title} Template`,
    description: template.description,
  };
}

export default async function TemplatePage({ params, searchParams }: TemplatePageProps) {
  const { slug } = await params;
  const { capture } = await searchParams;
  const Template = templateComponents[slug as keyof typeof templateComponents];

  if (!Template) notFound();

  return (
    <main
      data-capture={capture === "1" ? "true" : undefined}
      data-template-preview
      className="relative min-h-dvh"
    >
      {capture !== "1" && (
        <Link
          className="fixed bottom-4 left-4 z-50 border-2 border-border bg-secondary-background px-3 py-2 text-sm font-heading text-foreground shadow-shadow transition-all duration-150 hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
          href="/templates"
        >
          Back to templates
        </Link>
      )}
      {slug === "blog" ? <BlogTemplate basePath="/templates/blog" /> : <Template />}
    </main>
  );
}
