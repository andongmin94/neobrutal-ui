import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import BlogPostTemplate from "@/components/templates/blog-post-template";
import { BLOG_POSTS, getBlogPost } from "@/lib/blog-posts";

type BlogPostPreviewPageProps = {
  params: Promise<{ postSlug: string }>;
};

export function generateStaticParams() {
  return BLOG_POSTS.map(({ slug }) => ({ postSlug: slug }));
}

export async function generateMetadata({ params }: BlogPostPreviewPageProps): Promise<Metadata> {
  const { postSlug } = await params;
  const post = getBlogPost(postSlug);

  if (!post) return {};

  return {
    title: `${post.title} - Blog Template`,
    description: post.summary,
  };
}

export default async function BlogPostPreviewPage({ params }: BlogPostPreviewPageProps) {
  const { postSlug } = await params;
  const post = getBlogPost(postSlug);

  if (!post) notFound();

  return (
    <main data-template-preview className="relative min-h-dvh">
      <Link
        className="fixed bottom-4 left-4 z-50 border-2 border-border bg-secondary-background px-3 py-2 text-sm font-heading text-foreground shadow-shadow transition-all duration-150 hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
        href="/templates"
      >
        Back to templates
      </Link>
      <BlogPostTemplate backHref="/templates/blog" post={post} />
    </main>
  );
}
