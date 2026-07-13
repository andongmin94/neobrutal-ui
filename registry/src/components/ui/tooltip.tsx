"use client";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import * as React from "react";

import { cn } from "@/lib/utils";

type TooltipProviderContract = {
  delayDuration?: number;
  disableHoverableContent: boolean;
};

type TooltipRootContract = {
  contentId: string;
  dataState: "closed" | "delayed-open" | "instant-open";
  delayDuration?: number;
  dismissHandlersRef: React.RefObject<TooltipDismissHandlers>;
  hoverStartedAtRef: React.RefObject<number | null>;
  open: boolean;
  portalContainer: HTMLElement | null;
  setContentId: React.Dispatch<React.SetStateAction<string>>;
  setPortalContainer: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
  setTriggerDelay: React.Dispatch<React.SetStateAction<number>>;
};

type TooltipPointerDownOutsideEvent = CustomEvent<{ originalEvent: PointerEvent }>;

type TooltipDismissHandlers = {
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: TooltipPointerDownOutsideEvent) => void;
};

type CollisionBoundary =
  | TooltipPrimitive.Positioner.Props["collisionBoundary"]
  | null
  | Array<Element | null>;
type CSSPropertiesWithVariables = React.CSSProperties & {
  [name: `--${string}`]: string | number | undefined;
};
type TooltipPositioningProps = Pick<
  TooltipPrimitive.Positioner.Props,
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

const tooltipCssVariables: CSSPropertiesWithVariables = {
  "--radix-tooltip-content-available-height": "var(--available-height)",
  "--radix-tooltip-content-available-width": "var(--available-width)",
  "--radix-tooltip-content-transform-origin": "var(--transform-origin)",
  "--radix-tooltip-trigger-height": "var(--anchor-height)",
  "--radix-tooltip-trigger-width": "var(--anchor-width)",
};

const TooltipProviderContractContext = React.createContext<TooltipProviderContract | undefined>(
  undefined,
);
const TooltipRootContractContext = React.createContext<TooltipRootContract | null>(null);

function mergePopupStyle(
  style: TooltipPrimitive.Popup.Props["style"],
): TooltipPrimitive.Popup.Props["style"] {
  if (typeof style === "function") {
    return (state) => ({ ...tooltipCssVariables, ...style(state) });
  }

  return { ...tooltipCssVariables, ...style };
}

function normalizeCollisionBoundary(
  collisionBoundary: CollisionBoundary | undefined,
): TooltipPrimitive.Positioner.Props["collisionBoundary"] {
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
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
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

function createPointerDownOutsideEvent(originalEvent: Event) {
  const event = new CustomEvent<{ originalEvent: PointerEvent }>("tooltip.pointerDownOutside", {
    cancelable: true,
    detail: { originalEvent: toPointerEvent(originalEvent) },
  });

  Object.defineProperty(event, "target", {
    configurable: true,
    value: originalEvent.target,
  });

  return event;
}

function TooltipProvider({
  delay,
  delayDuration = 0,
  disableHoverableContent = false,
  skipDelayDuration = 300,
  timeout,
  ...props
}: TooltipPrimitive.Provider.Props & {
  delayDuration?: TooltipPrimitive.Provider.Props["delay"];
  disableHoverableContent?: boolean;
  skipDelayDuration?: number;
}) {
  const resolvedDelay = delay ?? delayDuration;

  return (
    <TooltipProviderContractContext.Provider
      value={{ delayDuration: resolvedDelay, disableHoverableContent }}
    >
      <TooltipPrimitive.Provider
        data-slot="tooltip-provider"
        delay={resolvedDelay}
        timeout={timeout ?? skipDelayDuration}
        {...props}
      />
    </TooltipProviderContractContext.Provider>
  );
}

function Tooltip({
  defaultOpen = false,
  delayDuration,
  disableHoverableContent,
  disableHoverablePopup,
  onOpenChange,
  open: openProp,
  ...props
}: TooltipPrimitive.Root.Props & {
  delayDuration?: number;
  disableHoverableContent?: boolean;
}) {
  const providerContract = React.useContext(TooltipProviderContractContext);
  const resolvedDelay = delayDuration ?? providerContract?.delayDuration ?? 600;
  const resolvedDisableHoverablePopup =
    disableHoverablePopup ??
    disableHoverableContent ??
    providerContract?.disableHoverableContent ??
    false;
  const generatedContentId = React.useId();
  const [contentId, setContentId] = React.useState(generatedContentId);
  const [triggerDelay, setTriggerDelay] = React.useState(resolvedDelay);
  const [openKind, setOpenKind] = React.useState<"delayed-open" | "instant-open">("instant-open");
  const [portalContainer, setPortalContainer] = React.useState<HTMLElement | null>(null);
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const dismissHandlersRef = React.useRef<TooltipDismissHandlers>({});
  const hoverStartedAtRef = React.useRef<number | null>(null);
  const previousOpenRef = React.useRef(open);
  const openKindSetByEventRef = React.useRef(false);

  React.useLayoutEffect(() => {
    if (open && !previousOpenRef.current) {
      if (!openKindSetByEventRef.current) setOpenKind("instant-open");
      openKindSetByEventRef.current = false;
    }
    previousOpenRef.current = open;
  }, [open]);

  return (
    <TooltipRootContractContext.Provider
      value={{
        contentId,
        dataState: open ? openKind : "closed",
        delayDuration: resolvedDelay,
        dismissHandlersRef,
        hoverStartedAtRef,
        open,
        portalContainer,
        setContentId,
        setPortalContainer,
        setTriggerDelay,
      }}
    >
      <TooltipPrimitive.Root
        data-slot="tooltip"
        defaultOpen={defaultOpen}
        disableHoverablePopup={resolvedDisableHoverablePopup}
        open={open}
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
            const outsideEvent = createPointerDownOutsideEvent(eventDetails.event);
            dismissHandlersRef.current.onPointerDownOutside?.(outsideEvent);
            if (outsideEvent.defaultPrevented) {
              eventDetails.cancel();
            }
          }

          if (eventDetails.isCanceled) {
            return;
          }

          if (nextOpen) {
            const hoverElapsed =
              hoverStartedAtRef.current === null ? 0 : Date.now() - hoverStartedAtRef.current;
            const delayed =
              eventDetails.reason === "trigger-hover" &&
              triggerDelay > 0 &&
              hoverElapsed >= Math.max(0, triggerDelay - 32);
            setOpenKind(delayed ? "delayed-open" : "instant-open");
            openKindSetByEventRef.current = true;
          }

          onOpenChange?.(nextOpen, eventDetails);
          if (!eventDetails.isCanceled && openProp === undefined) {
            setUncontrolledOpen(nextOpen);
          }
        }}
        {...props}
      />
    </TooltipRootContractContext.Provider>
  );
}

type TooltipTriggerProps = TooltipPrimitive.Trigger.Props & {
  asChild?: boolean;
  children?: React.ReactNode;
};

const TooltipTrigger = React.forwardRef<HTMLButtonElement, TooltipTriggerProps>(
  function TooltipTrigger(
    {
      "aria-describedby": ariaDescribedBy,
      asChild = false,
      children,
      delay,
      onFocus,
      onPointerEnter,
      render,
      ...props
    },
    forwardedRef,
  ) {
    const rootContract = React.useContext(TooltipRootContractContext);
    const hoverStartedAtRef = rootContract?.hoverStartedAtRef;
    const setPortalContainer = rootContract?.setPortalContainer;
    const child = asChild ? getAsChildElement(children, "TooltipTrigger") : undefined;

    const renderElement = asChild ? child : render;
    const setTriggerDelay = rootContract?.setTriggerDelay;
    const describedBy =
      rootContract?.open === true
        ? [ariaDescribedBy, rootContract.contentId].filter(Boolean).join(" ")
        : ariaDescribedBy;
    const mergedRef = React.useCallback(
      (trigger: HTMLButtonElement | null) => {
        setRefValue(forwardedRef, trigger);
        const nextContainer = trigger?.parentElement ?? null;
        setPortalContainer?.((current) => (current === nextContainer ? current : nextContainer));
      },
      [forwardedRef, setPortalContainer],
    );

    React.useLayoutEffect(() => {
      setTriggerDelay?.(delay ?? rootContract?.delayDuration ?? 600);
    }, [delay, rootContract?.delayDuration, setTriggerDelay]);

    return (
      <TooltipPrimitive.Trigger
        ref={mergedRef}
        data-slot="tooltip-trigger"
        data-state={rootContract?.dataState}
        aria-describedby={describedBy || undefined}
        delay={delay ?? rootContract?.delayDuration}
        onFocus={(event) => {
          if (hoverStartedAtRef) hoverStartedAtRef.current = null;
          onFocus?.(event);
          if (event.defaultPrevented) event.preventBaseUIHandler();
        }}
        onPointerEnter={(event) => {
          if (hoverStartedAtRef) hoverStartedAtRef.current = Date.now();
          onPointerEnter?.(event);
          if (event.defaultPrevented) event.preventBaseUIHandler();
        }}
        render={renderElement}
        {...props}
      >
        {asChild ? undefined : children}
      </TooltipPrimitive.Trigger>
    );
  },
);

function TooltipContent({
  align = "center",
  alignOffset = 0,
  arrowPadding = 0,
  asChild = false,
  avoidCollisions = true,
  className,
  collisionAvoidance,
  collisionBoundary,
  collisionPadding = 0,
  disableAnchorTracking,
  id,
  forceMount,
  hideWhenDetached = false,
  keepMounted,
  onEscapeKeyDown,
  onPointerDownOutside,
  role,
  render,
  side = "top",
  sideOffset = 4,
  positionMethod = "fixed",
  sticky,
  style,
  updatePositionStrategy,
  children,
  ...props
}: TooltipPrimitive.Popup.Props &
  TooltipPositioningProps & {
    asChild?: boolean;
    forceMount?: true;
    keepMounted?: boolean;
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    onPointerDownOutside?: (event: TooltipPointerDownOutsideEvent) => void;
  }) {
  const rootContract = React.useContext(TooltipRootContractContext);
  const resolvedId = id ?? rootContract?.contentId;
  const child = asChild ? getAsChildElement(children, "TooltipContent") : null;
  const popupChildren = <>{child ? child.props.children : children}</>;
  const renderElement = child ? React.cloneElement(child, undefined, popupChildren) : render;

  React.useLayoutEffect(() => {
    if (rootContract === null) {
      return undefined;
    }

    if (resolvedId !== undefined) {
      rootContract.setContentId(resolvedId);
    }
    const handlers = { onEscapeKeyDown, onPointerDownOutside };
    const handlersRef = rootContract.dismissHandlersRef;
    handlersRef.current = handlers;
    return () => {
      if (handlersRef.current === handlers) {
        handlersRef.current = {};
      }
    };
  }, [onEscapeKeyDown, onPointerDownOutside, resolvedId, rootContract]);

  return (
    <TooltipPrimitive.Portal
      container={rootContract?.portalContainer}
      keepMounted={keepMounted ?? forceMount}
    >
      <TooltipPrimitive.Positioner
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
        positionMethod={positionMethod}
        side={side}
        sideOffset={sideOffset}
        sticky={sticky === undefined ? undefined : sticky === "always"}
        className={cn(
          "isolate z-50",
          hideWhenDetached && "data-anchor-hidden:pointer-events-none data-anchor-hidden:invisible",
        )}
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          data-state={rootContract?.dataState}
          id={resolvedId}
          render={renderElement}
          role={role ?? "tooltip"}
          style={mergePopupStyle(style)}
          className={cn(
            "z-50 origin-(--transform-origin) overflow-hidden rounded-base border-2 border-border bg-main px-3 py-1.5 text-sm font-base text-main-foreground animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className,
          )}
          {...props}
        >
          {child ? undefined : popupChildren}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
