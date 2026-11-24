"use client";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { useDirection } from "@base-ui/react/direction-provider";

import { cn } from "@/lib/utils";

type TooltipContentProps = TooltipPrimitive.Popup.Props &
  Pick<
    TooltipPrimitive.Positioner.Props,
    | "align"
    | "alignOffset"
    | "arrowPadding"
    | "collisionAvoidance"
    | "collisionBoundary"
    | "collisionPadding"
    | "disableAnchorTracking"
    | "positionMethod"
    | "side"
    | "sideOffset"
    | "sticky"
  >;

function TooltipProvider({ delay = 0, timeout = 300, ...props }: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider delay={delay} timeout={timeout} {...props} />;
}

function Tooltip<Payload>(props: TooltipPrimitive.Root.Props<Payload>) {
  return <TooltipPrimitive.Root {...props} />;
}

function TooltipTrigger<Payload>(props: TooltipPrimitive.Trigger.Props<Payload>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  align = "center",
  alignOffset = 0,
  arrowPadding = 0,
  children,
  className,
  collisionAvoidance,
  collisionBoundary,
  collisionPadding = 0,
  disableAnchorTracking,
  positionMethod = "fixed",
  side = "top",
  sideOffset = 4,
  sticky,
  ...props
}: TooltipContentProps) {
  const direction = useDirection();
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        dir={direction}
        align={align}
        alignOffset={alignOffset}
        arrowPadding={arrowPadding}
        collisionAvoidance={collisionAvoidance}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        disableAnchorTracking={disableAnchorTracking}
        positionMethod={positionMethod}
        side={side}
        sideOffset={sideOffset}
        sticky={sticky}
        className="isolate z-50"
      >
        <TooltipPrimitive.Popup
          dir={direction}
          role="tooltip"
          data-slot="tooltip-content"
          {...props}
          className={(state) =>
            cn(
              "z-50 origin-(--transform-origin) overflow-hidden rounded-base border-2 border-border bg-main px-3 py-1.5 text-sm font-base text-main-foreground motion-safe:data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 motion-safe:data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
              typeof className === "function" ? className(state) : className,
            )
          }
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
