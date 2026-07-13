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
    asChild?: boolean;
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
  open: boolean;
};

type PreventableBaseUIEvent = {
  readonly baseUIHandlerPrevented?: boolean;
  readonly defaultPrevented?: boolean;
  preventBaseUIHandler?: () => void;
};
type EventHandler = (...args: unknown[]) => unknown;
type RenderFunction = (props: Record<string, unknown>, state: unknown) => React.ReactElement;

function adaptEventHandlers(props: Record<string, unknown>, beforeBaseUIHandler: boolean) {
  const eventHandlers: Record<string, EventHandler> = {};

  for (const [name, handler] of Object.entries(props)) {
    if (!/^on[A-Z]/.test(name) || typeof handler !== "function") {
      continue;
    }

    eventHandlers[name] = (...args) => {
      const event = args[0] as PreventableBaseUIEvent | undefined;
      if (beforeBaseUIHandler && event?.defaultPrevented) {
        event.preventBaseUIHandler?.();
      }
      if (beforeBaseUIHandler && event?.baseUIHandlerPrevented) {
        return undefined;
      }

      const result = handler(...args);
      if (!beforeBaseUIHandler && event?.defaultPrevented) {
        event.preventBaseUIHandler?.();
      }
      return result;
    };
  }

  return eventHandlers;
}

function adaptRenderEventHandlers<Render>(render: Render): Render {
  if (React.isValidElement(render)) {
    const element = render as React.ReactElement<Record<string, unknown>>;
    const eventHandlers = adaptEventHandlers(element.props, false);
    return (Object.keys(eventHandlers).length === 0
      ? render
      : React.cloneElement(element, eventHandlers)) as unknown as Render;
  }
  if (typeof render === "function") {
    const renderFunction = render as RenderFunction;
    return ((props: Record<string, unknown>, state: unknown) =>
      renderFunction({ ...props, ...adaptEventHandlers(props, true) }, state)) as unknown as Render;
  }
  return render;
}

type CSSPropertiesWithVariables = React.CSSProperties & {
  [name: `--${string}`]: string | number | undefined;
};

const popoverCssVariables: CSSPropertiesWithVariables = {
  "--radix-popover-content-available-height": "var(--available-height)",
  "--radix-popover-content-available-width": "var(--available-width)",
  "--radix-popover-content-transform-origin": "var(--transform-origin)",
  "--radix-popover-trigger-height": "var(--anchor-height)",
  "--radix-popover-trigger-width": "var(--anchor-width)",
};

const PopoverContext = React.createContext<PopoverContextProps | null>(null);

function usePopoverContext() {
  const context = React.useContext(PopoverContext);

  if (!context) {
    throw new Error("Popover components must be used within Popover.");
  }

  return context;
}

function mergePopupStyle(
  style: PopoverPrimitive.Popup.Props["style"],
): PopoverPrimitive.Popup.Props["style"] {
  if (typeof style === "function") {
    return (state) => ({ ...popoverCssVariables, ...style(state) });
  }

  return { ...popoverCssVariables, ...style };
}

function getAsChildElement(children: React.ReactNode, componentName: string) {
  const child = React.Children.toArray(children).find(React.isValidElement);

  if (!child) {
    throw new Error(`${componentName} with asChild requires a valid React element child.`);
  }

  return child as React.ReactElement<{
    [key: string]: unknown;
    children?: React.ReactNode;
  }>;
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

function Popover({
  defaultOpen = false,
  onOpenChange,
  open: openProp,
  ...props
}: PopoverPrimitive.Root.Props) {
  const dismissableLayerHandlersRef = React.useRef<DismissableLayerHandlers>({});
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const contextValue = React.useMemo(() => ({ dismissableLayerHandlersRef, open }), [open]);

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
    if (!eventDetails.isCanceled && openProp === undefined) {
      setUncontrolledOpen(open);
    }
  };

  return (
    <PopoverContext.Provider value={contextValue}>
      <PopoverPrimitive.Root
        data-slot="popover"
        defaultOpen={defaultOpen}
        open={openProp}
        {...props}
        onOpenChange={handleOpenChange}
      />
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
  const { open } = usePopoverContext();
  const renderElement = asChild ? getAsChildElement(children, "PopoverTrigger") : render;

  return (
    <PopoverPrimitive.Trigger
      data-slot="popover-trigger"
      data-state={open ? "open" : "closed"}
      render={adaptRenderEventHandlers(renderElement)}
      {...props}
    >
      {asChild ? undefined : children}
    </PopoverPrimitive.Trigger>
  );
}

function PopoverContent({
  align = "center",
  alignOffset = 0,
  arrowPadding = 0,
  asChild = false,
  avoidCollisions = true,
  className,
  children,
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
  render,
  side = "bottom",
  sideOffset = 4,
  sticky,
  style,
  updatePositionStrategy,
  ...props
}: PopoverContentProps) {
  const { dismissableLayerHandlersRef, open } = usePopoverContext();
  const renderElement = asChild ? getAsChildElement(children, "PopoverContent") : render;
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
          data-state={open ? "open" : "closed"}
          initialFocus={adaptAutoFocus(
            onOpenAutoFocus,
            initialFocus,
            "focusScope.autoFocusOnMount",
          )}
          finalFocus={adaptAutoFocus(onCloseAutoFocus, finalFocus, "focusScope.autoFocusOnUnmount")}
          render={adaptRenderEventHandlers(renderElement)}
          style={mergePopupStyle(style)}
          className={cn(
            "z-50 w-72 origin-(--transform-origin) rounded-base border-2 border-border bg-main p-4 text-foreground outline-none duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className,
          )}
          {...props}
        >
          {asChild ? undefined : children}
        </PopoverPrimitive.Popup>
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

function PopoverTitle({
  asChild = false,
  children,
  className,
  render,
  ...props
}: PopoverPrimitive.Title.Props & { asChild?: boolean }) {
  const renderElement = asChild ? getAsChildElement(children, "PopoverTitle") : render;

  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      render={adaptRenderEventHandlers(renderElement)}
      className={cn("font-heading", className)}
      {...props}
    >
      {asChild ? undefined : children}
    </PopoverPrimitive.Title>
  );
}

function PopoverDescription({
  asChild = false,
  children,
  className,
  render,
  ...props
}: PopoverPrimitive.Description.Props & { asChild?: boolean }) {
  const renderElement = asChild ? getAsChildElement(children, "PopoverDescription") : render;

  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      render={adaptRenderEventHandlers(renderElement)}
      className={cn("text-main-foreground", className)}
      {...props}
    >
      {asChild ? undefined : children}
    </PopoverPrimitive.Description>
  );
}

export { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger };
