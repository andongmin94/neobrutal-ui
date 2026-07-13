"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";

import { cn } from "@/lib/utils";

type AutoFocusEventHandler = (event: Event) => void;
type FocusTarget = DrawerPrimitive.Popup.Props["initialFocus"];
type PointerDownOutsideEvent = CustomEvent<{ originalEvent: PointerEvent }>;
type FocusOutsideEvent = CustomEvent<{ originalEvent: FocusEvent }>;
type DismissableLayerHandlers = {
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onFocusOutside?: (event: FocusOutsideEvent) => void;
  onInteractOutside?: (event: FocusOutsideEvent | PointerDownOutsideEvent) => void;
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
};
type DrawerDirection = "bottom" | "left" | "right" | "top";
type DrawerSnapPoint = DrawerPrimitive.Root.SnapPoint;
type DrawerDragMetrics = {
  active: boolean;
  event: React.PointerEvent<HTMLDivElement> | null;
  percentage: number;
  pointerType: string;
  releaseScheduled: boolean;
  velocity: number;
};
type DrawerProps = DrawerPrimitive.Root.Props & {
  activeSnapPoint?: DrawerSnapPoint | null;
  autoFocus?: boolean;
  closeThreshold?: number;
  container?: HTMLElement | null;
  direction?: DrawerDirection;
  disablePreventScroll?: boolean;
  dismissible?: boolean;
  fadeFromIndex?: number;
  fixed?: boolean;
  handleOnly?: boolean;
  nested?: boolean;
  noBodyStyles?: boolean;
  onAnimationEnd?: (open: boolean) => void;
  onClose?: () => void;
  onDrag?: (event: React.PointerEvent<HTMLDivElement>, percentageDragged: number) => void;
  onRelease?: (event: React.PointerEvent<HTMLDivElement>, open: boolean) => void;
  preventScrollRestoration?: boolean;
  repositionInputs?: boolean;
  scrollLockTimeout?: number;
  setActiveSnapPoint?: (snapPoint: DrawerSnapPoint | null) => void;
  setBackgroundColorOnScale?: boolean;
  shouldScaleBackground?: boolean;
  showSwipeHandle?: boolean;
  snapToSequentialPoint?: boolean;
};
type DrawerPortalProps = DrawerPrimitive.Portal.Props & {
  forceMount?: boolean;
};
type DrawerOverlayProps = DrawerPrimitive.Backdrop.Props & {
  asChild?: boolean;
  children?: React.ReactNode;
  forceMount?: boolean;
};
type DrawerContentProps = DrawerPrimitive.Popup.Props & {
  asChild?: boolean;
  children?: React.ReactNode;
  forceMount?: boolean;
  onCloseAutoFocus?: AutoFocusEventHandler;
  onOpenAutoFocus?: AutoFocusEventHandler;
} & DismissableLayerHandlers;

type DrawerContextProps = {
  actionsRef: React.RefObject<DrawerPrimitive.Root.Actions | null>;
  activeSnapPoint: DrawerSnapPoint | null;
  autoFocus: boolean;
  closeThreshold: number;
  container: HTMLElement | null | undefined;
  direction: DrawerDirection;
  disablePreventScroll: boolean;
  dismissible: boolean;
  dismissableLayerHandlersRef: React.RefObject<DismissableLayerHandlers>;
  dragMetricsRef: React.RefObject<DrawerDragMetrics>;
  fadeFromIndex: number | undefined;
  fadeRange: number;
  fadeStart: number;
  fixed: boolean | undefined;
  handleOnly: boolean;
  hasSnapPoints: boolean;
  lastScrollTimeRef: React.RefObject<number>;
  modal: DrawerPrimitive.Root.Props["modal"];
  nested: boolean | undefined;
  noBodyStyles: boolean;
  onDrag: DrawerProps["onDrag"];
  open: boolean;
  openRef: React.RefObject<boolean>;
  popupRef: React.RefObject<HTMLDivElement | null>;
  preventScrollRestoration: boolean;
  repositionInputs: boolean;
  scheduleRelease: (event: React.PointerEvent<HTMLDivElement>) => void;
  scrollLockTimeout: number;
  shouldFade: boolean;
  showSwipeHandle: boolean;
  snapPointOffset: string | undefined;
  swipeDirection: NonNullable<DrawerPrimitive.Root.Props["swipeDirection"]>;
};

type DrawerOverlayStyle = React.CSSProperties & {
  "--vaul-fade-range"?: number;
  "--vaul-fade-start"?: number;
};

type DrawerContentStyle = React.CSSProperties & {
  "--snap-point-height"?: string;
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

function toSwipeDirection(direction?: DrawerDirection) {
  if (direction === "bottom") {
    return "down";
  }

  if (direction === "top") {
    return "up";
  }

  return direction;
}

function fromSwipeDirection(
  swipeDirection: NonNullable<DrawerPrimitive.Root.Props["swipeDirection"]>,
): DrawerDirection {
  if (swipeDirection === "down") {
    return "bottom";
  }

  if (swipeDirection === "up") {
    return "top";
  }

  return swipeDirection;
}

function getDrawerAxisSize(direction: DrawerDirection, container?: HTMLElement | null) {
  if (container) {
    const rect = container.getBoundingClientRect();
    return direction === "bottom" || direction === "top" ? rect.height : rect.width;
  }

  if (typeof window === "undefined") {
    return 0;
  }

  return direction === "bottom" || direction === "top" ? window.innerHeight : window.innerWidth;
}

function getSnapPointValue(
  snapPoint: DrawerSnapPoint,
  direction: DrawerDirection,
  container?: HTMLElement | null,
) {
  if (typeof snapPoint === "number") {
    if (snapPoint <= 1) {
      return snapPoint;
    }

    const axisSize = getDrawerAxisSize(direction, container);
    return axisSize > 0 ? snapPoint / axisSize : snapPoint;
  }

  const parsed = Number.parseFloat(snapPoint);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  const axisSize = getDrawerAxisSize(direction, container);
  if (snapPoint.endsWith("rem")) {
    const rootFontSize =
      typeof document === "undefined"
        ? 16
        : Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    return axisSize > 0 ? (parsed * rootFontSize) / axisSize : parsed;
  }

  return axisSize > 0 ? parsed / axisSize : parsed;
}

function getVaulFadeRange(
  snapPoints: DrawerSnapPoint[] | undefined,
  fadeFromIndex: number | undefined,
  direction: DrawerDirection,
  container?: HTMLElement | null,
) {
  if (!snapPoints?.length || fadeFromIndex === undefined) {
    return { fadeRange: 1, fadeStart: 0 };
  }

  const index = Math.min(Math.max(fadeFromIndex, 0), snapPoints.length - 1);
  if (index === 0) {
    return { fadeRange: 1, fadeStart: -1 };
  }

  const values = snapPoints.map((snapPoint) => getSnapPointValue(snapPoint, direction, container));
  const first = values[0];
  const last = values[values.length - 1];
  const previous = values[index - 1];
  const current = values[index];

  if (first === null || last === null || previous === null || current === null || first === last) {
    const denominator = Math.max(snapPoints.length - 1, 1);
    return { fadeRange: 1 / denominator, fadeStart: (index - 1) / denominator };
  }

  const fadeStart = (previous - first) / (last - first);
  const fadeEnd = (current - first) / (last - first);
  return {
    fadeRange: Math.max(Math.abs(fadeEnd - fadeStart), Number.EPSILON),
    fadeStart: Math.min(fadeStart, fadeEnd),
  };
}

function getVaulSnapPointOffset(
  snapPoint: DrawerSnapPoint | undefined,
  direction: DrawerDirection,
  container?: HTMLElement | null,
) {
  if (snapPoint === undefined) {
    return undefined;
  }

  const horizontal = direction === "left" || direction === "right";
  const axis = container
    ? `${getDrawerAxisSize(direction, container)}px`
    : horizontal
      ? "100dvw"
      : "100dvh";
  const visibleSize =
    typeof snapPoint === "number"
      ? snapPoint <= 1
        ? `(${axis} * ${snapPoint})`
        : `${snapPoint}px`
      : snapPoint;
  const offset = `calc(${axis} - ${visibleSize})`;

  return direction === "top" || direction === "left" ? `calc(-1 * ${offset})` : offset;
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
  eventDetails: DrawerPrimitive.Root.ChangeEventDetails,
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
  handler: DrawerPrimitive.Close.Props["onClick"],
): DrawerPrimitive.Close.Props["onClick"] {
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

function useScaleBackground({
  direction,
  enabled,
  open,
  setBackgroundColor,
}: {
  direction: DrawerDirection;
  enabled: boolean;
  open: boolean;
  setBackgroundColor: boolean;
}) {
  React.useEffect(() => {
    if (!enabled || !open) {
      return;
    }

    const wrapper =
      document.querySelector<HTMLElement>("[data-vaul-drawer-wrapper]") ??
      document.querySelector<HTMLElement>("[vaul-drawer-wrapper]");

    if (!wrapper) {
      return;
    }

    const previousWrapperStyles = {
      borderRadius: wrapper.style.borderRadius,
      overflow: wrapper.style.overflow,
      transform: wrapper.style.transform,
      transformOrigin: wrapper.style.transformOrigin,
      transitionDuration: wrapper.style.transitionDuration,
      transitionProperty: wrapper.style.transitionProperty,
      transitionTimingFunction: wrapper.style.transitionTimingFunction,
    };
    const previousBodyBackground = document.body.style.background;
    const scale = (window.innerWidth - 16) / Math.max(window.innerWidth, 1);
    const vertical = direction === "bottom" || direction === "top";

    Object.assign(wrapper.style, {
      borderRadius: "8px",
      overflow: "hidden",
      transform: vertical
        ? `scale(${scale}) translate3d(0, calc(env(safe-area-inset-top) + 14px), 0)`
        : `scale(${scale}) translate3d(calc(env(safe-area-inset-top) + 14px), 0, 0)`,
      transformOrigin: vertical ? "top" : "left",
      transitionDuration: "500ms",
      transitionProperty: "transform, border-radius",
      transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
    });

    if (setBackgroundColor) {
      document.body.style.background = "black";
    }

    return () => {
      Object.assign(wrapper.style, previousWrapperStyles);

      if (setBackgroundColor) {
        document.body.style.background = previousBodyBackground;
      }
    };
  }, [direction, enabled, open, setBackgroundColor]);
}

const DrawerContext = React.createContext<DrawerContextProps | null>(null);

function useDrawer() {
  const context = React.useContext(DrawerContext);

  if (!context) {
    throw new Error("useDrawer must be used within a Drawer.");
  }

  return context;
}

function Drawer({
  actionsRef: actionsRefProp,
  activeSnapPoint,
  autoFocus = false,
  children,
  closeThreshold = 0.25,
  container,
  defaultOpen = false,
  defaultSnapPoint,
  direction,
  disablePreventScroll = true,
  disablePointerDismissal,
  dismissible = true,
  fadeFromIndex,
  fixed,
  handleOnly = false,
  modal = true,
  nested,
  noBodyStyles = false,
  onAnimationEnd,
  onClose,
  onDrag,
  onOpenChange,
  onOpenChangeComplete,
  onRelease,
  onSnapPointChange,
  open,
  preventScrollRestoration = false,
  repositionInputs = true,
  scrollLockTimeout = 100,
  setActiveSnapPoint,
  setBackgroundColorOnScale = true,
  shouldScaleBackground = true,
  showSwipeHandle = true,
  snapPoint,
  snapPoints,
  snapToSequentialPoint,
  snapToSequentialPoints,
  swipeDirection: swipeDirectionProp,
  ...props
}: DrawerProps) {
  const swipeDirection = swipeDirectionProp ?? toSwipeDirection(direction) ?? "down";
  const hasSnapPoints = snapPoints != null && snapPoints.length > 0;
  const resolvedDirection = direction ?? fromSwipeDirection(swipeDirection);
  const resolvedCloseThreshold = Math.min(Math.max(closeThreshold, 0), 1);
  const controlledSnapPoint = activeSnapPoint !== undefined ? activeSnapPoint : snapPoint;
  const resolvedDefaultSnapPoint = defaultSnapPoint ?? snapPoints?.[0] ?? null;
  const [uncontrolledSnapPoint, setUncontrolledSnapPoint] = React.useState<DrawerSnapPoint | null>(
    resolvedDefaultSnapPoint,
  );
  const resolvedSnapPoint =
    controlledSnapPoint !== undefined ? controlledSnapPoint : uncontrolledSnapPoint;
  const resolvedFadeFromIndex =
    fadeFromIndex ?? (hasSnapPoints ? snapPoints.length - 1 : undefined);
  const activeSnapPointIndex = snapPoints?.findIndex((point) =>
    Object.is(point, resolvedSnapPoint),
  );
  const shouldFade =
    !hasSnapPoints ||
    (resolvedFadeFromIndex !== undefined && activeSnapPointIndex === resolvedFadeFromIndex);
  const { fadeRange, fadeStart } = getVaulFadeRange(
    snapPoints,
    resolvedFadeFromIndex,
    resolvedDirection,
    container,
  );
  const snapPointOffset = getVaulSnapPointOffset(snapPoints?.[0], resolvedDirection, container);
  const resolvedSnapToSequentialPoints = snapToSequentialPoint ?? snapToSequentialPoints;
  const fallbackActionsRef = React.useRef<DrawerPrimitive.Root.Actions | null>(null);
  const actionsRef = actionsRefProp ?? fallbackActionsRef;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const resolvedOpen = open ?? uncontrolledOpen;
  const openRef = React.useRef(resolvedOpen);
  const popupRef = React.useRef<HTMLDivElement>(null);
  const lastScrollTimeRef = React.useRef(0);
  const dismissableLayerHandlersRef = React.useRef<DismissableLayerHandlers>({});
  const dragMetricsRef = React.useRef<DrawerDragMetrics>({
    active: false,
    event: null,
    percentage: 0,
    pointerType: "",
    releaseScheduled: false,
    velocity: 0,
  });
  const releaseFrameRef = React.useRef<number | null>(null);
  openRef.current = resolvedOpen;

  if (hasSnapPoints && (swipeDirection === "left" || swipeDirection === "right")) {
    throw new Error("Drawer snapPoints are only supported for top and bottom drawers.");
  }

  const scheduleRelease = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!onRelease) {
        return;
      }

      if (releaseFrameRef.current !== null) {
        window.cancelAnimationFrame(releaseFrameRef.current);
      }
      releaseFrameRef.current = window.requestAnimationFrame(() => {
        releaseFrameRef.current = null;
        onRelease(event, openRef.current);
      });
    },
    [onRelease],
  );

  React.useEffect(
    () => () => {
      if (releaseFrameRef.current !== null) {
        window.cancelAnimationFrame(releaseFrameRef.current);
      }
    },
    [],
  );

  const handleOpenChange: NonNullable<DrawerPrimitive.Root.Props["onOpenChange"]> = (
    nextOpen,
    eventDetails,
  ) => {
    if (!nextOpen) {
      adaptDismissableLayerEvent(eventDetails, dismissableLayerHandlersRef.current);
    }

    if (!nextOpen && !dismissible) {
      eventDetails.cancel();
    }

    const dragMetrics = dragMetricsRef.current;
    if (
      !nextOpen &&
      eventDetails.reason === "swipe" &&
      dragMetrics.active &&
      dragMetrics.percentage < resolvedCloseThreshold &&
      dragMetrics.velocity <= 0.4
    ) {
      eventDetails.cancel();
    }

    if (!eventDetails.isCanceled) {
      onOpenChange?.(nextOpen, eventDetails);
    }

    if (
      !nextOpen &&
      eventDetails.reason === "swipe" &&
      dragMetrics.active &&
      dragMetrics.event &&
      !dragMetrics.releaseScheduled
    ) {
      dragMetrics.releaseScheduled = true;
      scheduleRelease(dragMetrics.event);
    }

    if (eventDetails.isCanceled) {
      return;
    }

    if (open === undefined) {
      openRef.current = nextOpen;
      setUncontrolledOpen(nextOpen);
    }

    if (!nextOpen) {
      onClose?.();
    }
  };

  const handleOpenChangeComplete = (nextOpen: boolean) => {
    onOpenChangeComplete?.(nextOpen);
    onAnimationEnd?.(nextOpen);
  };

  const handleSnapPointChange: NonNullable<DrawerPrimitive.Root.Props["onSnapPointChange"]> = (
    nextSnapPoint,
    eventDetails,
  ) => {
    onSnapPointChange?.(nextSnapPoint, eventDetails);

    if (!eventDetails.isCanceled) {
      if (controlledSnapPoint === undefined) {
        setUncontrolledSnapPoint(nextSnapPoint);
      }
      setActiveSnapPoint?.(nextSnapPoint);
    }
  };

  useScaleBackground({
    direction: resolvedDirection,
    enabled: shouldScaleBackground,
    open: resolvedOpen,
    setBackgroundColor: setBackgroundColorOnScale && !noBodyStyles,
  });

  const contextValue = React.useMemo(
    () => ({
      actionsRef,
      activeSnapPoint: resolvedSnapPoint,
      autoFocus,
      closeThreshold: resolvedCloseThreshold,
      container,
      direction: resolvedDirection,
      disablePreventScroll,
      dismissible,
      dismissableLayerHandlersRef,
      dragMetricsRef,
      fadeFromIndex: resolvedFadeFromIndex,
      fadeRange,
      fadeStart,
      fixed,
      handleOnly,
      hasSnapPoints,
      lastScrollTimeRef,
      modal,
      nested,
      noBodyStyles,
      onDrag,
      open: resolvedOpen,
      openRef,
      popupRef,
      preventScrollRestoration,
      repositionInputs,
      scheduleRelease,
      scrollLockTimeout,
      shouldFade,
      showSwipeHandle,
      snapPointOffset,
      swipeDirection,
    }),
    [
      actionsRef,
      autoFocus,
      container,
      disablePreventScroll,
      dismissible,
      fadeRange,
      fadeStart,
      fixed,
      handleOnly,
      hasSnapPoints,
      modal,
      nested,
      noBodyStyles,
      onDrag,
      preventScrollRestoration,
      repositionInputs,
      resolvedDirection,
      resolvedCloseThreshold,
      resolvedFadeFromIndex,
      resolvedOpen,
      resolvedSnapPoint,
      scheduleRelease,
      scrollLockTimeout,
      shouldFade,
      showSwipeHandle,
      snapPointOffset,
      swipeDirection,
    ],
  );

  return (
    <DrawerContext.Provider value={contextValue}>
      <DrawerPrimitive.Root
        data-slot="drawer"
        actionsRef={actionsRef}
        defaultSnapPoint={resolvedDefaultSnapPoint}
        defaultOpen={defaultOpen}
        disablePointerDismissal={disablePointerDismissal ?? !dismissible}
        modal={modal}
        onOpenChange={handleOpenChange}
        onOpenChangeComplete={handleOpenChangeComplete}
        onSnapPointChange={handleSnapPointChange}
        open={open}
        snapPoint={controlledSnapPoint}
        snapPoints={snapPoints}
        snapToSequentialPoints={resolvedSnapToSequentialPoints}
        swipeDirection={swipeDirection}
        {...props}
      >
        {repositionInputs && typeof children !== "function" ? (
          <DrawerPrimitive.VirtualKeyboardProvider>
            {children}
          </DrawerPrimitive.VirtualKeyboardProvider>
        ) : (
          children
        )}
      </DrawerPrimitive.Root>
    </DrawerContext.Provider>
  );
}

function DrawerTrigger({
  asChild = false,
  children,
  render,
  ...props
}: DrawerPrimitive.Trigger.Props & {
  asChild?: boolean;
  children?: React.ReactNode;
}) {
  const { open } = useDrawer();
  const renderElement = asChild
    ? (React.Children.toArray(children).find(React.isValidElement) as React.ReactElement)
    : render;

  return (
    <DrawerPrimitive.Trigger
      data-slot="drawer-trigger"
      data-state={open ? "open" : "closed"}
      render={adaptRenderEventHandlers(renderElement)}
      {...props}
    >
      {asChild ? undefined : children}
    </DrawerPrimitive.Trigger>
  );
}

function DrawerPortal({
  container: containerProp,
  forceMount,
  keepMounted,
  ...props
}: DrawerPortalProps) {
  const { container } = useDrawer();
  const keepPortalMounted = forceMount ?? (hasForceMountedChild(props.children) || keepMounted);

  return (
    <DrawerPrimitive.Portal
      data-slot="drawer-portal"
      container={containerProp ?? container ?? undefined}
      keepMounted={keepPortalMounted}
      {...props}
    />
  );
}

function DrawerClose({
  asChild = false,
  children,
  onClick,
  render,
  ...props
}: DrawerPrimitive.Close.Props & {
  asChild?: boolean;
  children?: React.ReactNode;
}) {
  const renderElement = asChild
    ? (React.Children.toArray(children).find(React.isValidElement) as React.ReactElement)
    : render;

  return (
    <DrawerPrimitive.Close
      data-slot="drawer-close"
      onClick={adaptCloseClick(onClick)}
      render={adaptRenderEventHandlers(renderElement)}
      {...props}
    >
      {asChild ? undefined : children}
    </DrawerPrimitive.Close>
  );
}

function DrawerOverlay({
  asChild = false,
  children,
  className,
  forceMount: _forceMount,
  render,
  style,
  ...props
}: DrawerOverlayProps) {
  const { fadeRange, fadeStart, hasSnapPoints, open, shouldFade } = useDrawer();
  const renderElement = asChild
    ? (React.Children.toArray(children).find(React.isValidElement) as React.ReactElement)
    : render;
  const vaulStyle: DrawerOverlayStyle = {
    "--vaul-fade-range": fadeRange,
    "--vaul-fade-start": fadeStart,
  };
  const overlayStyle: DrawerPrimitive.Backdrop.Props["style"] =
    typeof style === "function"
      ? (state) => ({ ...vaulStyle, ...style(state) })
      : { ...vaulStyle, ...style };

  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-overlay"
      data-state={open ? "open" : "closed"}
      data-vaul-overlay=""
      data-vaul-snap-points={open && hasSnapPoints ? "true" : "false"}
      data-vaul-snap-points-overlay={open && shouldFade ? "true" : "false"}
      render={adaptRenderEventHandlers(renderElement)}
      style={overlayStyle}
      className={cn(
        "fixed inset-0 z-50 min-h-dvh bg-overlay opacity-[clamp(0,calc((1-var(--drawer-swipe-progress)-var(--vaul-fade-start,0))/var(--vaul-fade-range,1)),1)] transition-opacity duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] select-none data-ending-style:pointer-events-none data-ending-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-starting-style:opacity-0 data-swiping:duration-0 supports-[-webkit-touch-callout:none]:absolute",
        className,
      )}
      {...props}
    >
      {asChild ? undefined : children}
    </DrawerPrimitive.Backdrop>
  );
}

function DrawerSwipeHandle({ children, className, ...props }: React.ComponentProps<"div">) {
  const { open } = useDrawer();

  return (
    <div
      data-slot="drawer-swipe-handle"
      data-vaul-drawer-visible={open ? "true" : "false"}
      data-vaul-handle=""
      aria-hidden="true"
      className={cn(
        "relative z-10 shrink-0 cursor-grab rounded-full bg-current transition-opacity duration-200 group-data-nested-drawer-open/drawer-popup:opacity-0 group-data-nested-drawer-swiping/drawer-popup:opacity-100 group-data-[swipe-axis=x]/drawer-popup:my-auto group-data-[swipe-axis=x]/drawer-popup:h-[100px] group-data-[swipe-axis=x]/drawer-popup:w-2 group-data-[swipe-axis=y]/drawer-popup:mx-auto group-data-[swipe-axis=y]/drawer-popup:h-2 group-data-[swipe-axis=y]/drawer-popup:w-[100px] group-data-[swipe-direction=down]/drawer-popup:mt-4 group-data-[swipe-direction=left]/drawer-popup:order-last group-data-[swipe-direction=left]/drawer-popup:mr-4 group-data-[swipe-direction=right]/drawer-popup:ml-4 group-data-[swipe-direction=up]/drawer-popup:order-last group-data-[swipe-direction=up]/drawer-popup:mb-4 active:cursor-grabbing",
        className,
      )}
      {...props}
    >
      <span data-vaul-handle-hitarea="" aria-hidden="true">
        {children}
      </span>
    </div>
  );
}

type PointerDragState = {
  active: boolean;
  lastCoordinate: number;
  lastTime: number;
  pointerId: number;
  pointerType: string;
  size: number;
  startCoordinate: number;
  startCrossCoordinate: number;
};

function getDismissCoordinate(
  event: React.PointerEvent<HTMLDivElement>,
  swipeDirection: NonNullable<DrawerPrimitive.Root.Props["swipeDirection"]>,
) {
  if (swipeDirection === "down") {
    return event.clientY;
  }

  if (swipeDirection === "up") {
    return -event.clientY;
  }

  if (swipeDirection === "right") {
    return event.clientX;
  }

  return -event.clientX;
}

function getCrossCoordinate(
  event: React.PointerEvent<HTMLDivElement>,
  swipeDirection: NonNullable<DrawerPrimitive.Root.Props["swipeDirection"]>,
) {
  return swipeDirection === "down" || swipeDirection === "up" ? event.clientX : event.clientY;
}

function isSwipeHandleTarget(target: EventTarget | null) {
  return target instanceof Element && target.closest('[data-slot="drawer-swipe-handle"]') !== null;
}

function shouldTrackPointerDrag(
  event: React.PointerEvent<HTMLDivElement>,
  handleOnly: boolean,
  lastScrollTime: number,
  scrollLockTimeout: number,
) {
  if (event.button !== 0) {
    return false;
  }

  if (handleOnly) {
    return isSwipeHandleTarget(event.target);
  }

  if (!(event.target instanceof Element)) {
    return false;
  }

  if (event.target.closest("[data-base-ui-swipe-ignore]")) {
    return false;
  }

  if (event.timeStamp - lastScrollTime < scrollLockTimeout) {
    return false;
  }

  if (
    event.pointerType !== "touch" &&
    event.target.closest(
      '[data-drawer-content],button,a,input,select,textarea,label,[role="button"]',
    )
  ) {
    return false;
  }

  return true;
}

function getDrawerSize(
  viewport: HTMLDivElement,
  swipeDirection: NonNullable<DrawerPrimitive.Root.Props["swipeDirection"]>,
) {
  const popup = viewport.querySelector<HTMLElement>('[data-slot="drawer-content"]');

  if (!popup) {
    return 1;
  }

  return swipeDirection === "down" || swipeDirection === "up"
    ? Math.max(popup.offsetHeight, 1)
    : Math.max(popup.offsetWidth, 1);
}

function DrawerContent({
  asChild = false,
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
  onPointerDown,
  onPointerDownOutside,
  onTouchStart,
  render,
  style,
  ...props
}: DrawerContentProps) {
  const {
    actionsRef,
    autoFocus,
    closeThreshold,
    container,
    direction,
    dismissible,
    dismissableLayerHandlersRef,
    dragMetricsRef,
    handleOnly,
    hasSnapPoints,
    lastScrollTimeRef,
    modal,
    onDrag,
    openRef,
    popupRef,
    scheduleRelease,
    scrollLockTimeout,
    showSwipeHandle,
    snapPointOffset,
    swipeDirection,
  } = useDrawer();
  const swipeAxis = swipeDirection === "down" || swipeDirection === "up" ? "y" : "x";
  const dragStateRef = React.useRef<PointerDragState | null>(null);
  const [delayedSnapPoints, setDelayedSnapPoints] = React.useState(false);
  const dismissableLayerHandlers = React.useMemo(
    () => ({ onEscapeKeyDown, onFocusOutside, onInteractOutside, onPointerDownOutside }),
    [onEscapeKeyDown, onFocusOutside, onInteractOutside, onPointerDownOutside],
  );
  dismissableLayerHandlersRef.current = dismissableLayerHandlers;

  React.useEffect(() => {
    if (!hasSnapPoints) {
      setDelayedSnapPoints(false);
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => setDelayedSnapPoints(true));
    return () => window.cancelAnimationFrame(frame);
  }, [hasSnapPoints]);

  React.useEffect(
    () => () => {
      if (dismissableLayerHandlersRef.current === dismissableLayerHandlers) {
        dismissableLayerHandlersRef.current = {};
      }
    },
    [dismissableLayerHandlers, dismissableLayerHandlersRef],
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!shouldTrackPointerDrag(event, handleOnly, lastScrollTimeRef.current, scrollLockTimeout)) {
      return;
    }

    const coordinate = getDismissCoordinate(event, swipeDirection);
    dragStateRef.current = {
      active: false,
      lastCoordinate: coordinate,
      lastTime: event.timeStamp,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      size: getDrawerSize(event.currentTarget, swipeDirection),
      startCoordinate: coordinate,
      startCrossCoordinate: getCrossCoordinate(event, swipeDirection),
    };
    dragMetricsRef.current = {
      active: false,
      event,
      percentage: 0,
      pointerType: event.pointerType,
      releaseScheduled: false,
      velocity: 0,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const coordinate = getDismissCoordinate(event, swipeDirection);
    const displacement = coordinate - dragState.startCoordinate;
    const crossDisplacement = Math.abs(
      getCrossCoordinate(event, swipeDirection) - dragState.startCrossCoordinate,
    );
    const activationThreshold = event.pointerType === "touch" ? 10 : 2;

    if (!dragState.active) {
      if (
        displacement < 0 ||
        (crossDisplacement > activationThreshold && crossDisplacement > displacement)
      ) {
        dragStateRef.current = null;
        return;
      }

      if (displacement < activationThreshold || displacement < crossDisplacement) {
        return;
      }

      dragState.active = true;
    }

    const elapsed = Math.max(event.timeStamp - dragState.lastTime, 1);
    const percentage = Math.max(0, displacement / dragState.size);
    const velocity = Math.max(0, (coordinate - dragState.lastCoordinate) / elapsed);
    dragState.lastCoordinate = coordinate;
    dragState.lastTime = event.timeStamp;
    dragMetricsRef.current = {
      active: true,
      event,
      percentage,
      pointerType: event.pointerType,
      releaseScheduled: dragMetricsRef.current.releaseScheduled,
      velocity,
    };
    onDrag?.(event, percentage);

    if (event.buttons === 0) {
      finishPointerDrag(event);
    }
  };

  function finishPointerDrag(event: React.PointerEvent<HTMLDivElement>, canceled = false) {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    if (canceled || !dragState.active) {
      dragMetricsRef.current.active = false;
      dragStateRef.current = null;
      return;
    }

    const coordinate = getDismissCoordinate(event, swipeDirection);
    const elapsed = Math.max(event.timeStamp - dragState.lastTime, 1);
    const percentage = Math.max(0, (coordinate - dragState.startCoordinate) / dragState.size);
    const velocity = Math.max(0, (coordinate - dragState.lastCoordinate) / elapsed);
    dragMetricsRef.current = {
      active: true,
      event,
      percentage,
      pointerType: event.pointerType,
      releaseScheduled: dragMetricsRef.current.releaseScheduled,
      velocity,
    };

    if (
      dismissible &&
      !hasSnapPoints &&
      !dragMetricsRef.current.releaseScheduled &&
      openRef.current &&
      (percentage >= closeThreshold || velocity > 0.4)
    ) {
      actionsRef.current?.close();
    }

    if (!dragMetricsRef.current.releaseScheduled) {
      dragMetricsRef.current.releaseScheduled = true;
      scheduleRelease(event);
    }
    dragMetricsRef.current.active = false;
    dragStateRef.current = null;
  }

  const handlePopupPointerDown: NonNullable<DrawerPrimitive.Popup.Props["onPointerDown"]> = (
    event,
  ) => {
    onPointerDown?.(event);
    if (handleOnly && !isSwipeHandleTarget(event.target)) {
      event.stopPropagation();
    }
  };

  const handlePopupTouchStart: NonNullable<DrawerPrimitive.Popup.Props["onTouchStart"]> = (
    event,
  ) => {
    onTouchStart?.(event);
    if (handleOnly && !isSwipeHandleTarget(event.target)) {
      event.stopPropagation();
    }
  };

  const contentStyle: DrawerPrimitive.Popup.Props["style"] =
    typeof style === "function"
      ? (state) => ({
          "--snap-point-height": snapPointOffset,
          ...style(state),
        })
      : ({ "--snap-point-height": snapPointOffset, ...style } as DrawerContentStyle);
  const contentChild = React.Children.toArray(children).find(
    React.isValidElement,
  ) as React.ReactElement<{ children?: React.ReactNode }>;
  const bodyChildren = asChild ? contentChild.props.children : children;
  const popupChildren = (
    <>
      {showSwipeHandle && <DrawerSwipeHandle />}
      <DrawerPrimitive.Content
        data-slot="drawer-body"
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden overscroll-contain rounded-[inherit] transition-opacity duration-300 ease-[cubic-bezier(0.45,1.005,0,1.005)] select-text group-data-nested-drawer-open/drawer-popup:opacity-0 group-data-nested-drawer-swiping/drawer-popup:opacity-100 group-data-swiping/drawer-popup:select-none",
        )}
      >
        {bodyChildren}
      </DrawerPrimitive.Content>
    </>
  );
  const renderElement = asChild
    ? React.cloneElement(contentChild, undefined, popupChildren)
    : render;

  return (
    <DrawerPortal data-slot="drawer-portal" forceMount={forceMount}>
      {modal === true && <DrawerOverlay data-snap-points={hasSnapPoints ? "" : undefined} />}
      <DrawerPrimitive.Viewport
        data-slot="drawer-viewport"
        data-modal={modal}
        onScrollCapture={(event) => {
          lastScrollTimeRef.current = event.timeStamp;
        }}
        onPointerCancel={(event) => finishPointerDrag(event, true)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointerDrag}
        className="pointer-events-none fixed inset-0 z-50 select-none data-[modal=true]:pointer-events-auto"
      >
        <DrawerPrimitive.Popup
          data-slot="drawer-content"
          data-state={openRef.current ? "open" : "closed"}
          data-swipe-axis={swipeAxis}
          data-snap-points={hasSnapPoints ? "" : undefined}
          data-vaul-custom-container={container ? "true" : "false"}
          data-vaul-delayed-snap-points={delayedSnapPoints ? "true" : "false"}
          data-vaul-drawer=""
          data-vaul-drawer-direction={direction}
          data-vaul-snap-points={openRef.current && hasSnapPoints ? "true" : "false"}
          initialFocus={adaptAutoFocus(
            onOpenAutoFocus,
            initialFocus ?? autoFocus,
            "focusScope.autoFocusOnMount",
          )}
          finalFocus={adaptAutoFocus(onCloseAutoFocus, finalFocus, "focusScope.autoFocusOnUnmount")}
          onPointerDown={handlePopupPointerDown}
          onTouchStart={handlePopupTouchStart}
          ref={popupRef}
          render={adaptRenderEventHandlers(renderElement)}
          style={contentStyle}
          className={cn(
            // Base.
            "group/drawer-popup pointer-events-auto fixed z-50 m-(--drawer-inset,0px) flex h-(--drawer-content-height) max-h-(--drawer-content-max-height,none) min-h-0 w-(--drawer-content-width,auto) transform-[translate3d(var(--translate-x,0px),var(--translate-y,0px),0)_scale(var(--stack-scale))] flex-col border-2 border-border bg-background text-foreground shadow-none transition-[transform,height,opacity,filter] duration-450 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform outline-none select-none [interpolate-size:allow-keywords] data-[swipe-direction=down]:mt-24 data-[swipe-direction=down]:rounded-t-base data-[swipe-direction=left]:rounded-r-base data-[swipe-direction=right]:rounded-l-base data-[swipe-direction=up]:mb-24 data-[swipe-direction=up]:rounded-b-base",
            // Nested.
            "data-nested-drawer-open:overflow-hidden data-nested-drawer-open:brightness-95",
            // Bleed.
            "after:pointer-events-none after:absolute after:bg-(--drawer-bleed-background,var(--color-background)) data-[swipe-axis=x]:after:inset-y-0 data-[swipe-axis=x]:after:w-(--bleed) data-[swipe-axis=y]:after:inset-x-0 data-[swipe-axis=y]:after:h-(--bleed) data-[swipe-direction=down]:after:top-full data-[swipe-direction=left]:after:right-full data-[swipe-direction=right]:after:left-full data-[swipe-direction=up]:after:bottom-full",
            // Sizing.
            "[--drawer-content-height:var(--drawer-height,auto)] data-[swipe-axis=x]:[--drawer-content-width:75%] data-[swipe-axis=y]:[--drawer-content-max-height:80vh] data-[swipe-axis=y]:data-snap-points:[--drawer-content-height:100dvh] data-[swipe-axis=y]:data-snap-points:[--drawer-content-max-height:100dvh] data-[swipe-axis=x]:sm:[--drawer-content-width:24rem]",
            // Stack.
            "[--bleed:3rem] [--peek:1rem] [--stack-height:var(--drawer-frontmost-height,var(--drawer-height,0px))] [--stack-peek-offset:max(0px,calc((var(--nested-drawers)-var(--stack-progress))*var(--peek)))] [--stack-progress:clamp(0,var(--drawer-swipe-progress),1)] [--stack-scale-base:max(0,calc(1-(var(--nested-drawers)*var(--stack-step))))] [--stack-scale:clamp(0,calc(var(--stack-scale-base)+(var(--stack-step)*var(--stack-progress))),1)] [--stack-shrink:calc(1-var(--stack-scale))] [--stack-step:0.05]",
            // Transitions.
            "data-ending-style:transform-(--closed-transform) data-ending-style:opacity-[0.9999] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-nested-drawer-swiping:duration-0 data-ending-style:data-nested-drawer-swiping:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-starting-style:transform-(--closed-transform) data-swiping:duration-0 data-ending-style:data-swiping:duration-[calc(var(--drawer-swipe-strength)*400ms)]",
            // Axis: y.
            "data-[swipe-axis=y]:inset-x-0 data-[swipe-axis=y]:data-nested-drawer-open:h-(--stack-height)",
            // Axis: x.
            "data-[swipe-axis=x]:inset-y-0 data-[swipe-axis=x]:flex-row",
            // Direction: down.
            "data-[swipe-direction=down]:bottom-0 data-[swipe-direction=down]:origin-bottom data-[swipe-direction=down]:[--closed-transform:translate3d(0,calc(100%+var(--drawer-inset,0px)+2px),0)] data-[swipe-direction=down]:[--translate-y:calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y)-var(--stack-peek-offset)-(var(--stack-shrink)*var(--stack-height)))]",
            // Direction: up.
            "data-[swipe-direction=up]:top-0 data-[swipe-direction=up]:origin-top data-[swipe-direction=up]:[--closed-transform:translate3d(0,calc(-100%-var(--drawer-inset,0px)-2px),0)] data-[swipe-direction=up]:[--translate-y:calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y)+var(--stack-peek-offset)+(var(--stack-shrink)*var(--stack-height)))]",
            // Direction: left.
            "data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:origin-left data-[swipe-direction=left]:[--closed-transform:translate3d(calc(-100%-var(--drawer-inset,0px)-2px),0,0)] data-[swipe-direction=left]:[--translate-x:calc(var(--drawer-swipe-movement-x)+var(--stack-peek-offset)+(var(--stack-shrink)*100%))]",
            // Direction: right.
            "data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:origin-right data-[swipe-direction=right]:[--closed-transform:translate3d(calc(100%+var(--drawer-inset,0px)+2px),0,0)] data-[swipe-direction=right]:[--translate-x:calc(var(--drawer-swipe-movement-x)-var(--stack-peek-offset)-(var(--stack-shrink)*100%))]",
            className,
          )}
          {...props}
        >
          {asChild ? undefined : popupChildren}
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

function DrawerTitle({
  asChild = false,
  children,
  className,
  render,
  ...props
}: DrawerPrimitive.Title.Props & { asChild?: boolean; children?: React.ReactNode }) {
  const renderElement = asChild
    ? (React.Children.toArray(children).find(React.isValidElement) as React.ReactElement)
    : render;

  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      render={adaptRenderEventHandlers(renderElement)}
      className={cn("font-heading text-lg leading-none tracking-tight", className)}
      {...props}
    >
      {asChild ? undefined : children}
    </DrawerPrimitive.Title>
  );
}

function DrawerDescription({
  asChild = false,
  children,
  className,
  render,
  ...props
}: DrawerPrimitive.Description.Props & { asChild?: boolean; children?: React.ReactNode }) {
  const renderElement = asChild
    ? (React.Children.toArray(children).find(React.isValidElement) as React.ReactElement)
    : render;

  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      render={adaptRenderEventHandlers(renderElement)}
      className={cn("text-sm text-balance font-base text-foreground", className)}
      {...props}
    >
      {asChild ? undefined : children}
    </DrawerPrimitive.Description>
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerSwipeHandle,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
