"use client";

import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card";
import * as React from "react";

import { cn } from "@/lib/utils";

function HoverCard({ ...props }: PreviewCardPrimitive.Root.Props) {
  return <PreviewCardPrimitive.Root data-slot="hover-card" {...props} />;
}

function HoverCardTrigger({
  asChild = false,
  children,
  render,
  ...props
}: PreviewCardPrimitive.Trigger.Props & {
  asChild?: boolean;
  children?: React.ReactNode;
}) {
  const renderElement = asChild
    ? (React.Children.toArray(children).find(React.isValidElement) as React.ReactElement)
    : render;

  return (
    <PreviewCardPrimitive.Trigger data-slot="hover-card-trigger" render={renderElement} {...props}>
      {asChild ? undefined : children}
    </PreviewCardPrimitive.Trigger>
  );
}

function HoverCardContent({
  className,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 4,
  ...props
}: PreviewCardPrimitive.Popup.Props &
  Pick<PreviewCardPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">) {
  return (
    <PreviewCardPrimitive.Portal data-slot="hover-card-portal">
      <PreviewCardPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <PreviewCardPrimitive.Popup
          data-slot="hover-card-content"
          className={cn(
            "z-50 w-64 origin-(--transform-origin) rounded-base border-2 border-border bg-main p-4 font-base text-main-foreground outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className,
          )}
          {...props}
        />
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };
