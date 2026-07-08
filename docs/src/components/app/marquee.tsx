import type * as React from "react";

import { cn } from "@/lib/utils";

type MarqueeProps = {
  children: React.ReactNode;
  className?: string;
  direction?: "left" | "up";
  reverse?: boolean;
};

export function Marquee({
  children,
  className,
  direction = "left",
  reverse = false,
}: MarqueeProps) {
  const axisClass = direction === "up" ? "flex-col" : "flex-row";
  const animationClass = direction === "up" ? "animate-marquee-up" : "animate-marquee-left";

  return (
    <div
      className={cn(
        "group flex overflow-hidden [--gap:1rem]",
        direction === "up" ? "h-full" : "w-full",
        axisClass,
        className,
      )}
    >
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "flex shrink-0 justify-around gap-[1rem] group-hover:[animation-play-state:paused]",
            axisClass,
            animationClass,
            reverse && "direction-reverse",
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
