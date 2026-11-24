"use client";

import { useState } from "react";

export default function Marquee({ items }: { items: string[] }) {
  const [paused, setPaused] = useState(false);
  const itemClassName =
    "shrink-0 text-4xl motion-reduce:max-w-full motion-reduce:[overflow-wrap:anywhere]";
  const groupClassName =
    "flex min-w-[100cqw] shrink-0 items-center justify-around gap-8 whitespace-nowrap px-4 py-12 motion-reduce:w-full motion-reduce:min-w-0 motion-reduce:flex-wrap motion-reduce:justify-start motion-reduce:gap-y-3 motion-reduce:whitespace-normal motion-reduce:py-6";

  return (
    <div
      data-slot="marquee"
      className="relative flex w-full min-w-0 overflow-hidden border-b-2 border-t-2 border-border bg-secondary-background text-foreground font-base"
    >
      <style>{`@keyframes neobrutal-marquee-scroll {
        from { transform: translateX(0); }
        to { transform: translateX(var(--marquee-scroll-end)); }
      }`}</style>
      <button
        type="button"
        onClick={() => setPaused((value) => !value)}
        className="absolute end-2 top-2 z-10 rounded-base border-2 border-border bg-secondary-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring motion-reduce:hidden"
      >
        {paused ? "Resume" : "Pause"}
      </button>
      <div
        data-slot="marquee-viewport"
        className="min-w-0 flex-1 overflow-hidden [container-type:inline-size]"
      >
        <div
          data-slot="marquee-track"
          className="flex w-max animate-[neobrutal-marquee-scroll_5s_linear_infinite] [--marquee-scroll-end:-50%] rtl:[--marquee-scroll-end:50%] motion-reduce:w-full motion-reduce:animate-none"
          style={{ animationPlayState: paused ? "paused" : "running" }}
        >
          <div data-slot="marquee-items" className={groupClassName}>
            {items.map((item) => (
              <span key={item} className={itemClassName}>
                {item}
              </span>
            ))}
          </div>
          <div
            data-slot="marquee-copy"
            aria-hidden="true"
            className={`${groupClassName} motion-reduce:hidden`}
          >
            {items.map((item) => (
              <span key={item} className={itemClassName}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
