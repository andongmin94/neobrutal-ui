"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [result, setResult] = useState<{ text: string; status: "copied" | "failed" } | null>(null);
  const latestCopy = useRef<object | undefined>(undefined);
  const resetTimer = useRef<number | undefined>(undefined);
  const state = result?.text === text ? result.status : "idle";

  useEffect(
    () => () => {
      latestCopy.current = undefined;
      window.clearTimeout(resetTimer.current);
    },
    [],
  );

  async function copy() {
    const request = {};
    latestCopy.current = request;
    window.clearTimeout(resetTimer.current);
    let status: "copied" | "failed" = "copied";
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      status = "failed";
    }
    if (latestCopy.current !== request) return;
    setResult({ text, status });
    resetTimer.current = window.setTimeout(() => setResult(null), 1600);
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
