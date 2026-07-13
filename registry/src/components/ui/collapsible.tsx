"use client";

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";
import { mergeProps } from "@base-ui/react/merge-props";
import * as React from "react";

type RenderProps = React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> };
type CollapsibleContentStyle = React.CSSProperties & {
  "--radix-collapsible-content-height"?: string;
  "--radix-collapsible-content-width"?: string;
};

const collapsibleContentCssVariables: CollapsibleContentStyle = {
  "--radix-collapsible-content-height": "var(--collapsible-panel-height)",
  "--radix-collapsible-content-width": "var(--collapsible-panel-width)",
};

function mergeContentStyle(
  style: CollapsiblePrimitive.Panel.Props["style"],
): CollapsiblePrimitive.Panel.Props["style"] {
  if (typeof style === "function") {
    return (state) => ({ ...collapsibleContentCssVariables, ...style(state) });
  }

  return { ...collapsibleContentCssVariables, ...style };
}

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
) {
  return (elementProps: RenderProps, state: State & { disabled: boolean; open: boolean }) => {
    const aliasedProps = mergeProps(
      elementProps as React.ComponentPropsWithRef<"div">,
      {
        "data-disabled": state.disabled ? "" : undefined,
        "data-state": state.open ? "open" : "closed",
      } as React.ComponentPropsWithRef<"div">,
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

function Collapsible({
  asChild = false,
  children,
  render,
  ...props
}: CollapsiblePrimitive.Root.Props & {
  asChild?: boolean;
  children?: React.ReactNode;
}) {
  const renderElement = asChild ? getChildElement(children, "Collapsible") : render;

  return (
    <CollapsiblePrimitive.Root
      data-slot="collapsible"
      render={renderWithAliases<CollapsiblePrimitive.Root.State>(
        renderElement,
        React.createElement("div"),
      )}
      {...props}
    >
      {asChild ? undefined : children}
    </CollapsiblePrimitive.Root>
  );
}

function CollapsibleTrigger({
  asChild = false,
  children,
  render,
  ...props
}: CollapsiblePrimitive.Trigger.Props & {
  asChild?: boolean;
  children?: React.ReactNode;
}) {
  const renderElement = asChild ? getChildElement(children, "CollapsibleTrigger") : render;

  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      render={renderWithAliases<CollapsiblePrimitive.Trigger.State>(
        renderElement,
        React.createElement("button"),
      )}
      {...props}
    >
      {asChild ? undefined : children}
    </CollapsiblePrimitive.Trigger>
  );
}

function CollapsibleContent({
  asChild = false,
  children,
  forceMount,
  keepMounted,
  render,
  style,
  ...props
}: Omit<CollapsiblePrimitive.Panel.Props, "keepMounted"> & {
  asChild?: boolean;
  children?: React.ReactNode;
  forceMount?: true;
  keepMounted?: boolean;
}) {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-content"
      keepMounted={keepMounted ?? forceMount ?? true}
      style={mergeContentStyle(style)}
      render={renderWithAliases<CollapsiblePrimitive.Panel.State>(
        asChild ? getChildElement(children, "CollapsibleContent") : render,
        React.createElement("div"),
      )}
      {...props}
    >
      {asChild ? undefined : children}
    </CollapsiblePrimitive.Panel>
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
