import { useState } from "react";

import STARS from "@/data/stars";
import { copyText } from "~/lib/clipboard";

export default function StarsPage() {
  const [copied, setCopied] = useState<number | null>(null);
  const [failed, setFailed] = useState<number | null>(null);

  async function handleCopy(index: number, code: string) {
    setFailed(null);
    setCopied(null);
    try {
      await copyText(code);
      setCopied(index);
    } catch {
      setFailed(index);
    }
    globalThis.setTimeout(() => {
      setCopied((current) => (current === index ? null : current));
      setFailed((current) => (current === index ? null : current));
    }, 1600);
  }

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
              className="pressable border-2 border-border bg-main px-3 py-2 font-heading text-main-foreground"
              onClick={() => void handleCopy(index, star.code)}
            >
              <span aria-live="polite">
                {copied === index ? "Copied" : failed === index ? "Copy failed" : "Copy source"}
              </span>
            </button>
          </article>
        );
      })}
    </div>
  );
}
