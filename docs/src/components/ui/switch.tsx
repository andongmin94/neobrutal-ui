"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { mergeProps } from "@base-ui/react/merge-props";
import * as React from "react";

import { cn } from "@/lib/utils";

type RenderProps = React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> };

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

function renderWithAliases<State extends { checked: boolean; disabled: boolean }>(
  render:
    | React.ReactElement
    | ((props: RenderProps, state: State) => React.ReactElement)
    | undefined,
  fallback: React.ReactElement,
) {
  return (elementProps: RenderProps, state: State) => {
    const aliasedProps = mergeProps(
      elementProps as React.ComponentPropsWithRef<"button">,
      {
        "data-disabled": state.disabled ? "" : undefined,
        "data-state": state.checked ? "checked" : "unchecked",
      } as React.ComponentPropsWithRef<"button">,
    ) as RenderProps;

    if (typeof render === "function") {
      return render(aliasedProps, state);
    }

    const element = (render ?? fallback) as React.ReactElement<RenderProps>;
    const mergedProps = mergeProps(
      aliasedProps as React.ComponentPropsWithRef<"button">,
      element.props as React.ComponentPropsWithRef<"button">,
    ) as RenderProps;
    mergedProps.ref = mergeRefs(aliasedProps.ref, element.props.ref);
    return React.cloneElement(element, mergedProps);
  };
}

function getChildElement(children: React.ReactNode) {
  const child = React.Children.toArray(children).find(React.isValidElement);
  if (child === undefined) {
    throw new Error("Switch with asChild requires a valid React element child.");
  }
  return preserveRadixEventCancellation(
    child as React.ReactElement<{ [key: string]: unknown; children?: React.ReactNode }>,
  );
}

type SwitchProps = Omit<SwitchPrimitive.Root.Props, "ref"> & {
  asChild?: boolean;
  children?: React.ReactNode;
  size?: "sm" | "default";
};

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { asChild = false, children, className, nativeButton, render, size = "default", ...props },
  forwardedRef,
) {
  const renderElement = asChild
    ? getChildElement(children)
    : (render ?? React.createElement("button"));
  const resolvedNativeButton =
    nativeButton ??
    (typeof renderElement !== "function" &&
      typeof renderElement.type === "string" &&
      renderElement.type === "button");

  return (
    <SwitchPrimitive.Root
      ref={forwardedRef}
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-border bg-secondary-background transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[size=default]:h-6 data-[size=default]:w-12 data-[size=sm]:h-5 data-[size=sm]:w-10 data-checked:bg-main data-unchecked:bg-secondary-background data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      nativeButton={resolvedNativeButton}
      render={renderWithAliases<SwitchPrimitive.Root.State>(
        renderElement,
        React.createElement("button"),
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full border-2 border-border bg-white ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-6 group-data-[size=sm]/switch:data-checked:translate-x-5 group-data-[size=default]/switch:data-unchecked:translate-x-1 group-data-[size=sm]/switch:data-unchecked:translate-x-1"
        render={renderWithAliases<SwitchPrimitive.Thumb.State>(undefined, <span />)}
      />
    </SwitchPrimitive.Root>
  );
});

export { Switch };
