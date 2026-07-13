"use client";

import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card";
import * as React from "react";

import { cn } from "@/lib/utils";

type HoverCardDelayContract = {
  closeDelay: number;
  openDelay: number;
};

const HoverCardDelayContext = React.createContext<HoverCardDelayContract>({
  closeDelay: 300,
  openDelay: 700,
});
const HoverCardOpenContext = React.createContext(false);
type HoverCardPortalContextValue = {
  container: HTMLElement | null;
  setContainer: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
};
const HoverCardPortalContext = React.createContext<HoverCardPortalContextValue | null>(null);

type HoverCardPointerDownOutsideEvent = CustomEvent<{ originalEvent: PointerEvent }>;
type HoverCardFocusOutsideEvent = CustomEvent<{ originalEvent: FocusEvent }>;
type HoverCardInteractOutsideEvent = HoverCardPointerDownOutsideEvent | HoverCardFocusOutsideEvent;

type HoverCardDismissHandlers = {
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onFocusOutside?: (event: HoverCardFocusOutsideEvent) => void;
  onInteractOutside?: (event: HoverCardInteractOutsideEvent) => void;
  onPointerDownOutside?: (event: HoverCardPointerDownOutsideEvent) => void;
};

const HoverCardDismissContext =
  React.createContext<React.RefObject<HoverCardDismissHandlers> | null>(null);

type CollisionBoundary =
  | PreviewCardPrimitive.Positioner.Props["collisionBoundary"]
  | null
  | Array<Element | null>;
type CSSPropertiesWithVariables = React.CSSProperties & {
  [name: `--${string}`]: string | number | undefined;
};
type HoverCardPositioningProps = Pick<
  PreviewCardPrimitive.Positioner.Props,
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
  hideWhenDetached?: boolean;
  sticky?: "partial" | "always";
  updatePositionStrategy?: "optimized" | "always";
};

const hoverCardCssVariables: CSSPropertiesWithVariables = {
  "--radix-hover-card-content-available-height": "var(--available-height)",
  "--radix-hover-card-content-available-width": "var(--available-width)",
  "--radix-hover-card-content-transform-origin": "var(--transform-origin)",
  "--radix-hover-card-trigger-height": "var(--anchor-height)",
  "--radix-hover-card-trigger-width": "var(--anchor-width)",
};

function mergePopupStyle(
  style: PreviewCardPrimitive.Popup.Props["style"],
): PreviewCardPrimitive.Popup.Props["style"] {
  if (typeof style === "function") {
    return (state) => ({ ...hoverCardCssVariables, ...style(state) });
  }

  return { ...hoverCardCssVariables, ...style };
}

function normalizeCollisionBoundary(
  collisionBoundary: CollisionBoundary | undefined,
): PreviewCardPrimitive.Positioner.Props["collisionBoundary"] {
  if (Array.isArray(collisionBoundary)) {
    const boundaries: Element[] = [];
    for (const boundary of collisionBoundary) {
      if (boundary) boundaries.push(boundary);
    }
    return boundaries;
  }

  return collisionBoundary ?? undefined;
}

function preserveRadixEventCancellation(
  child: React.ReactElement<{ [key: string]: unknown; children?: React.ReactNode }>,
) {
  const eventProps: Record<string, unknown> = {};

  for (const [name, handler] of Object.entries(child.props)) {
    if (/^on[A-Z]/.test(name) && typeof handler === "function") {
      eventProps[name] = (...args: unknown[]) => {
        (handler as (...handlerArgs: unknown[]) => void)(...args);
        const event = args[0] as
          | { defaultPrevented?: boolean; preventBaseUIHandler?: () => void }
          | undefined;
        if (event?.defaultPrevented) event.preventBaseUIHandler?.();
      };
    }
  }

  return React.cloneElement(child, eventProps);
}

function getAsChildElement(children: React.ReactNode, componentName: string) {
  const child = React.Children.toArray(children).find(React.isValidElement);

  if (!child) {
    throw new Error(`${componentName} with asChild requires a valid React element child.`);
  }

  return preserveRadixEventCancellation(
    child as React.ReactElement<{
      [key: string]: unknown;
      children?: React.ReactNode;
    }>,
  );
}

function setRefValue<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

function toPointerEvent(originalEvent: Event) {
  if (originalEvent instanceof PointerEvent) {
    return originalEvent;
  }

  const mouseEvent = originalEvent instanceof MouseEvent ? originalEvent : undefined;
  return new PointerEvent(originalEvent.type, {
    altKey: mouseEvent?.altKey,
    bubbles: originalEvent.bubbles,
    button: mouseEvent?.button,
    buttons: mouseEvent?.buttons,
    cancelable: originalEvent.cancelable,
    clientX: mouseEvent?.clientX,
    clientY: mouseEvent?.clientY,
    composed: originalEvent.composed,
    ctrlKey: mouseEvent?.ctrlKey,
    metaKey: mouseEvent?.metaKey,
    pointerType:
      typeof TouchEvent !== "undefined" && originalEvent instanceof TouchEvent ? "touch" : "mouse",
    shiftKey: mouseEvent?.shiftKey,
  });
}

function createPointerDownOutsideEvent(name: string, originalEvent: Event) {
  const event = new CustomEvent<{ originalEvent: PointerEvent }>(name, {
    cancelable: true,
    detail: { originalEvent: toPointerEvent(originalEvent) },
  });

  Object.defineProperty(event, "target", {
    configurable: true,
    value: originalEvent.target,
  });

  return event;
}

function HoverCard({
  closeDelay = 300,
  defaultOpen = false,
  onOpenChange,
  open: openProp,
  openDelay = 700,
  ...props
}: PreviewCardPrimitive.Root.Props & {
  closeDelay?: number;
  openDelay?: number;
}) {
  const dismissHandlersRef = React.useRef<HoverCardDismissHandlers>({});
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const [container, setContainer] = React.useState<HTMLElement | null>(null);
  const open = openProp ?? uncontrolledOpen;
  const portalContext = React.useMemo(() => ({ container, setContainer }), [container]);

  return (
    <HoverCardPortalContext.Provider value={portalContext}>
      <HoverCardDelayContext.Provider value={{ closeDelay, openDelay }}>
        <HoverCardOpenContext.Provider value={open}>
          <HoverCardDismissContext.Provider value={dismissHandlersRef}>
            <PreviewCardPrimitive.Root
              data-slot="hover-card"
              defaultOpen={defaultOpen}
              open={openProp}
              onOpenChange={(nextOpen, eventDetails) => {
                if (!nextOpen && eventDetails.reason === "escape-key") {
                  const keyboardEvent = eventDetails.event;
                  if (keyboardEvent instanceof KeyboardEvent) {
                    dismissHandlersRef.current.onEscapeKeyDown?.(keyboardEvent);
                    if (keyboardEvent.defaultPrevented) {
                      eventDetails.cancel();
                    }
                  }
                } else if (!nextOpen && eventDetails.reason === "outside-press") {
                  const pointerEvent = createPointerDownOutsideEvent(
                    "hoverCard.pointerDownOutside",
                    eventDetails.event,
                  );
                  dismissHandlersRef.current.onPointerDownOutside?.(pointerEvent);
                  dismissHandlersRef.current.onInteractOutside?.(pointerEvent);
                  if (pointerEvent.defaultPrevented) {
                    eventDetails.cancel();
                  }
                }

                if (!eventDetails.isCanceled) {
                  onOpenChange?.(nextOpen, eventDetails);
                }
                if (!eventDetails.isCanceled && openProp === undefined) {
                  setUncontrolledOpen(nextOpen);
                }
              }}
              {...props}
            />
          </HoverCardDismissContext.Provider>
        </HoverCardOpenContext.Provider>
      </HoverCardDelayContext.Provider>
    </HoverCardPortalContext.Provider>
  );
}

const HoverCardTrigger = React.forwardRef<
  HTMLElement,
  PreviewCardPrimitive.Trigger.Props & {
    asChild?: boolean;
    children?: React.ReactNode;
  }
>(function HoverCardTrigger(
  { asChild = false, children, closeDelay, delay, render, ...props },
  forwardedRef,
) {
  const rootDelay = React.useContext(HoverCardDelayContext);
  const open = React.useContext(HoverCardOpenContext);
  const portalContext = React.useContext(HoverCardPortalContext);
  const setPortalContainer = portalContext?.setContainer;
  const renderElement = asChild ? getAsChildElement(children, "HoverCardTrigger") : render;
  const mergedRef = React.useCallback(
    (trigger: HTMLElement | null) => {
      setRefValue(forwardedRef, trigger);
      const nextContainer = trigger?.parentElement ?? null;
      setPortalContainer?.((current) => (current === nextContainer ? current : nextContainer));
    },
    [forwardedRef, setPortalContainer],
  );

  return (
    <PreviewCardPrimitive.Trigger
      ref={mergedRef}
      data-slot="hover-card-trigger"
      data-state={open ? "open" : "closed"}
      closeDelay={closeDelay ?? rootDelay.closeDelay}
      delay={delay ?? rootDelay.openDelay}
      render={renderElement}
      {...props}
    >
      {asChild ? undefined : children}
    </PreviewCardPrimitive.Trigger>
  );
});

type HoverCardContentProps = PreviewCardPrimitive.Popup.Props &
  HoverCardPositioningProps & {
    asChild?: boolean;
    forceMount?: true;
    keepMounted?: boolean;
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    onFocusOutside?: (event: HoverCardFocusOutsideEvent) => void;
    onInteractOutside?: (event: HoverCardInteractOutsideEvent) => void;
    onPointerDownOutside?: (event: HoverCardPointerDownOutsideEvent) => void;
  };

const HoverCardContent = React.forwardRef<HTMLDivElement, HoverCardContentProps>(
  function HoverCardContent(
    {
      className,
      arrowPadding = 0,
      asChild = false,
      avoidCollisions = true,
      children,
      collisionAvoidance,
      collisionBoundary,
      collisionPadding = 0,
      disableAnchorTracking,
      forceMount,
      hideWhenDetached = false,
      keepMounted,
      side = "bottom",
      sideOffset = 4,
      align = "center",
      alignOffset = 0,
      onEscapeKeyDown,
      onFocusOutside,
      onInteractOutside,
      onPointerDownOutside,
      positionMethod = "fixed",
      render,
      sticky,
      style,
      updatePositionStrategy,
      ...props
    },
    forwardedRef,
  ) {
    const dismissHandlersRef = React.useContext(HoverCardDismissContext);
    const open = React.useContext(HoverCardOpenContext);
    const portalContext = React.useContext(HoverCardPortalContext);
    const renderElement = asChild ? getAsChildElement(children, "HoverCardContent") : render;
    const [popupElement, setPopupElement] = React.useState<HTMLDivElement | null>(null);
    const mergedRef = React.useCallback(
      (popup: HTMLDivElement | null) => {
        setPopupElement(popup);
        setRefValue(forwardedRef, popup);
      },
      [forwardedRef],
    );

    React.useLayoutEffect(() => {
      if (dismissHandlersRef === null) {
        return undefined;
      }

      const handlers = {
        onEscapeKeyDown,
        onFocusOutside,
        onInteractOutside,
        onPointerDownOutside,
      };
      dismissHandlersRef.current = handlers;
      return () => {
        if (dismissHandlersRef.current === handlers) {
          dismissHandlersRef.current = {};
        }
      };
    }, [
      dismissHandlersRef,
      onEscapeKeyDown,
      onFocusOutside,
      onInteractOutside,
      onPointerDownOutside,
    ]);

    React.useEffect(() => {
      if (popupElement === null) {
        return undefined;
      }

      const disableTabStops = () => {
        const candidates = popupElement.querySelectorAll<HTMLElement>(
          "a[href], button, input, select, textarea, [tabindex]",
        );

        candidates.forEach((candidate) => {
          candidate.tabIndex = -1;
        });
      };

      disableTabStops();
      const observer = new MutationObserver(disableTabStops);
      observer.observe(popupElement, { childList: true, subtree: true });

      return () => observer.disconnect();
    }, [popupElement]);

    return (
      <PreviewCardPrimitive.Portal
        container={portalContext?.container}
        data-slot="hover-card-portal"
        keepMounted={keepMounted ?? forceMount}
      >
        <PreviewCardPrimitive.Positioner
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
          disableAnchorTracking={
            updatePositionStrategy === "always" ? false : disableAnchorTracking
          }
          positionMethod={positionMethod}
          side={side}
          sideOffset={sideOffset}
          sticky={sticky === undefined ? undefined : sticky === "always"}
          className={cn(
            "isolate z-50",
            hideWhenDetached &&
              "data-anchor-hidden:pointer-events-none data-anchor-hidden:invisible",
          )}
        >
          <PreviewCardPrimitive.Popup
            ref={mergedRef}
            data-slot="hover-card-content"
            data-state={open ? "open" : "closed"}
            render={renderElement}
            style={mergePopupStyle(style)}
            className={cn(
              "z-50 w-64 origin-(--transform-origin) rounded-base border-2 border-border bg-main p-4 font-base text-main-foreground outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
              className,
            )}
            {...props}
          >
            {asChild ? undefined : children}
          </PreviewCardPrimitive.Popup>
        </PreviewCardPrimitive.Positioner>
      </PreviewCardPrimitive.Portal>
    );
  },
);

export { HoverCard, HoverCardTrigger, HoverCardContent };
