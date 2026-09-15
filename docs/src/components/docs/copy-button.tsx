"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const timer = window.setTimeout(() => setState("idle"), 1600);
    return () => window.clearTimeout(timer);
  }, [state]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
  }

  const status = state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : label;

  return (
    <button
      type="button"
      className="code-copy-button"
      data-copy-state={state}
      onClick={() => void copy()}
      aria-label={status}
      title={status}
    >
      {state === "copied" ? (
        <Check aria-hidden="true" size={17} />
      ) : (
        <Copy aria-hidden="true" size={17} />
      )}
      <span className="sr-only" aria-live="polite">
        {state === "idle" ? "" : status}
      </span>
    </button>
  );
}
