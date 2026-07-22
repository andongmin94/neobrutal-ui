"use client";

import { Check, Clipboard } from "lucide-react";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function CopyButton({ text }: { text: string }) {
  const [isCopied, setIsCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setCopyFailed(false);
    } catch {
      setIsCopied(false);
      setCopyFailed(true);
    }

    setTimeout(() => {
      setIsCopied(false);
      setCopyFailed(false);
    }, 1500);
  };

  const status = isCopied ? "Copied" : copyFailed ? "Copy failed" : "Copy";

  return (
    <Button
      size="icon"
      className="size-9 absolute right-3.5 top-2"
      variant="noShadow"
      onClick={copy}
      aria-label={status}
      title={status}
    >
      <span className="sr-only" aria-live="polite">
        {status}
      </span>
      {isCopied ? <Check /> : <Clipboard />}
    </Button>
  );
}
