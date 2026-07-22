"use client";

import { ArrowUpRight, Check, Copy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import type { TemplateEntry } from "@/data/templates";

export default function TemplateCatalog({ items }: { items: TemplateEntry[] }) {
  const [copied, setCopied] = React.useState<string | null>(null);
  const [copyFallback, setCopyFallback] = React.useState<string | null>(null);

  async function copyInstallCommand(item: TemplateEntry) {
    let didCopy = false;

    try {
      await Promise.race([
        navigator.clipboard.writeText(item.installCommand),
        new Promise<never>((_, reject) => {
          window.setTimeout(() => reject(new Error("Clipboard request timed out")), 800);
        }),
      ]);
      didCopy = true;
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = item.installCommand;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "0";
      textarea.style.top = "0";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      didCopy = document.execCommand("copy");
      textarea.remove();
    }

    if (!didCopy) {
      setCopyFallback(item.slug);
      return;
    }

    setCopyFallback(null);
    setCopied(item.slug);
    window.setTimeout(() => setCopied(null), 1600);
  }

  return (
    <section aria-label="Template catalog" className="grid gap-6 lg:grid-cols-2">
      {items.map((item) => {
        const isCopied = copied === item.slug;

        return (
          <article
            className="group/card flex min-w-0 flex-col rounded-[5px] border-2 border-border bg-secondary-background p-3 shadow-[4px_4px_0_0_var(--border)] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 sm:p-4"
            key={item.slug}
            style={{ "--template-color": item.color } as React.CSSProperties}
          >
            <Link
              aria-label={`Preview ${item.title}`}
              className="group/preview relative block aspect-2/1 overflow-hidden rounded-[3px] border-2 border-border bg-[var(--template-color)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              href={`/templates/${item.slug}`}
              target="_blank"
            >
              <Image
                alt={`${item.title} template preview`}
                className="object-cover object-top transition-transform duration-150 group-hover/preview:scale-[1.01] group-focus-visible/preview:scale-[1.01] motion-reduce:transform-none motion-reduce:transition-none"
                fill
                loading={item.slug === "blog" ? "eager" : "lazy"}
                sizes="(min-width: 1024px) 50vw, 100vw"
                src={item.preview}
              />
            </Link>

            <div className="flex flex-1 flex-col px-1 pt-4 pb-1">
              <h2 className="text-2xl font-heading">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-foreground/70">{item.description}</p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Link
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-[3px] border-2 border-border bg-[var(--template-color)] px-4 font-heading text-black shadow-[4px_4px_0_0_var(--border)] transition-all duration-150 hover:translate-x-1 hover:translate-y-1 hover:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
                  href={`/templates/${item.slug}`}
                  target="_blank"
                >
                  Open
                  <ArrowUpRight className="size-4" />
                </Link>
                <button
                  aria-label={`Copy ${item.title} install command`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-[3px] border-2 border-border bg-[var(--template-color)] px-4 font-heading text-black shadow-[4px_4px_0_0_var(--border)] transition-all duration-150 hover:translate-x-1 hover:translate-y-1 hover:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
                  onClick={() => copyInstallCommand(item)}
                  title="Copy install command"
                  type="button"
                >
                  {isCopied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {isCopied ? "Copied" : "Copy"}
                </button>
              </div>

              {copyFallback === item.slug ? (
                <div className="mt-3" aria-live="polite">
                  <label className="sr-only" htmlFor={`install-${item.slug}`}>
                    Install command
                  </label>
                  <input
                    className="h-10 w-full border-2 border-border bg-background px-3 font-mono text-xs text-foreground outline-none focus:ring-2 focus:ring-main"
                    id={`install-${item.slug}`}
                    onClick={(event) => event.currentTarget.select()}
                    onFocus={(event) => event.currentTarget.select()}
                    readOnly
                    ref={(input) => {
                      input?.focus();
                      input?.select();
                    }}
                    value={item.installCommand}
                  />
                </div>
              ) : null}
            </div>
          </article>
        );
      })}
    </section>
  );
}
