"use client";

import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
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

type ProgressProps = Omit<ProgressPrimitive.Root.Props, "value"> & {
  asChild?: boolean;
  children?: React.ReactNode;
  getValueLabel?: (value: number, max: number) => string;
  value?: number | null;
};

function Progress({
  asChild = false,
  children,
  className,
  getAriaValueText,
  getValueLabel,
  max = 100,
  render,
  value = null,
  ...props
}: ProgressProps) {
  const child = asChild ? getChildElement(children, "Progress") : undefined;
  const content = child ? (child.props as { children?: React.ReactNode }).children : children;
  const progressChildren = (
    <>
      {content}
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </>
  );
  const stateAliases = (state: ProgressPrimitive.Root.State) => ({
    "data-max": String(max),
    "data-state": state.status === "progressing" ? "loading" : state.status,
    "data-value": value === null ? undefined : String(value),
  });

  return (
    <ProgressPrimitive.Root
      value={value}
      max={max}
      data-slot="progress"
      className={cn("flex w-full flex-wrap gap-3", className)}
      getAriaValueText={
        getAriaValueText ??
        (getValueLabel
          ? (_formattedValue, currentValue) =>
              currentValue === null ? "indeterminate" : getValueLabel(currentValue, max)
          : undefined)
      }
      render={renderWithAliases<ProgressPrimitive.Root.State>(
        child ? React.cloneElement(child, undefined, progressChildren) : render,
        <div />,
        stateAliases,
      )}
      {...props}
    >
      {child ? undefined : progressChildren}
    </ProgressPrimitive.Root>
  );
}

function ProgressTrack({
  asChild = false,
  children,
  className,
  render,
  ...props
}: ProgressPrimitive.Track.Props & { asChild?: boolean; children?: React.ReactNode }) {
  return (
    <ProgressPrimitive.Track
      className={cn(
        "relative flex h-4 w-full items-center overflow-hidden rounded-base border-2 border-border bg-secondary-background",
        className,
      )}
      data-slot="progress-track"
      render={asChild ? getChildElement(children, "ProgressTrack") : render}
      {...props}
    >
      {asChild ? undefined : children}
    </ProgressPrimitive.Track>
  );
}

function ProgressIndicator({
  asChild = false,
  children,
  className,
  render,
  ...props
}: ProgressPrimitive.Indicator.Props & { asChild?: boolean; children?: React.ReactNode }) {
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn("h-full border-r-2 border-border bg-main transition-all", className)}
      render={renderWithAliases<ProgressPrimitive.Indicator.State>(
        asChild ? getChildElement(children, "ProgressIndicator") : render,
        <div />,
        (state) => ({
          "data-state": state.status === "progressing" ? "loading" : state.status,
        }),
      )}
      {...props}
    >
      {asChild ? undefined : children}
    </ProgressPrimitive.Indicator>
  );
}

function ProgressLabel({
  asChild = false,
  children,
  className,
  render,
  ...props
}: ProgressPrimitive.Label.Props & { asChild?: boolean; children?: React.ReactNode }) {
  return (
    <ProgressPrimitive.Label
      className={cn("text-sm font-heading", className)}
      data-slot="progress-label"
      render={asChild ? getChildElement(children, "ProgressLabel") : render}
      {...props}
    >
      {asChild ? undefined : children}
    </ProgressPrimitive.Label>
  );
}

function ProgressValue({
  asChild = false,
  children,
  className,
  render,
  ...props
}: ProgressPrimitive.Value.Props & { asChild?: boolean; children?: React.ReactNode }) {
  return (
    <ProgressPrimitive.Value
      className={cn("ml-auto text-sm font-base text-foreground tabular-nums", className)}
      data-slot="progress-value"
      render={asChild ? getChildElement(children, "ProgressValue") : render}
      {...props}
    >
      {asChild ? undefined : children}
    </ProgressPrimitive.Value>
  );
}

export { Progress, ProgressTrack, ProgressIndicator, ProgressLabel, ProgressValue };
