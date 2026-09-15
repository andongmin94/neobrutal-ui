"use client";

import { useState } from "react";

export default function Marquee({ items }: { items: string[] }) {
  const [paused, setPaused] = useState(false);
  const animationStyle = { animationPlayState: paused ? "paused" : "running" } as const;

  return (
    <div className="relative flex w-full overflow-x-hidden border-b-2 border-t-2 border-border bg-secondary-background text-foreground font-base">
      <button
        type="button"
        aria-pressed={paused}
        aria-label="Pause animation"
        onClick={() => setPaused((value) => !value)}
        className="absolute right-2 top-2 z-10 rounded-base border-2 border-border bg-secondary-background px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:hidden"
      >
        {paused ? "Resume" : "Pause"}
      </button>
      <div
        className="animate-marquee whitespace-nowrap py-12 motion-reduce:animate-none"
        style={animationStyle}
      >
        {items.map((item) => (
          <span key={item} className="mx-4 text-4xl">
            {item}
          </span>
        ))}
      </div>
      <div
        aria-hidden="true"
        className="absolute top-0 animate-marquee2 whitespace-nowrap py-12 motion-reduce:hidden"
        style={animationStyle}
      >
        {items.map((item) => (
          <span key={item} className="mx-4 text-4xl">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
