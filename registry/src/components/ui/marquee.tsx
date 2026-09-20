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
        className="animate-marquee whitespace-nowrap py-12 motion-reduce:flex motion-reduce:w-full motion-reduce:min-w-0 motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:gap-x-8 motion-reduce:gap-y-3 motion-reduce:whitespace-normal motion-reduce:px-4 motion-reduce:py-6"
        style={animationStyle}
      >
        {items.map((item) => (
          <span
            key={item}
            className="mx-4 text-4xl motion-reduce:mx-0 motion-reduce:max-w-full motion-reduce:[overflow-wrap:anywhere]"
          >
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
