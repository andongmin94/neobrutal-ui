import { ArrowLeft, Clock3, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { BlogPost } from "@/lib/blog-posts";

const TEMPLATE_THEME =
  "[color-scheme:light] [--background:#fff5cc] [--secondary-background:#fff] [--foreground:#000] [--main-foreground:#000] [--main:#ffbe00] [--border:#000] [--ring:#000] [--box-shadow-x:0px] [--box-shadow-y:4px] [--reverse-box-shadow-x:0px] [--reverse-box-shadow-y:-4px] [--shadow:0px_4px_0px_0px_var(--border)] [--border-radius:10px] [--base-font-weight:500] [--heading-font-weight:700] dark:[color-scheme:dark] dark:[--background:#2c304c] dark:[--secondary-background:#222] dark:[--foreground:#ececec] dark:[--main:#ffbe00] dark:[--ring:#fff]";

type BlogPostTemplateProps = {
  backHref?: string;
  post: BlogPost;
};

export default function BlogPostTemplate({ backHref = "/blog", post }: BlogPostTemplateProps) {
  return (
    <div
      id="top"
      className={`flex min-h-dvh flex-col bg-background text-foreground ${TEMPLATE_THEME}`}
    >
      <header className="border-b-2 border-border bg-secondary-background">
        <div className="mx-auto flex h-12 w-full max-w-3xl items-center justify-between px-4 sm:px-6">
          <a
            href={backHref}
            className="group flex items-center gap-2 font-heading"
            aria-label="Worklog home"
          >
            <span className="grid size-7 place-items-center rounded-base border-2 border-border bg-main text-main-foreground shadow-shadow transition-all duration-150 group-hover:translate-x-boxShadowX group-hover:translate-y-boxShadowY group-hover:shadow-none">
              <FileText aria-hidden="true" className="size-3.5" />
            </span>
            <span className="text-sm">WORKLOG</span>
          </a>

          <a className="text-xs font-heading underline-offset-4 hover:underline" href={backHref}>
            All posts
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <Button asChild nativeButton={false} size="sm" variant="neutral">
          <a href={backHref}>
            <ArrowLeft aria-hidden="true" />
            All posts
          </a>
        </Button>

        <article className="mt-8">
          <header>
            <p className="text-sm font-heading text-foreground/65">{post.topic}</p>
            <h1 className="mt-3 max-w-2xl text-4xl leading-tight font-heading sm:text-5xl">
              {post.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-foreground/75">{post.summary}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-heading text-foreground/60">
              <time dateTime={post.publishedAt}>{post.publishedLabel}, 2026</time>
              <span aria-hidden="true">/</span>
              <span className="flex items-center gap-1.5">
                <Clock3 aria-hidden="true" className="size-4" />
                {post.readTime} read
              </span>
            </div>
          </header>

          <div className="mt-8 border-y-2 border-border bg-secondary-background px-5 py-6 text-lg leading-8 sm:px-7">
            <p>{post.intro}</p>
          </div>

          <div className="mt-9 space-y-10">
            {post.sections.map((section, index) => {
              const headingId = `${post.slug}-section-${index + 1}`;

              return (
                <section key={section.heading} aria-labelledby={headingId}>
                  <h2 id={headingId} className="text-2xl leading-tight font-heading sm:text-3xl">
                    {section.heading}
                  </h2>
                  <div className="mt-4 space-y-4 text-base leading-8 text-foreground/80 sm:text-lg">
                    {section.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  {section.points ? (
                    <ul className="mt-5 list-square space-y-2 pl-6 leading-7 text-foreground/80">
                      {section.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              );
            })}
          </div>
        </article>
      </main>

      <footer className="border-t-2 border-border bg-secondary-background">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-4 text-xs sm:px-6">
          <p className="font-heading">WORKLOG / 2026</p>
          <a href="#top" className="font-heading underline-offset-4 hover:underline">
            Back to top
          </a>
        </div>
      </footer>
    </div>
  );
}
