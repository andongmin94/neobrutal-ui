"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";

import { cn } from "@/lib/utils";

type AutoFocusEventHandler = (event: Event) => void;
type FocusTarget = PopoverPrimitive.Popup.Props["initialFocus"];
type PointerDownOutsideEvent = CustomEvent<{ originalEvent: PointerEvent }>;
type FocusOutsideEvent = CustomEvent<{ originalEvent: FocusEvent }>;
type DismissableLayerHandlers = {
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onFocusOutside?: (event: FocusOutsideEvent) => void;
  onInteractOutside?: (event: FocusOutsideEvent | PointerDownOutsideEvent) => void;
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
};
type CollisionBoundary =
  | PopoverPrimitive.Positioner.Props["collisionBoundary"]
  | null
  | Array<Element | null>;
type PopoverPortalProps = PopoverPrimitive.Portal.Props & {
  forceMount?: boolean;
};
type PopoverContentProps = PopoverPrimitive.Popup.Props &
  Pick<
    PopoverPrimitive.Positioner.Props,
    | "align"
    | "alignOffset"
    | "arrowPadding"
    | "collisionAvoidance"
    | "collisionPadding"
    | "disableAnchorTracking"
    | "positionMethod"
    | "side"
    | "sideOffset"
  > & {
    avoidCollisions?: boolean;
    collisionBoundary?: CollisionBoundary;
    forceMount?: boolean;
    hideWhenDetached?: boolean;
    onCloseAutoFocus?: AutoFocusEventHandler;
    onOpenAutoFocus?: AutoFocusEventHandler;
    onPlaced?: () => void;
    sticky?: "partial" | "always";
    updatePositionStrategy?: "optimized" | "always";
  } & DismissableLayerHandlers;
type PopoverContextProps = {
  dismissableLayerHandlersRef: React.RefObject<DismissableLayerHandlers>;
};

const PopoverContext = React.createContext<PopoverContextProps | null>(null);

function usePopoverContext() {
  const context = React.useContext(PopoverContext);

  if (!context) {
    throw new Error("Popover components must be used within Popover.");
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
  eventDetails: PopoverPrimitive.Root.ChangeEventDetails,
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

function normalizeCollisionBoundary(
  collisionBoundary: CollisionBoundary | undefined,
): PopoverPrimitive.Positioner.Props["collisionBoundary"] {
  if (Array.isArray(collisionBoundary)) {
    const boundaries: Element[] = [];

    for (const boundary of collisionBoundary) {
      if (boundary) {
        boundaries.push(boundary);
      }
    }

    return boundaries;
  }

  return collisionBoundary ?? undefined;
}

function PopoverPortal({ forceMount, keepMounted, ...props }: PopoverPortalProps) {
  const keepPortalMounted = forceMount ?? (hasForceMountedChild(props.children) || keepMounted);

  return (
    <PopoverPrimitive.Portal
      data-slot="popover-portal"
      keepMounted={keepPortalMounted}
      {...props}
    />
  );
}

function PopoverPositioner({
  onPlaced,
  ...props
}: PopoverPrimitive.Positioner.Props & { onPlaced?: () => void }) {
  const positionerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const positioner = positionerRef.current;

    if (!positioner || !onPlaced) {
      return;
    }

    let animationFrame = 0;
    let notified = false;
    const notifyWhenOpen = () => {
      if (!positioner.hasAttribute("data-open")) {
        notified = false;
        return;
      }

      if (!notified) {
        notified = true;
        animationFrame = window.requestAnimationFrame(onPlaced);
      }
    };

    notifyWhenOpen();
    const observer = new MutationObserver(notifyWhenOpen);
    observer.observe(positioner, { attributeFilter: ["data-open"], attributes: true });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, [onPlaced]);

  return <PopoverPrimitive.Positioner ref={positionerRef} {...props} />;
}

function Popover({ onOpenChange, ...props }: PopoverPrimitive.Root.Props) {
  const dismissableLayerHandlersRef = React.useRef<DismissableLayerHandlers>({});
  const contextValue = React.useMemo(() => ({ dismissableLayerHandlersRef }), []);

  const handleOpenChange: NonNullable<PopoverPrimitive.Root.Props["onOpenChange"]> = (
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
    <PopoverContext.Provider value={contextValue}>
      <PopoverPrimitive.Root data-slot="popover" {...props} onOpenChange={handleOpenChange} />
    </PopoverContext.Provider>
  );
}

function PopoverTrigger({
  asChild = false,
  children,
  render,
  ...props
}: PopoverPrimitive.Trigger.Props & {
  asChild?: boolean;
  children?: React.ReactNode;
}) {
  const renderElement = asChild
    ? (React.Children.toArray(children).find(React.isValidElement) as React.ReactElement)
    : render;

  return (
    <PopoverPrimitive.Trigger data-slot="popover-trigger" render={renderElement} {...props}>
      {asChild ? undefined : children}
    </PopoverPrimitive.Trigger>
  );
}

function PopoverContent({
  align = "center",
  alignOffset = 0,
  arrowPadding = 0,
  avoidCollisions = true,
  className,
  collisionAvoidance,
  collisionBoundary,
  collisionPadding = 0,
  disableAnchorTracking,
  finalFocus,
  forceMount,
  hideWhenDetached = false,
  initialFocus,
  onCloseAutoFocus,
  onEscapeKeyDown,
  onFocusOutside,
  onInteractOutside,
  onOpenAutoFocus,
  onPointerDownOutside,
  onPlaced,
  positionMethod,
  side = "bottom",
  sideOffset = 4,
  sticky,
  updatePositionStrategy,
  ...props
}: PopoverContentProps) {
  const { dismissableLayerHandlersRef } = usePopoverContext();
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
    <PopoverPortal forceMount={forceMount}>
      <PopoverPositioner
        align={align}
        alignOffset={alignOffset}
        arrowPadding={arrowPadding}
        collisionAvoidance={
          avoidCollisions
            ? collisionAvoidance
            : { align: "none", fallbackAxisSide: "none", side: "none" }
        }
        collisionBoundary={normalizeCollisionBoundary(collisionBoundary)}
        collisionPadding={collisionPadding}
        disableAnchorTracking={updatePositionStrategy === "always" ? false : disableAnchorTracking}
        onPlaced={onPlaced}
        positionMethod={positionMethod}
        side={side}
        sideOffset={sideOffset}
        sticky={sticky === undefined ? undefined : sticky === "always"}
        className={cn(
          "isolate z-50",
          hideWhenDetached && "data-anchor-hidden:pointer-events-none data-anchor-hidden:invisible",
        )}
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          initialFocus={adaptAutoFocus(
            onOpenAutoFocus,
            initialFocus,
            "focusScope.autoFocusOnMount",
          )}
          finalFocus={adaptAutoFocus(onCloseAutoFocus, finalFocus, "focusScope.autoFocusOnUnmount")}
          className={cn(
            "z-50 flex w-72 origin-(--transform-origin) flex-col gap-2.5 rounded-base border-2 border-border bg-main p-4 font-base text-main-foreground outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className,
          )}
          {...props}
        />
      </PopoverPositioner>
    </PopoverPortal>
  );
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-0.5 text-sm", className)}
      {...props}
    />
  );
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn("font-heading", className)}
      {...props}
    />
  );
}

function PopoverDescription({ className, ...props }: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn("text-main-foreground", className)}
      {...props}
    />
  );
}

export { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger };
