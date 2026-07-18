import { ExternalLink } from "lucide-react";
import Link from "next/link";

type ComponentWorkbenchProps = {
  category: string;
  children: React.ReactNode;
  description?: string;
  installMode: string;
  shadcnDocsLink?: string;
  title: string;
};

export default function ComponentWorkbench({
  category,
  children,
  description,
  installMode,
  shadcnDocsLink,
  title,
}: ComponentWorkbenchProps) {
  return (
    <div className="docs min-h-[100dvh] w-full bg-background pt-[70px] text-foreground">
      <main className="min-w-0 lg:ml-[260px]">
        <header className="border-b-2 border-border bg-main px-5 py-10 text-main-foreground sm:py-12 lg:px-10">
          <div className="mx-auto max-w-[960px]">
            <div className="mb-5 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">
              <Link className="underline-offset-4 hover:underline" href="/">
                Directory
              </Link>
              <span className="opacity-45">/</span>
              <Link className="underline-offset-4 hover:underline" href="/docs">
                Components
              </Link>
              <span className="opacity-45">/</span>
              <span>{category}</span>
            </div>

            <h1 className="text-4xl font-black leading-none sm:text-5xl">{title}</h1>
            {description ? (
              <p className="mt-5 max-w-3xl text-base leading-7 sm:text-lg">{description}</p>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="border border-border bg-secondary-background px-2.5 py-1 font-mono text-[10px] uppercase text-foreground">
                {installMode}
              </span>
              <span className="border border-border bg-secondary-background px-2.5 py-1 font-mono text-[10px] uppercase text-foreground">
                Base UI
              </span>
              {shadcnDocsLink ? (
                <a
                  className="inline-flex items-center gap-1.5 border border-border bg-secondary-background px-2.5 py-1 font-mono text-[10px] uppercase text-foreground hover:bg-background"
                  href={shadcnDocsLink}
                  rel="noreferrer"
                  target="_blank"
                >
                  shadcn reference
                  <ExternalLink className="size-3" />
                </a>
              ) : null}
            </div>
          </div>
        </header>

        <section className="px-5 py-12 sm:py-16 lg:px-10">
          <article className="component-workbench-content mx-auto w-full max-w-[960px] leading-relaxed prose-p:mt-6 prose-p:text-foreground prose-headings:scroll-mt-32 prose-headings:font-heading prose-h2:mt-14 prose-h2:mb-6 prose-h2:border-b-2 prose-h2:border-border prose-h2:pb-3 prose-h2:text-2xl prose-h3:mt-10 prose-h3:mb-5 prose-h3:text-xl prose-ul:list-disc prose-ul:pl-5 prose-li:mt-2 prose-li:text-sm prose-li:font-base prose-p:text-sm prose-p:leading-7 prose-p:font-base prose-code:mx-0.5 prose-code:break-normal prose-code:rounded-base prose-code:border prose-code:border-border prose-code:bg-main prose-code:px-[5px] prose-code:py-[3px] prose-code:text-sm prose-code:font-bold prose-code:text-main-foreground prose-a:font-heading prose-a:underline sm:prose-li:text-base sm:prose-p:text-base">
            {children}
          </article>
        </section>
      </main>
    </div>
  );
}
