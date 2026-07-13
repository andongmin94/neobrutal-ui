"use client";

import * as React from "react";
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";
import { mergeProps } from "@base-ui/react/merge-props";

import { cn } from "@/lib/utils";

type ScrollAreaType = "auto" | "always" | "hover" | "scroll";
type ScrollAreaContract = {
  hovering: boolean;
  scrolling: boolean;
  type: ScrollAreaType;
};
type RenderProps = React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> };
type ScrollAreaRootStyle = React.CSSProperties & {
  "--radix-scroll-area-corner-height"?: string;
  "--radix-scroll-area-corner-width"?: string;
};
type ScrollAreaScrollbarStyle = React.CSSProperties & {
  "--radix-scroll-area-thumb-height"?: string;
  "--radix-scroll-area-thumb-width"?: string;
};

const scrollAreaRootCssVariables: ScrollAreaRootStyle = {
  "--radix-scroll-area-corner-height": "var(--scroll-area-corner-height)",
  "--radix-scroll-area-corner-width": "var(--scroll-area-corner-width)",
};
const scrollAreaScrollbarCssVariables: ScrollAreaScrollbarStyle = {
  "--radix-scroll-area-thumb-height": "var(--scroll-area-thumb-height)",
  "--radix-scroll-area-thumb-width": "var(--scroll-area-thumb-width)",
};

function mergeRootStyle(
  style: ScrollAreaPrimitive.Root.Props["style"],
): ScrollAreaPrimitive.Root.Props["style"] {
  if (typeof style === "function") {
    return (state) => ({ ...scrollAreaRootCssVariables, ...style(state) });
  }

  return { ...scrollAreaRootCssVariables, ...style };
}

const ScrollAreaContractContext = React.createContext<ScrollAreaContract>({
  hovering: false,
  scrolling: false,
  type: "hover",
});

function mergeRefs(...refs: (React.Ref<HTMLElement> | undefined)[]) {
  return (element: HTMLElement | null) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    });
  };
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

function renderWithAliases<State>(
  render:
    | React.ReactElement
    | ((props: RenderProps, state: State) => React.ReactElement)
    | undefined,
  fallback: React.ReactElement,
  getAliases: (state: State) => Record<string, string | undefined>,
) {
  return (elementProps: RenderProps, state: State) => {
    const aliasedProps = mergeProps(
      elementProps as React.ComponentPropsWithRef<"div">,
      getAliases(state) as React.ComponentPropsWithRef<"div">,
    ) as RenderProps;

    if (typeof render === "function") {
      return render(aliasedProps, state);
    }

    const element = (render ?? fallback) as React.ReactElement<RenderProps>;
    const mergedProps = mergeProps(
      aliasedProps as React.ComponentPropsWithRef<"div">,
      element.props as React.ComponentPropsWithRef<"div">,
    ) as RenderProps;
    mergedProps.ref = mergeRefs(aliasedProps.ref, element.props.ref);
    return React.cloneElement(element, mergedProps);
  };
}

function getChildElement(children: React.ReactNode, componentName: string) {
  const child = React.Children.toArray(children).find(React.isValidElement);
  if (child === undefined) {
    throw new Error(`${componentName} with asChild requires a valid React element child.`);
  }
  return preserveRadixEventCancellation(
    child as React.ReactElement<{ [key: string]: unknown; children?: React.ReactNode }>,
  );
}

type ScrollAreaProps = ScrollAreaPrimitive.Root.Props & {
  asChild?: boolean;
  children?: React.ReactNode;
  scrollHideDelay?: number;
  type?: ScrollAreaType;
};

function ScrollArea({
  asChild = false,
  children,
  className,
  onPointerEnter,
  onPointerLeave,
  render,
  scrollHideDelay = 600,
  style,
  type = "hover",
  ...props
}: ScrollAreaProps) {
  const [hovering, setHovering] = React.useState(false);
  const [scrolling, setScrolling] = React.useState(false);
  const hoverTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (hoverTimeoutRef.current !== null) clearTimeout(hoverTimeoutRef.current);
      if (scrollTimeoutRef.current !== null) clearTimeout(scrollTimeoutRef.current);
    },
    [],
  );

  const content = asChild
    ? (getChildElement(children, "ScrollArea").props as { children?: React.ReactNode }).children
    : children;
  const scrollAreaChildren = (
    <>
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="h-full w-full rounded-[inherit] font-base transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
        onScroll={() => {
          setScrolling(true);
          if (scrollTimeoutRef.current !== null) clearTimeout(scrollTimeoutRef.current);
          scrollTimeoutRef.current = setTimeout(() => setScrolling(false), scrollHideDelay);
        }}
      >
        <ScrollAreaPrimitive.Content data-slot="scroll-area-content">
          {content}
        </ScrollAreaPrimitive.Content>
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </>
  );
  const child = asChild ? getChildElement(children, "ScrollArea") : undefined;
  const renderElement = child ? React.cloneElement(child, undefined, scrollAreaChildren) : render;

  return (
    <ScrollAreaContractContext.Provider value={{ hovering, scrolling, type }}>
      <ScrollAreaPrimitive.Root
        data-slot="scroll-area"
        data-type={type}
        className={
          typeof className === "function"
            ? (state) => cn("group/scroll-area relative overflow-hidden", className(state))
            : cn("group/scroll-area relative overflow-hidden", className)
        }
        onPointerEnter={(event) => {
          onPointerEnter?.(event);
          if (hoverTimeoutRef.current !== null) clearTimeout(hoverTimeoutRef.current);
          setHovering(true);
        }}
        onPointerLeave={(event) => {
          onPointerLeave?.(event);
          if (hoverTimeoutRef.current !== null) clearTimeout(hoverTimeoutRef.current);
          hoverTimeoutRef.current = setTimeout(() => setHovering(false), scrollHideDelay);
        }}
        render={renderElement}
        style={mergeRootStyle(style)}
        {...props}
      >
        {child ? undefined : scrollAreaChildren}
      </ScrollAreaPrimitive.Root>
    </ScrollAreaContractContext.Provider>
  );
}

function ScrollBar({
  asChild = false,
  children,
  className,
  forceMount,
  keepMounted,
  orientation = "vertical",
  render,
  style,
  ...props
}: Omit<ScrollAreaPrimitive.Scrollbar.Props, "keepMounted"> & {
  asChild?: boolean;
  children?: React.ReactNode;
  forceMount?: true;
  keepMounted?: boolean;
}) {
  const contract = React.useContext(ScrollAreaContractContext);
  const isVisible = React.useCallback(
    (state: ScrollAreaPrimitive.Scrollbar.State) => {
      const hasOverflow = orientation === "vertical" ? state.hasOverflowY : state.hasOverflowX;
      if (contract.type === "always") return true;
      if (contract.type === "auto") return hasOverflow;
      if (contract.type === "scroll") return hasOverflow && contract.scrolling;
      return hasOverflow && (contract.hovering || contract.scrolling);
    },
    [contract.hovering, contract.scrolling, contract.type, orientation],
  );
  const consumerKeepsMounted = Boolean(keepMounted ?? forceMount);
  const shouldMount =
    consumerKeepsMounted ||
    contract.type === "always" ||
    contract.type === "auto" ||
    (contract.type === "scroll" ? contract.scrolling : contract.hovering || contract.scrolling);

  if (!shouldMount) {
    return null;
  }

  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      keepMounted={keepMounted ?? forceMount ?? (contract.type === "always" ? true : undefined)}
      orientation={orientation}
      className={(state) =>
        cn(
          "flex touch-none p-px transition-[color,background-color,border-color,opacity] duration-0 select-none data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:border-t data-[orientation=horizontal]:border-t-transparent data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2.5 data-[orientation=vertical]:border-l data-[orientation=vertical]:border-l-transparent",
          isVisible(state) ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
          typeof className === "function" ? className(state) : className,
        )
      }
      render={renderWithAliases<ScrollAreaPrimitive.Scrollbar.State>(
        asChild ? getChildElement(children, "ScrollBar") : render,
        <div />,
        (state) => ({
          "data-orientation": state.orientation,
          "data-state": isVisible(state) ? "visible" : "hidden",
        }),
      )}
      style={(state) => ({
        ...scrollAreaScrollbarCssVariables,
        ...(typeof style === "function" ? style(state) : style),
        transitionDelay: "0ms",
      })}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-border"
      />
    </ScrollAreaPrimitive.Scrollbar>
  );
}

export { ScrollArea, ScrollBar };
