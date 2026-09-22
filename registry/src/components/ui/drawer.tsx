"use client";

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import type * as React from "react";

import { cn } from "@/lib/utils";

function Drawer(props: DrawerPrimitive.Root.Props) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger(props: DrawerPrimitive.Trigger.Props) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal(props: DrawerPrimitive.Portal.Props) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose(props: DrawerPrimitive.Close.Props) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({ className, ...props }: DrawerPrimitive.Backdrop.Props) {
  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-overlay"
      {...props}
      className={(state) =>
        cn(
          "fixed inset-0 z-50 bg-overlay opacity-[calc(1-var(--drawer-swipe-progress,0))] transition-opacity duration-[calc(var(--drawer-swipe-strength,1)*400ms)] data-starting-style:opacity-0 data-ending-style:opacity-0 data-swiping:duration-0",
          typeof className === "function" ? className(state) : className,
        )
      }
    />
  );
}

function DrawerContent({ className, children, ...props }: DrawerPrimitive.Popup.Props) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Viewport
        data-slot="drawer-viewport"
        className="pointer-events-none fixed inset-0 z-50"
      >
        <DrawerPrimitive.Popup
          data-slot="drawer-content"
          {...props}
          className={(state) =>
            cn(
              "group/drawer-popup pointer-events-auto fixed z-50 flex min-h-0 transform-[translate3d(var(--translate-x,0px),var(--translate-y,0px),0)] flex-col border-2 border-border bg-background text-foreground shadow-none transition-[transform,height,opacity] duration-[calc(var(--drawer-swipe-strength,1)*400ms)] ease-[cubic-bezier(0.22,1,0.36,1)] outline-none data-swiping:duration-0 data-starting-style:transform-(--closed-transform) data-ending-style:transform-(--closed-transform)",
              "data-[swipe-direction=down]:inset-x-0 data-[swipe-direction=down]:bottom-0 data-[swipe-direction=down]:max-h-[80vh] data-[swipe-direction=down]:rounded-t-base data-[swipe-direction=down]:[--closed-transform:translate3d(0,calc(100%+2px),0)] data-[swipe-direction=down]:[--translate-y:calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y,0px))]",
              "data-[swipe-direction=up]:inset-x-0 data-[swipe-direction=up]:top-0 data-[swipe-direction=up]:max-h-[80vh] data-[swipe-direction=up]:rounded-b-base data-[swipe-direction=up]:[--closed-transform:translate3d(0,calc(-100%-2px),0)] data-[swipe-direction=up]:[--translate-y:calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y,0px))]",
              "data-[swipe-direction=right]:inset-y-0 data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:w-3/4 data-[swipe-direction=right]:rounded-l-base data-[swipe-direction=right]:sm:max-w-sm data-[swipe-direction=right]:[--closed-transform:translate3d(calc(100%+2px),0,0)] data-[swipe-direction=right]:[--translate-x:var(--drawer-swipe-movement-x,0px)]",
              "data-[swipe-direction=left]:inset-y-0 data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:w-3/4 data-[swipe-direction=left]:rounded-r-base data-[swipe-direction=left]:sm:max-w-sm data-[swipe-direction=left]:[--closed-transform:translate3d(calc(-100%-2px),0,0)] data-[swipe-direction=left]:[--translate-x:var(--drawer-swipe-movement-x,0px)]",
              "data-nested-drawer-open:brightness-95",
              typeof className === "function" ? className(state) : className,
            )
          }
        >
          <div
            data-slot="drawer-handle"
            aria-hidden="true"
            className="relative z-10 shrink-0 rounded-full bg-current opacity-40 group-data-[swipe-direction=down]/drawer-popup:mx-auto group-data-[swipe-direction=down]/drawer-popup:mt-4 group-data-[swipe-direction=down]/drawer-popup:h-2 group-data-[swipe-direction=down]/drawer-popup:w-[100px] group-data-[swipe-direction=up]/drawer-popup:order-last group-data-[swipe-direction=up]/drawer-popup:mx-auto group-data-[swipe-direction=up]/drawer-popup:mb-4 group-data-[swipe-direction=up]/drawer-popup:h-2 group-data-[swipe-direction=up]/drawer-popup:w-[100px] group-data-[swipe-direction=right]/drawer-popup:my-auto group-data-[swipe-direction=right]/drawer-popup:ml-4 group-data-[swipe-direction=right]/drawer-popup:h-[100px] group-data-[swipe-direction=right]/drawer-popup:w-2 group-data-[swipe-direction=left]/drawer-popup:order-last group-data-[swipe-direction=left]/drawer-popup:my-auto group-data-[swipe-direction=left]/drawer-popup:mr-4 group-data-[swipe-direction=left]/drawer-popup:h-[100px] group-data-[swipe-direction=left]/drawer-popup:w-2"
          />
          <DrawerPrimitive.Content
            data-slot="drawer-body"
            className="flex min-h-0 flex-1 flex-col overflow-hidden overscroll-contain rounded-[inherit] transition-opacity duration-300 select-text group-data-nested-drawer-open/drawer-popup:opacity-0 group-data-nested-drawer-swiping/drawer-popup:opacity-100"
          >
            {children}
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("grid shrink-0 gap-1.5 p-4 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex shrink-0 flex-col gap-3 p-4", className)}
      {...props}
    />
  );
}

function DrawerTitle({ className, ...props }: DrawerPrimitive.Title.Props) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      {...props}
      className={(state) =>
        cn(
          "font-heading text-lg leading-none tracking-tight",
          typeof className === "function" ? className(state) : className,
        )
      }
    />
  );
}

function DrawerDescription({ className, ...props }: DrawerPrimitive.Description.Props) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      {...props}
      className={(state) =>
        cn(
          "text-sm text-balance font-base text-foreground",
          typeof className === "function" ? className(state) : className,
        )
      }
    />
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
