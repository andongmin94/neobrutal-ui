"use client";

import { DirectionProvider } from "@base-ui/react/direction-provider";
import { mergeProps } from "@base-ui/react/merge-props";
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
    asChild?: boolean;
    children?: React.ReactNode;
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
    asChild?: boolean;
    children?: React.ReactNode;
    forceMount?: boolean;
    keepMounted?: boolean;
  };

type NavigationMenuViewportProps = React.ComponentPropsWithRef<"div"> & {
  asChild?: boolean;
  children?: React.ReactNode;
  forceMount?: boolean;
  render?: NavigationMenuPrimitive.Viewport.Props["render"];
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

function preserveRadixEventCancellation(child: React.ReactElement) {
  const childProps = child.props as Record<string, unknown>;
  const eventProps: Record<string, unknown> = {};

  for (const [name, handler] of Object.entries(childProps)) {
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

function getRenderElement<Render>(
  asChild: boolean,
  children: React.ReactNode,
  render: Render,
): React.ReactElement | Render {
  return asChild
    ? preserveRadixEventCancellation(
        React.Children.toArray(children).find(React.isValidElement) as React.ReactElement,
      )
    : render;
}

function mergeRenderElement(
  render: React.ReactElement,
  elementProps: React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> },
) {
  const renderProps = render.props as React.HTMLAttributes<HTMLElement> & {
    ref?: React.Ref<HTMLElement>;
  };
  const mergedProps = mergeProps<"div">(
    elementProps as React.ComponentPropsWithRef<"div">,
    renderProps as React.ComponentPropsWithRef<"div">,
  );
  const elementRef = elementProps.ref;
  const renderRef = renderProps.ref;

  mergedProps.ref = (node: HTMLDivElement | null) => {
    setReactRef(elementRef, node);
    setReactRef(renderRef, node);
  };

  return React.cloneElement(render, mergedProps);
}

function getRadixNavigationMenuMotion(state: NavigationMenuPrimitive.Content.State) {
  const direction = state.activationDirection;
  if (
    !direction ||
    (state.transitionStatus !== "starting" && state.transitionStatus !== "ending")
  ) {
    return undefined;
  }

  const movingTowardEnd = direction === "right" || direction === "down";
  if (state.transitionStatus === "starting") {
    return movingTowardEnd ? "from-end" : "from-start";
  }

  return movingTowardEnd ? "to-start" : "to-end";
}

function adaptNavigationMenuTriggerRender(
  render: NavigationMenuPrimitive.Trigger.Props["render"],
): NavigationMenuPrimitive.Trigger.Props["render"] {
  return (elementProps, state) => {
    const compatProps = mergeProps<"button">(elementProps, {
      "data-state": state.open ? "open" : "closed",
    } as React.ComponentPropsWithRef<"button">);

    if (typeof render === "function") {
      return render(compatProps, state);
    }

    if (render) {
      return mergeRenderElement(
        render,
        compatProps as React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> },
      );
    }

    return <button {...compatProps} />;
  };
}

function adaptNavigationMenuContentRender(
  render: NavigationMenuPrimitive.Content.Props["render"],
): NavigationMenuPrimitive.Content.Props["render"] {
  return (elementProps, state) => {
    const compatProps = mergeProps<"div">(elementProps, {
      "data-motion": getRadixNavigationMenuMotion(state),
      "data-state": state.open ? "open" : "closed",
    } as React.ComponentPropsWithRef<"div">);

    if (typeof render === "function") {
      return render(compatProps, state);
    }

    if (render) {
      return mergeRenderElement(render, compatProps);
    }

    return <div {...compatProps} />;
  };
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
  asChild = false,
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
  render,
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

  const rootChild = React.Children.toArray(children).find(
    React.isValidElement,
  ) as React.ReactElement<{ children?: React.ReactNode }>;
  const rootChildren = (
    <>
      {asChild ? rootChild.props.children : children}
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
    </>
  );
  const renderElement = asChild ? React.cloneElement(rootChild, undefined, rootChildren) : render;

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
      render={renderElement}
      value={valueProp === undefined ? undefined : valueProp || null}
      className={cn(
        "group/navigation-menu relative z-10 flex max-w-max flex-1 items-center justify-center rounded-base border-2 border-border bg-main p-1 font-heading",
        className,
      )}
      {...props}
    >
      {asChild ? undefined : rootChildren}
    </NavigationMenuPrimitive.Root>
  );

  return (
    <NavigationMenuAdapterContext.Provider value={context}>
      {dir ? <DirectionProvider direction={dir}>{menu}</DirectionProvider> : menu}
    </NavigationMenuAdapterContext.Provider>
  );
}

function NavigationMenuList({
  asChild = false,
  children,
  className,
  render,
  ...props
}: React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.List> & {
  asChild?: boolean;
  children?: React.ReactNode;
}) {
  const adapter = React.useContext(NavigationMenuAdapterContext);
  const renderElement = getRenderElement(asChild, children, render);

  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      data-orientation={adapter?.orientation ?? "horizontal"}
      render={renderElement}
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-1 font-heading",
        className,
      )}
      {...props}
    >
      {asChild ? undefined : children}
    </NavigationMenuPrimitive.List>
  );
}

function NavigationMenuItem({
  asChild = false,
  children,
  className,
  ref,
  render,
  value: valueProp,
  ...props
}: Omit<React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.Item>, "value"> & {
  asChild?: boolean;
  children?: React.ReactNode;
  value?: string;
}) {
  const adapter = React.useContext(NavigationMenuAdapterContext);
  const generatedValue = React.useId();
  const value = valueProp ?? generatedValue;
  const forceMount = hasForceMountedContent(children);
  const renderElement = getRenderElement(asChild, children, render);
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
      render={renderElement}
      className={cn("relative", className)}
      {...props}
    >
      {asChild ? undefined : children}
    </NavigationMenuPrimitive.Item>
  );
}

const navigationMenuTriggerStyle = cva(
  "group/navigation-menu-trigger inline-flex h-10 w-max items-center justify-center rounded-base bg-main px-4 py-2 text-sm font-heading text-main-foreground transition-colors outline-none focus:outline-none disabled:pointer-events-none disabled:opacity-50",
);

function NavigationMenuTrigger({
  asChild = false,
  className,
  children,
  render,
  ...props
}: NavigationMenuPrimitive.Trigger.Props & {
  asChild?: boolean;
  children?: React.ReactNode;
}) {
  const triggerChild = asChild
    ? (preserveRadixEventCancellation(
        React.Children.toArray(children).find(React.isValidElement) as React.ReactElement<{
          children?: React.ReactNode;
        }>,
      ) as React.ReactElement<{ children?: React.ReactNode }>)
    : undefined;
  const chevron = (
    <ChevronDownIcon
      className="relative top-px ml-2 size-4 transition duration-200 group-data-popup-open/navigation-menu-trigger:rotate-180 group-data-open/navigation-menu-trigger:rotate-180 group-data-[state=open]/navigation-menu-trigger:rotate-180"
      aria-hidden="true"
    />
  );
  const renderElement = asChild
    ? React.cloneElement(triggerChild!, undefined, triggerChild!.props.children, " ", chevron)
    : render;

  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      render={adaptNavigationMenuTriggerRender(renderElement)}
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...props}
    >
      {asChild ? undefined : children}
      {asChild ? undefined : " "}
      {asChild ? undefined : chevron}
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({
  asChild = false,
  children,
  className,
  forceMount,
  keepMounted,
  onEscapeKeyDown,
  onFocusOutside,
  onInteractOutside,
  onPointerDownOutside,
  ref,
  render,
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
  const renderElement = getRenderElement(asChild, children, render);

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
      render={adaptNavigationMenuContentRender(renderElement)}
      className={cn(
        "h-full w-auto p-2 pr-2.5 transition-[opacity,transform,translate] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 data-[activation-direction=down]:data-ending-style:-translate-y-1/2 data-[activation-direction=down]:data-starting-style:translate-y-1/2 data-[activation-direction=left]:data-ending-style:translate-x-1/2 data-[activation-direction=left]:data-starting-style:-translate-x-1/2 data-[activation-direction=right]:data-ending-style:-translate-x-1/2 data-[activation-direction=right]:data-starting-style:translate-x-1/2 data-[activation-direction=up]:data-ending-style:translate-y-1/2 data-[activation-direction=up]:data-starting-style:-translate-y-1/2 data-ending-style:opacity-0 data-starting-style:opacity-0 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",
        !adapter?.viewport &&
          "rounded-base border-2 border-border bg-main text-main-foreground duration-300 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
        className,
      )}
      {...props}
    >
      {asChild ? undefined : children}
    </NavigationMenuPrimitive.Content>
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
    asChild: viewportAsChild = false,
    children: viewportChildren,
    className: viewportClassName,
    forceMount: viewportForceMount,
    ref: viewportRef,
    render: viewportRender,
    style: viewportStyle,
    ...viewportElementProps
  } = viewportProps ?? {};
  const viewportRenderElement = getRenderElement(viewportAsChild, viewportChildren, viewportRender);

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
      render={viewportRenderElement}
      className={cn(
        "relative h-(--radix-navigation-menu-viewport-height) w-(--radix-navigation-menu-viewport-width)",
        viewport
          ? "overflow-hidden rounded-base bg-main shadow-[inset_0_0_0_2px_var(--border)]"
          : "overflow-visible",
        viewportClassName,
      )}
      style={radixStyle}
    >
      {viewportAsChild ? undefined : viewportChildren}
    </NavigationMenuPrimitive.Viewport>
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

function NavigationMenuViewport({
  asChild = false,
  children,
  forceMount,
  render,
  ...props
}: NavigationMenuViewportProps) {
  const adapter = React.useContext(NavigationMenuAdapterContext);
  if (adapter && !adapter.viewport) return null;

  return (
    <NavigationMenuPositioner
      align={adapter?.align ?? "start"}
      forceMount={Boolean(forceMount || adapter?.contentForceMount)}
      viewportProps={{ asChild, children, forceMount, render, ...props }}
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
    ? preserveRadixEventCancellation(
        React.Children.toArray(children).find(React.isValidElement) as React.ReactElement,
      )
    : render;

  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      data-active={active ? "" : undefined}
      active={active}
      closeOnClick={closeOnClick}
      render={renderElement}
      className={cn(
        "block space-y-1 rounded-base p-2 leading-none no-underline transition-colors outline-none select-none focus-visible:ring-4 focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4",
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
  asChild?: boolean;
  forceMount?: boolean;
  render?: NavigationMenuPrimitive.Viewport.Props["render"];
};

type NavigationMenuIndicatorPosition = {
  offset: number;
  size: number;
};

const NavigationMenuIndicator = React.forwardRef<HTMLDivElement, NavigationMenuIndicatorProps>(
  function NavigationMenuIndicator(
    { asChild = false, children, className, forceMount, render, style, ...props },
    ref,
  ) {
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
    const renderElement = getRenderElement(asChild, children, render);
    const indicatorChildren =
      asChild && React.isValidElement<{ children?: React.ReactNode }>(renderElement)
        ? renderElement.props.children
        : children;
    const indicatorProps = {
      ...props,
      "aria-hidden": true,
      "data-slot": "navigation-menu-indicator",
      "data-orientation": adapter.orientation,
      "data-state": visible ? "visible" : "hidden",
      className: cn(
        "absolute top-full z-1 flex h-1.5 items-end justify-center overflow-hidden transition-[transform,width,height,opacity] data-[state=hidden]:pointer-events-none data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:animate-in data-[state=visible]:fade-in",
        !horizontal && "top-0 right-0 h-auto w-1.5 items-center",
        className,
      ),
      ref,
      style: indicatorStyle,
    } as React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> };
    const indicator =
      typeof renderElement === "function" ? (
        renderElement(indicatorProps, {})
      ) : renderElement ? (
        mergeRenderElement(
          renderElement,
          indicatorProps as React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> },
        )
      ) : (
        <div {...indicatorProps}>{children}</div>
      );

    return (
      <NavigationMenuPrimitive.Portal container={adapter.rootElement} keepMounted>
        {React.cloneElement(
          indicator,
          undefined,
          indicatorChildren,
          <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />,
        )}
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
