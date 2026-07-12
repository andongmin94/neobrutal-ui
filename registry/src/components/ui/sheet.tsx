"use client";

import * as React from "react";
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";

type AutoFocusEventHandler = (event: Event) => void;
type FocusTarget = SheetPrimitive.Popup.Props["initialFocus"];
type PointerDownOutsideEvent = CustomEvent<{ originalEvent: PointerEvent }>;
type FocusOutsideEvent = CustomEvent<{ originalEvent: FocusEvent }>;
type DismissableLayerHandlers = {
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onFocusOutside?: (event: FocusOutsideEvent) => void;
  onInteractOutside?: (event: FocusOutsideEvent | PointerDownOutsideEvent) => void;
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
};
type SheetPortalProps = SheetPrimitive.Portal.Props & {
  forceMount?: boolean;
};
type SheetOverlayProps = SheetPrimitive.Backdrop.Props & {
  forceMount?: boolean;
};
type SheetContentProps = SheetPrimitive.Popup.Props & {
  forceMount?: boolean;
  onCloseAutoFocus?: AutoFocusEventHandler;
  onOpenAutoFocus?: AutoFocusEventHandler;
  showCloseButton?: boolean;
  side?: "top" | "right" | "bottom" | "left";
} & DismissableLayerHandlers;
type SheetContextProps = {
  dismissableLayerHandlersRef: React.RefObject<DismissableLayerHandlers>;
};

const SheetContext = React.createContext<SheetContextProps | null>(null);

function useSheetContext() {
  const context = React.useContext(SheetContext);

  if (!context) {
    throw new Error("Sheet components must be used within Sheet.");
  }

  return context;
}

function createPointerEvent(event: MouseEvent | PointerEvent | TouchEvent): PointerEvent {
  if ("pointerId" in event) {
    return event;
  }

  const touch = "changedTouches" in event ? event.changedTouches[0] : undefined;
  const ownerDocument = event.target instanceof Node ? event.target.ownerDocument : null;
  const view = ownerDocument?.defaultView ?? window;
  const PointerEventConstructor = view?.PointerEvent;

  if (!PointerEventConstructor) {
    return event as PointerEvent;
  }

  return new PointerEventConstructor("pointerdown", {
    bubbles: event.bubbles,
    button: "button" in event ? event.button : 0,
    buttons: "buttons" in event ? event.buttons : 1,
    cancelable: event.cancelable,
    clientX: touch?.clientX ?? ("clientX" in event ? event.clientX : 0),
    clientY: touch?.clientY ?? ("clientY" in event ? event.clientY : 0),
    composed: event.composed,
    ctrlKey: "ctrlKey" in event && event.ctrlKey,
    metaKey: "metaKey" in event && event.metaKey,
    pointerType: "changedTouches" in event ? "touch" : "mouse",
    shiftKey: "shiftKey" in event && event.shiftKey,
  });
}

function createPointerDownOutsideEvent(
  originalEvent: MouseEvent | PointerEvent | TouchEvent,
): PointerDownOutsideEvent {
  const event = new CustomEvent<{ originalEvent: PointerEvent }>(
    "dismissableLayer.pointerDownOutside",
    {
      cancelable: true,
      detail: { originalEvent: createPointerEvent(originalEvent) },
    },
  );
  Object.defineProperty(event, "target", { configurable: true, value: originalEvent.target });
  return event;
}

function createFocusOutsideEvent(originalEvent: FocusEvent | KeyboardEvent): FocusOutsideEvent {
  const focusEvent =
    "relatedTarget" in originalEvent
      ? originalEvent
      : new FocusEvent("focusin", { bubbles: true, cancelable: true });
  const event = new CustomEvent<{ originalEvent: FocusEvent }>("dismissableLayer.focusOutside", {
    cancelable: true,
    detail: { originalEvent: focusEvent },
  });
  Object.defineProperty(event, "target", { configurable: true, value: originalEvent.target });
  return event;
}

function adaptDismissableLayerEvent(
  eventDetails: SheetPrimitive.Root.ChangeEventDetails,
  handlers: DismissableLayerHandlers,
) {
  if (eventDetails.reason === "escape-key") {
    handlers.onEscapeKeyDown?.(eventDetails.event);
    if (eventDetails.event.defaultPrevented) {
      eventDetails.cancel();
    }
    return;
  }

  if (eventDetails.reason === "outside-press") {
    const event = createPointerDownOutsideEvent(eventDetails.event);
    handlers.onPointerDownOutside?.(event);
    handlers.onInteractOutside?.(event);
    if (event.defaultPrevented) {
      eventDetails.cancel();
    }
    return;
  }

  if (eventDetails.reason === "focus-out") {
    const event = createFocusOutsideEvent(eventDetails.event);
    handlers.onFocusOutside?.(event);
    handlers.onInteractOutside?.(event);
    if (event.defaultPrevented) {
      eventDetails.cancel();
    }
  }
}

function adaptCloseClick(
  handler: SheetPrimitive.Close.Props["onClick"],
): SheetPrimitive.Close.Props["onClick"] {
  if (!handler) {
    return undefined;
  }

  return (event) => {
    handler(event);
    if (event.defaultPrevented) {
      event.preventBaseUIHandler();
    }
  };
}

function hasForceMountedChild(children: React.ReactNode) {
  return React.Children.toArray(children).some(
    (child) => React.isValidElement<{ forceMount?: boolean }>(child) && child.props.forceMount,
  );
}

function adaptAutoFocus(
  handler: AutoFocusEventHandler | undefined,
  focus: FocusTarget,
  eventName: string,
): FocusTarget {
  if (!handler) {
    return focus;
  }

  return (interactionType) => {
    const event = new Event(eventName, { cancelable: true });
    handler(event);

    if (event.defaultPrevented) {
      return false;
    }

    if (typeof focus === "function") {
      return focus(interactionType);
    }

    if (typeof focus === "object" && focus !== null) {
      return focus.current;
    }

    return focus ?? true;
  };
}

function Sheet({ onOpenChange, ...props }: SheetPrimitive.Root.Props) {
  const dismissableLayerHandlersRef = React.useRef<DismissableLayerHandlers>({});
  const contextValue = React.useMemo(() => ({ dismissableLayerHandlersRef }), []);

  const handleOpenChange: NonNullable<SheetPrimitive.Root.Props["onOpenChange"]> = (
    open,
    eventDetails,
  ) => {
    if (!open) {
      adaptDismissableLayerEvent(eventDetails, dismissableLayerHandlersRef.current);
    }
    if (eventDetails.isCanceled) {
      return;
    }
    onOpenChange?.(open, eventDetails);
  };

  return (
    <SheetContext.Provider value={contextValue}>
      <SheetPrimitive.Root data-slot="sheet" {...props} onOpenChange={handleOpenChange} />
    </SheetContext.Provider>
  );
}

function SheetTrigger({
  asChild = false,
  children,
  render,
  ...props
}: SheetPrimitive.Trigger.Props & {
  asChild?: boolean;
  children?: React.ReactNode;
}) {
  const renderElement = asChild
    ? (React.Children.toArray(children).find(React.isValidElement) as React.ReactElement)
    : render;

  return (
    <SheetPrimitive.Trigger data-slot="sheet-trigger" render={renderElement} {...props}>
      {asChild ? undefined : children}
    </SheetPrimitive.Trigger>
  );
}

function SheetClose({
  asChild = false,
  children,
  onClick,
  render,
  ...props
}: SheetPrimitive.Close.Props & {
  asChild?: boolean;
  children?: React.ReactNode;
}) {
  const renderElement = asChild
    ? (React.Children.toArray(children).find(React.isValidElement) as React.ReactElement)
    : render;

  return (
    <SheetPrimitive.Close
      data-slot="sheet-close"
      onClick={adaptCloseClick(onClick)}
      render={renderElement}
      {...props}
    >
      {asChild ? undefined : children}
    </SheetPrimitive.Close>
  );
}

function SheetPortal({ forceMount, keepMounted, ...props }: SheetPortalProps) {
  const keepPortalMounted = forceMount ?? (hasForceMountedChild(props.children) || keepMounted);

  return (
    <SheetPrimitive.Portal data-slot="sheet-portal" keepMounted={keepPortalMounted} {...props} />
  );
}

function SheetOverlay({ className, forceMount: _forceMount, ...props }: SheetOverlayProps) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-overlay transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  finalFocus,
  forceMount,
  initialFocus,
  onCloseAutoFocus,
  onEscapeKeyDown,
  onFocusOutside,
  onInteractOutside,
  onOpenAutoFocus,
  onPointerDownOutside,
  side = "right",
  showCloseButton = true,
  ...props
}: SheetContentProps) {
  const { dismissableLayerHandlersRef } = useSheetContext();
  const dismissableLayerHandlers = React.useMemo(
    () => ({ onEscapeKeyDown, onFocusOutside, onInteractOutside, onPointerDownOutside }),
    [onEscapeKeyDown, onFocusOutside, onInteractOutside, onPointerDownOutside],
  );
  dismissableLayerHandlersRef.current = dismissableLayerHandlers;

  React.useEffect(
    () => () => {
      if (dismissableLayerHandlersRef.current === dismissableLayerHandlers) {
        dismissableLayerHandlersRef.current = {};
      }
    },
    [dismissableLayerHandlers, dismissableLayerHandlersRef],
  );

  return (
    <SheetPortal forceMount={forceMount}>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        initialFocus={adaptAutoFocus(onOpenAutoFocus, initialFocus, "focusScope.autoFocusOnMount")}
        finalFocus={adaptAutoFocus(onCloseAutoFocus, finalFocus, "focusScope.autoFocusOnUnmount")}
        className={cn(
          "fixed z-50 flex flex-col gap-4 border-2 border-border bg-background bg-clip-padding text-foreground shadow-none transition duration-200 ease-in-out data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-b-0 data-[side=bottom]:data-ending-style:translate-y-[2.5rem] data-[side=bottom]:data-starting-style:translate-y-[2.5rem] data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-l-0 data-[side=left]:data-ending-style:translate-x-[-2.5rem] data-[side=left]:data-starting-style:translate-x-[-2.5rem] data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-r-0 data-[side=right]:data-ending-style:translate-x-[2.5rem] data-[side=right]:data-starting-style:translate-x-[2.5rem] data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-t-0 data-[side=top]:data-ending-style:translate-y-[-2.5rem] data-[side=top]:data-starting-style:translate-y-[-2.5rem] data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            render={<Button variant="ghost" className="absolute top-3 right-3" size="icon-sm" />}
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-0.5 p-4", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("font-heading text-base text-foreground", className)}
      {...props}
    />
  );
}

function SheetDescription({ className, ...props }: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm font-base text-foreground", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
