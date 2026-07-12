"use client";

import { DirectionProvider } from "@base-ui/react/direction-provider";
import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu";
import { cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";

type NavigationMenuLifecycleHandler<EventType extends Event = Event> = {
  bivarianceHack(event: EventType): void;
}["bivarianceHack"];

type NavigationMenuOutsideEvent = CustomEvent<{ originalEvent: Event }>;

type NavigationMenuDismissHandlers = {
  onEscapeKeyDown?: NavigationMenuLifecycleHandler<KeyboardEvent>;
  onFocusOutside?: NavigationMenuLifecycleHandler<NavigationMenuOutsideEvent>;
  onInteractOutside?: NavigationMenuLifecycleHandler<NavigationMenuOutsideEvent>;
  onPointerDownOutside?: NavigationMenuLifecycleHandler<NavigationMenuOutsideEvent>;
};

type NavigationMenuItemRecord = {
  element: HTMLLIElement;
  forceMount: boolean;
};

type NavigationMenuAdapterContextValue = {
  align: NavigationMenuPrimitive.Positioner.Props["align"];
  contentForceMount: boolean;
  contentHandlersRef: React.MutableRefObject<Map<HTMLElement, NavigationMenuDismissHandlers>>;
  orientation: "horizontal" | "vertical";
  portalContainer: HTMLLIElement | null;
  registerItem: (value: string, element: HTMLLIElement | null, forceMount: boolean) => void;
  rootElement: HTMLElement | null;
  value: string;
  viewport: boolean;
};

const NavigationMenuAdapterContext = React.createContext<NavigationMenuAdapterContextValue | null>(
  null,
);

type NavigationMenuProps = Omit<
  NavigationMenuPrimitive.Root.Props<string>,
  "defaultValue" | "onValueChange" | "value"
> &
  Pick<NavigationMenuPrimitive.Positioner.Props, "align"> & {
    defaultValue?: string;
    delayDuration?: number;
    dir?: "ltr" | "rtl";
    onValueChange?: (value: string) => void;
    skipDelayDuration?: number;
    value?: string;
    viewport?: boolean;
  };

type NavigationMenuContentProps = Omit<
  React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.Content>,
  "keepMounted"
> &
  NavigationMenuDismissHandlers & {
    forceMount?: boolean;
    keepMounted?: boolean;
  };

type NavigationMenuViewportProps = React.ComponentPropsWithRef<"div"> & {
  forceMount?: boolean;
};

type NavigationMenuPositionerProps = NavigationMenuPrimitive.Positioner.Props & {
  forceMount?: boolean;
  portalContainer?: NavigationMenuPrimitive.Portal.Props["container"];
  viewport?: boolean;
  viewportProps?: NavigationMenuViewportProps;
};

type NavigationMenuCssProperties = React.CSSProperties & {
  "--radix-navigation-menu-indicator-translate-x"?: string;
  "--radix-navigation-menu-indicator-translate-y"?: string;
  "--radix-navigation-menu-viewport-height"?: string;
  "--radix-navigation-menu-viewport-width"?: string;
};

function setReactRef<T>(ref: React.Ref<T> | null | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

function hasForceMountedContent(children: React.ReactNode): boolean {
  let found = false;

  React.Children.forEach(children, (child) => {
    if (
      found ||
      !React.isValidElement<{
        children?: React.ReactNode;
        forceMount?: boolean;
        keepMounted?: boolean;
      }>(child)
    ) {
      return;
    }
    if (
      child.type === NavigationMenuContent &&
      (child.props.forceMount || child.props.keepMounted)
    ) {
      found = true;
      return;
    }
    if (child.props.children) found = hasForceMountedContent(child.props.children);
  });

  return found;
}

function hasExplicitViewport(children: React.ReactNode): boolean {
  let found = false;

  React.Children.forEach(children, (child) => {
    if (found || !React.isValidElement<{ children?: React.ReactNode }>(child)) return;
    if (child.type === NavigationMenuViewport || child.type === NavigationMenuPositioner) {
      found = true;
      return;
    }
    if (child.type === React.Fragment && child.props.children) {
      found = hasExplicitViewport(child.props.children);
    }
  });

  return found;
}

function getActiveContentHandlers(handlers: Map<HTMLElement, NavigationMenuDismissHandlers>) {
  for (const [element, value] of Array.from(handlers.entries())) {
    if (element.isConnected && element.hasAttribute("data-open")) return value;
  }
  return undefined;
}

function isNavigationMenuDismissPrevented(
  handlers: NavigationMenuDismissHandlers | undefined,
  reason: NavigationMenuPrimitive.Root.ChangeEventDetails["reason"],
  originalEvent: Event,
) {
  if (!handlers) return false;

  if (reason === "escape-key") {
    if (!(originalEvent instanceof KeyboardEvent)) return false;
    handlers.onEscapeKeyDown?.(originalEvent);
    return originalEvent.defaultPrevented;
  }

  if (reason === "outside-press") {
    const outsideEvent = new CustomEvent<{ originalEvent: Event }>("pointerDownOutside", {
      cancelable: true,
      detail: { originalEvent },
    });
    handlers.onPointerDownOutside?.(outsideEvent);
    handlers.onInteractOutside?.(outsideEvent);
    return outsideEvent.defaultPrevented;
  }

  if (reason === "focus-out") {
    const outsideEvent = new CustomEvent<{ originalEvent: Event }>("focusOutside", {
      cancelable: true,
      detail: { originalEvent },
    });
    handlers.onFocusOutside?.(outsideEvent);
    handlers.onInteractOutside?.(outsideEvent);
    return outsideEvent.defaultPrevented;
  }

  return false;
}

function NavigationMenu({
  align = "start",
  className,
  children,
  closeDelay = 150,
  defaultValue = "",
  delay,
  delayDuration = 200,
  dir,
  onValueChange,
  orientation = "horizontal",
  ref,
  skipDelayDuration = 300,
  value: valueProp,
  viewport = true,
  ...props
}: NavigationMenuProps) {
  const controlled = valueProp !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const value = valueProp ?? uncontrolledValue;
  const [isOpenDelayed, setIsOpenDelayed] = React.useState(true);
  const skipDelayTimerRef = React.useRef(0);
  const contentHandlersRef = React.useRef(new Map<HTMLElement, NavigationMenuDismissHandlers>());
  const itemRecordsRef = React.useRef(new Map<string, NavigationMenuItemRecord>());
  const lastValueRef = React.useRef(value);
  const [itemRevision, bumpItemRevision] = React.useReducer((revision) => revision + 1, 0);
  const [rootElement, setRootElement] = React.useState<HTMLElement | null>(null);
  const contentForceMount = hasForceMountedContent(children);
  const explicitViewport = hasExplicitViewport(children);

  if (value) lastValueRef.current = value;

  const registerItem = React.useCallback(
    (itemValue: string, element: HTMLLIElement | null, forceMount: boolean) => {
      const current = itemRecordsRef.current.get(itemValue);
      if (!element) {
        if (current) {
          itemRecordsRef.current.delete(itemValue);
          bumpItemRevision();
        }
        return;
      }
      if (current?.element === element && current.forceMount === forceMount) return;
      itemRecordsRef.current.set(itemValue, { element, forceMount });
      bumpItemRevision();
    },
    [],
  );

  const portalContainer = (() => {
    void itemRevision;
    const ownerValue = value || lastValueRef.current;
    const owner = ownerValue ? itemRecordsRef.current.get(ownerValue) : undefined;
    if (owner) return owner.element;
    if (contentForceMount) {
      for (const record of Array.from(itemRecordsRef.current.values())) {
        if (record.forceMount) return record.element;
      }
    }
    return null;
  })();

  React.useEffect(
    () => () => {
      if (skipDelayTimerRef.current) window.clearTimeout(skipDelayTimerRef.current);
    },
    [],
  );

  const handleValueChange = React.useCallback(
    (nextValue: string | null, eventDetails: NavigationMenuPrimitive.Root.ChangeEventDetails) => {
      const adaptedValue = nextValue ?? "";
      if (
        !nextValue &&
        isNavigationMenuDismissPrevented(
          getActiveContentHandlers(contentHandlersRef.current),
          eventDetails.reason,
          eventDetails.event,
        )
      ) {
        eventDetails.cancel();
        return;
      }

      if (skipDelayTimerRef.current) window.clearTimeout(skipDelayTimerRef.current);
      if (adaptedValue) {
        if (skipDelayDuration > 0) setIsOpenDelayed(false);
      } else {
        skipDelayTimerRef.current = window.setTimeout(
          () => setIsOpenDelayed(true),
          skipDelayDuration,
        );
      }

      if (!controlled) setUncontrolledValue(adaptedValue);
      onValueChange?.(adaptedValue);
    },
    [controlled, onValueChange, skipDelayDuration],
  );

  const context = React.useMemo<NavigationMenuAdapterContextValue>(
    () => ({
      align,
      contentForceMount,
      contentHandlersRef,
      orientation,
      portalContainer,
      registerItem,
      rootElement,
      value,
      viewport,
    }),
    [
      align,
      contentForceMount,
      orientation,
      portalContainer,
      registerItem,
      rootElement,
      value,
      viewport,
    ],
  );

  const setNavigationRootRef = React.useCallback(
    (node: HTMLElement | null) => {
      setRootElement(node);
      setReactRef(ref, node);
    },
    [ref],
  );

  const menu = (
    <NavigationMenuPrimitive.Root
      ref={setNavigationRootRef}
      data-slot="navigation-menu"
      data-orientation={orientation}
      data-state={value ? "open" : "closed"}
      data-viewport={viewport}
      defaultValue={valueProp === undefined ? defaultValue || null : undefined}
      delay={delay ?? (isOpenDelayed ? delayDuration : 0)}
      closeDelay={closeDelay}
      dir={dir}
      onValueChange={handleValueChange}
      orientation={orientation}
      value={valueProp === undefined ? undefined : valueProp || null}
      className={cn(
        "group/navigation-menu relative z-10 flex max-w-max flex-1 items-center justify-center rounded-base border-2 border-border bg-main p-1 font-heading",
        className,
      )}
      {...props}
    >
      {children}
      {viewport ? (
        !explicitViewport && <NavigationMenuViewport />
      ) : (
        <NavigationMenuPositioner
          align={align}
          forceMount={contentForceMount}
          portalContainer={portalContainer}
          viewport={false}
        />
      )}
    </NavigationMenuPrimitive.Root>
  );

  return (
    <NavigationMenuAdapterContext.Provider value={context}>
      {dir ? <DirectionProvider direction={dir}>{menu}</DirectionProvider> : menu}
    </NavigationMenuAdapterContext.Provider>
  );
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.List>) {
  const adapter = React.useContext(NavigationMenuAdapterContext);

  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      data-orientation={adapter?.orientation ?? "horizontal"}
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-1 font-heading",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuItem({
  children,
  className,
  ref,
  value: valueProp,
  ...props
}: Omit<React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.Item>, "value"> & {
  value?: string;
}) {
  const adapter = React.useContext(NavigationMenuAdapterContext);
  const generatedValue = React.useId();
  const value = valueProp ?? generatedValue;
  const forceMount = hasForceMountedContent(children);
  const setItemRef = React.useCallback(
    (node: HTMLLIElement | null) => {
      adapter?.registerItem(value, node, forceMount);
      setReactRef(ref, node);
    },
    [adapter, forceMount, ref, value],
  );

  return (
    <NavigationMenuPrimitive.Item
      ref={setItemRef}
      data-slot="navigation-menu-item"
      data-value={value}
      value={value}
      className={cn("relative", className)}
      {...props}
    >
      {children}
    </NavigationMenuPrimitive.Item>
  );
}

const navigationMenuTriggerStyle = cva(
  "group/navigation-menu-trigger inline-flex h-10 w-max items-center justify-center rounded-base bg-main px-4 py-2 text-sm font-heading text-main-foreground transition-colors outline-none focus:outline-none disabled:pointer-events-none disabled:opacity-50",
);

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: NavigationMenuPrimitive.Trigger.Props) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...props}
    >
      {children}{" "}
      <ChevronDownIcon
        className="relative top-px ml-2 size-4 transition duration-200 group-data-popup-open/navigation-menu-trigger:rotate-180 group-data-open/navigation-menu-trigger:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({
  className,
  forceMount,
  keepMounted,
  onEscapeKeyDown,
  onFocusOutside,
  onInteractOutside,
  onPointerDownOutside,
  ref,
  ...props
}: NavigationMenuContentProps) {
  const adapter = React.useContext(NavigationMenuAdapterContext);
  const handlersRef = React.useRef<NavigationMenuDismissHandlers>({});
  const contentElementRef = React.useRef<HTMLDivElement | null>(null);
  handlersRef.current = {
    onEscapeKeyDown,
    onFocusOutside,
    onInteractOutside,
    onPointerDownOutside,
  };
  if (contentElementRef.current && adapter) {
    adapter.contentHandlersRef.current.set(contentElementRef.current, handlersRef.current);
  }

  const setContentRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      const handlers = adapter?.contentHandlersRef.current;
      if (contentElementRef.current) handlers?.delete(contentElementRef.current);
      contentElementRef.current = node;
      if (node) handlers?.set(node, handlersRef.current);
      setReactRef(ref, node);
    },
    [adapter, ref],
  );

  return (
    <NavigationMenuPrimitive.Content
      ref={setContentRef}
      data-slot="navigation-menu-content"
      data-orientation={adapter?.orientation ?? "horizontal"}
      keepMounted={forceMount ?? keepMounted}
      className={cn(
        "h-full w-auto p-2 pr-2.5 transition-[opacity,transform,translate] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] data-[activation-direction=down]:data-ending-style:-translate-y-1/2 data-[activation-direction=down]:data-starting-style:translate-y-1/2 data-[activation-direction=left]:data-ending-style:translate-x-1/2 data-[activation-direction=left]:data-starting-style:-translate-x-1/2 data-[activation-direction=right]:data-ending-style:-translate-x-1/2 data-[activation-direction=right]:data-starting-style:translate-x-1/2 data-[activation-direction=up]:data-ending-style:translate-y-1/2 data-[activation-direction=up]:data-starting-style:-translate-y-1/2 data-ending-style:opacity-0 data-starting-style:opacity-0 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",
        !adapter?.viewport &&
          "rounded-base border-2 border-border bg-main text-main-foreground duration-300 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuPositioner({
  align = "start",
  alignOffset = 0,
  className,
  forceMount,
  portalContainer,
  side = "bottom",
  sideOffset = 8,
  viewport: viewportProp,
  viewportProps,
  ...props
}: NavigationMenuPositionerProps) {
  const adapter = React.useContext(NavigationMenuAdapterContext);
  const viewport = viewportProp ?? adapter?.viewport ?? true;
  const keepMounted = Boolean(forceMount || adapter?.contentForceMount);
  const container = viewport ? undefined : (portalContainer ?? adapter?.portalContainer);
  const {
    className: viewportClassName,
    forceMount: viewportForceMount,
    ref: viewportRef,
    style: viewportStyle,
    ...viewportElementProps
  } = viewportProps ?? {};

  if (!viewport && !container) return null;

  const radixStyle: NavigationMenuCssProperties = {
    "--radix-navigation-menu-viewport-height": "var(--popup-height)",
    "--radix-navigation-menu-viewport-width": "var(--popup-width)",
    ...viewportStyle,
  };
  const viewportElement = (
    <NavigationMenuPrimitive.Viewport
      {...viewportElementProps}
      ref={viewportRef}
      data-slot={viewport ? "navigation-menu-viewport" : "navigation-menu-content-container"}
      data-state={adapter?.value ? "open" : "closed"}
      data-orientation={adapter?.orientation ?? "horizontal"}
      className={cn(
        "relative h-(--radix-navigation-menu-viewport-height) w-(--radix-navigation-menu-viewport-width)",
        viewport
          ? "overflow-hidden rounded-base border-2 border-border bg-main"
          : "overflow-visible",
        viewportClassName,
      )}
      style={radixStyle}
    />
  );

  return (
    <NavigationMenuPrimitive.Portal
      container={container}
      keepMounted={keepMounted || Boolean(viewportForceMount)}
    >
      <NavigationMenuPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className={cn(
          "isolate z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] data-instant:transition-none data-[side=bottom]:before:top-[-10px] data-[side=bottom]:before:right-0 data-[side=bottom]:before:left-0",
          className,
        )}
        {...props}
      >
        <NavigationMenuPrimitive.Popup
          render={viewportElement}
          data-viewport={viewport}
          className={cn(
            "data-[ending-style]:easing-[ease] xs:w-(--popup-width) relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin) text-main-foreground transition-[opacity,transform,width,height,scale,translate] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] outline-none data-ending-style:scale-90 data-ending-style:opacity-0 data-ending-style:duration-150 data-starting-style:scale-90 data-starting-style:opacity-0",
            !viewport && "overflow-visible bg-transparent",
          )}
        />
      </NavigationMenuPrimitive.Positioner>
    </NavigationMenuPrimitive.Portal>
  );
}

function NavigationMenuViewport({ forceMount, ...props }: NavigationMenuViewportProps) {
  const adapter = React.useContext(NavigationMenuAdapterContext);
  if (adapter && !adapter.viewport) return null;

  return (
    <NavigationMenuPositioner
      align={adapter?.align ?? "start"}
      forceMount={Boolean(forceMount || adapter?.contentForceMount)}
      viewportProps={{ forceMount, ...props }}
    />
  );
}

function NavigationMenuLink({
  active,
  className,
  asChild = false,
  children,
  closeOnClick = true,
  onClick,
  onSelect,
  render,
  ...props
}: NavigationMenuPrimitive.Link.Props & {
  asChild?: boolean;
  children?: React.ReactNode;
  onSelect?: NavigationMenuLifecycleHandler;
}) {
  const renderElement = asChild
    ? (React.Children.toArray(children).find(React.isValidElement) as React.ReactElement)
    : render;

  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      data-active={active ? "" : undefined}
      active={active}
      closeOnClick={closeOnClick}
      render={renderElement}
      className={cn(
        "flex items-center gap-2 rounded-base p-2 text-sm leading-none no-underline transition-colors outline-none focus-visible:ring-4 focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        const selectEvent = new CustomEvent("navigationMenu.linkSelect", {
          bubbles: true,
          cancelable: true,
        });
        const handleSelect = (customEvent: Event) => onSelect?.(customEvent);
        event.currentTarget.addEventListener(selectEvent.type, handleSelect, { once: true });
        event.currentTarget.dispatchEvent(selectEvent);

        if (!closeOnClick || selectEvent.defaultPrevented || event.metaKey) {
          event.preventBaseUIHandler();
        }
      }}
      {...props}
    >
      {asChild ? undefined : children}
    </NavigationMenuPrimitive.Link>
  );
}

type NavigationMenuIndicatorProps = React.ComponentPropsWithoutRef<"div"> & {
  forceMount?: boolean;
};

type NavigationMenuIndicatorPosition = {
  offset: number;
  size: number;
};

const NavigationMenuIndicator = React.forwardRef<HTMLDivElement, NavigationMenuIndicatorProps>(
  function NavigationMenuIndicator({ className, forceMount, style, ...props }, ref) {
    const adapter = React.useContext(NavigationMenuAdapterContext);
    const [position, setPosition] = React.useState<NavigationMenuIndicatorPosition | null>(null);
    const visible = Boolean(adapter?.value);

    React.useLayoutEffect(() => {
      const root = adapter?.rootElement;
      if (!root) return undefined;
      const rootElement = root;

      let observedTrigger: HTMLElement | null = null;
      const resizeObserver =
        typeof ResizeObserver === "function" ? new ResizeObserver(updatePosition) : null;

      function getActiveTrigger() {
        const triggers = rootElement.querySelectorAll<HTMLElement>(
          "[data-slot='navigation-menu-trigger'][data-popup-open], [data-slot='navigation-menu-trigger'][aria-expanded='true']",
        );
        return Array.from(triggers ?? []).find(
          (trigger) =>
            trigger.closest<HTMLElement>("[data-slot='navigation-menu']") === rootElement,
        );
      }

      function updatePosition() {
        const trigger = getActiveTrigger();
        if (!trigger || !adapter?.value) return;

        if (trigger !== observedTrigger) {
          resizeObserver?.disconnect();
          resizeObserver?.observe(rootElement);
          resizeObserver?.observe(trigger);
          observedTrigger = trigger;
        }

        const rootRect = rootElement.getBoundingClientRect();
        const triggerRect = trigger.getBoundingClientRect();
        const horizontal = adapter.orientation === "horizontal";
        const nextPosition = {
          offset: horizontal
            ? triggerRect.left - rootRect.left + rootElement.scrollLeft
            : triggerRect.top - rootRect.top + rootElement.scrollTop,
          size: horizontal ? triggerRect.width : triggerRect.height,
        };
        setPosition((current) =>
          current?.offset === nextPosition.offset && current.size === nextPosition.size
            ? current
            : nextPosition,
        );
      }

      const mutationObserver = new MutationObserver(updatePosition);
      updatePosition();
      mutationObserver.observe(rootElement, {
        attributeFilter: ["aria-expanded", "data-popup-open"],
        attributes: true,
        subtree: true,
      });
      window.addEventListener("resize", updatePosition);

      return () => {
        resizeObserver?.disconnect();
        mutationObserver.disconnect();
        window.removeEventListener("resize", updatePosition);
      };
    }, [adapter]);

    if ((!forceMount && !visible) || !position || !adapter?.rootElement) return null;

    const horizontal = adapter.orientation === "horizontal";
    const indicatorStyle: NavigationMenuCssProperties = horizontal
      ? {
          left: 0,
          transform: `translateX(${position.offset}px)`,
          width: position.size,
          "--radix-navigation-menu-indicator-translate-x": `${position.offset}px`,
          ...style,
        }
      : {
          height: position.size,
          top: 0,
          transform: `translateY(${position.offset}px)`,
          "--radix-navigation-menu-indicator-translate-y": `${position.offset}px`,
          ...style,
        };

    return (
      <NavigationMenuPrimitive.Portal container={adapter.rootElement} keepMounted>
        <div
          ref={ref}
          aria-hidden="true"
          data-slot="navigation-menu-indicator"
          data-orientation={adapter.orientation}
          data-state={visible ? "visible" : "hidden"}
          className={cn(
            "absolute top-full z-1 flex h-1.5 items-end justify-center overflow-hidden transition-[transform,width,height,opacity] data-[state=hidden]:pointer-events-none data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:animate-in data-[state=visible]:fade-in",
            !horizontal && "top-0 right-0 h-auto w-1.5 items-center",
            className,
          )}
          style={indicatorStyle}
          {...props}
        >
          <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
        </div>
      </NavigationMenuPrimitive.Portal>
    );
  },
);

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
  NavigationMenuPositioner,
};
