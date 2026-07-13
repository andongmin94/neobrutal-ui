"use client";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { DirectionProvider, useDirection } from "@base-ui/react/direction-provider";
import { mergeProps } from "@base-ui/react/merge-props";
import * as React from "react";

import { cn } from "@/lib/utils";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

type AccordionBaseProps = Omit<
  AccordionPrimitive.Root.Props<string>,
  "defaultValue" | "loopFocus" | "multiple" | "onValueChange" | "value"
> & {
  asChild?: boolean;
  children?: React.ReactNode;
  loop?: boolean;
  loopFocus?: boolean;
};

type AccordionSingleProps = AccordionBaseProps & {
  collapsible?: boolean;
  defaultValue?: string;
  onValueChange?: (value: string, eventDetails: AccordionPrimitive.Root.ChangeEventDetails) => void;
  type: "single";
  value?: string;
};

type AccordionMultipleProps = AccordionBaseProps & {
  collapsible?: never;
  defaultValue?: string[];
  onValueChange?: (
    value: string[],
    eventDetails: AccordionPrimitive.Root.ChangeEventDetails,
  ) => void;
  type: "multiple";
  value?: string[];
};

type AccordionProps = AccordionSingleProps | AccordionMultipleProps;
type AccordionKeyDownHandler = NonNullable<AccordionPrimitive.Root.Props<string>["onKeyDown"]>;
type RenderProps = React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> };
type AccordionContentStyle = React.CSSProperties & {
  "--radix-accordion-content-height"?: string;
  "--radix-accordion-content-width"?: string;
};

const accordionContentCssVariables: AccordionContentStyle = {
  "--radix-accordion-content-height": "var(--accordion-panel-height)",
  "--radix-accordion-content-width": "var(--accordion-panel-width)",
};

function mergeContentStyle(
  style: AccordionPrimitive.Panel.Props["style"],
): AccordionPrimitive.Panel.Props["style"] {
  if (typeof style === "function") {
    return (state) => ({ ...accordionContentCssVariables, ...style(state) });
  }

  return { ...accordionContentCssVariables, ...style };
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

function isDisabledAccordionTrigger(trigger: HTMLElement) {
  return (
    (trigger instanceof HTMLButtonElement && trigger.disabled) ||
    trigger.getAttribute("aria-disabled") === "true" ||
    trigger.hasAttribute("data-disabled")
  );
}

function getAccordionTriggers(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>('[data-slot="accordion-trigger"]')).filter(
    (trigger) =>
      trigger.closest<HTMLElement>('[data-slot="accordion"]') === root &&
      !isDisabledAccordionTrigger(trigger),
  );
}

function Accordion(props: AccordionProps) {
  const inheritedDirection = useDirection();
  const direction = props.dir === "rtl" ? "rtl" : props.dir === "ltr" ? "ltr" : inheritedDirection;
  const disabled = props.disabled ?? false;
  const loop = props.loop ?? props.loopFocus ?? true;
  const orientation = props.orientation ?? "vertical";
  const onKeyDown = props.onKeyDown;

  const handleKeyDown = React.useCallback<AccordionKeyDownHandler>(
    (event) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || event.baseUIHandlerPrevented || disabled) {
        event.preventBaseUIHandler();
        return;
      }

      const navigationKeys = new Set([
        "Home",
        "End",
        "ArrowDown",
        "ArrowUp",
        "ArrowLeft",
        "ArrowRight",
      ]);
      if (!navigationKeys.has(event.key)) {
        return;
      }

      const target = (event.target as Element).closest<HTMLElement>(
        '[data-slot="accordion-trigger"]',
      );
      const root = event.currentTarget;
      if (target?.closest<HTMLElement>('[data-slot="accordion"]') !== root) {
        return;
      }

      const triggers = getAccordionTriggers(root);
      const currentIndex = target === null ? -1 : triggers.indexOf(target);
      if (currentIndex === -1 || triggers.length === 0) {
        return;
      }

      event.preventDefault();
      event.preventBaseUIHandler();

      let nextIndex = currentIndex;
      const lastIndex = triggers.length - 1;
      const move = (offset: number) => {
        const candidate = currentIndex + offset;
        if (candidate < 0) {
          nextIndex = loop ? lastIndex : 0;
        } else if (candidate > lastIndex) {
          nextIndex = loop ? 0 : lastIndex;
        } else {
          nextIndex = candidate;
        }
      };

      switch (event.key) {
        case "Home":
          nextIndex = 0;
          break;
        case "End":
          nextIndex = lastIndex;
          break;
        case "ArrowDown":
          if (orientation === "vertical") move(1);
          break;
        case "ArrowUp":
          if (orientation === "vertical") move(-1);
          break;
        case "ArrowRight":
          if (orientation === "horizontal") move(direction === "rtl" ? -1 : 1);
          break;
        case "ArrowLeft":
          if (orientation === "horizontal") move(direction === "rtl" ? 1 : -1);
          break;
      }

      triggers[nextIndex]?.focus();
    },
    [direction, disabled, loop, onKeyDown, orientation],
  );

  if (props.type === "multiple") {
    const {
      asChild = false,
      className,
      children,
      defaultValue,
      loop: _loop,
      loopFocus: _loopFocus,
      onKeyDown: _onKeyDown,
      onValueChange,
      orientation: _orientation,
      render,
      type: _type,
      value,
      ...rootProps
    } = props;

    const accordion = (
      <AccordionPrimitive.Root<string>
        data-slot="accordion"
        data-orientation={orientation}
        className={cn("flex w-full flex-col", className)}
        defaultValue={defaultValue}
        loopFocus={loop}
        multiple
        onKeyDown={handleKeyDown}
        onValueChange={onValueChange}
        orientation={orientation}
        render={renderWithAliases<AccordionPrimitive.Root.State<string>>(
          asChild ? getChildElement(children, "Accordion") : render,
          React.createElement("div"),
          (state) => ({
            "data-disabled": state.disabled ? "" : undefined,
            "data-orientation": state.orientation,
          }),
        )}
        value={value}
        {...rootProps}
      >
        {asChild ? undefined : children}
      </AccordionPrimitive.Root>
    );

    return <DirectionProvider direction={direction}>{accordion}</DirectionProvider>;
  }

  const {
    asChild = false,
    className,
    collapsible = false,
    children,
    defaultValue,
    loop: _loop,
    loopFocus: _loopFocus,
    onKeyDown: _onKeyDown,
    onValueChange,
    orientation: _orientation,
    render,
    type: _type,
    value,
    ...rootProps
  } = props;

  const accordion = (
    <AccordionPrimitive.Root<string>
      data-slot="accordion"
      data-orientation={orientation}
      className={cn("flex w-full flex-col", className)}
      defaultValue={defaultValue === undefined ? undefined : [defaultValue]}
      loopFocus={loop}
      multiple={false}
      onKeyDown={handleKeyDown}
      onValueChange={(nextValue, eventDetails) => {
        if (!collapsible && nextValue.length === 0) {
          eventDetails.cancel();
          return;
        }

        onValueChange?.(nextValue[0] ?? "", eventDetails);
      }}
      orientation={orientation}
      render={renderWithAliases<AccordionPrimitive.Root.State<string>>(
        asChild ? getChildElement(children, "Accordion") : render,
        React.createElement("div"),
        (state) => ({
          "data-disabled": state.disabled ? "" : undefined,
          "data-orientation": state.orientation,
        }),
      )}
      value={value === undefined ? undefined : [value]}
      {...rootProps}
    >
      {asChild ? undefined : children}
    </AccordionPrimitive.Root>
  );

  return <DirectionProvider direction={direction}>{accordion}</DirectionProvider>;
}

function AccordionItem({
  asChild = false,
  children,
  className,
  render,
  ...props
}: AccordionPrimitive.Item.Props & { asChild?: boolean; children?: React.ReactNode }) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        "overflow-hidden rounded-base border-2 border-b border-border shadow-shadow",
        className,
      )}
      render={renderWithAliases<AccordionPrimitive.Item.State>(
        asChild ? getChildElement(children, "AccordionItem") : render,
        React.createElement("div"),
        (state) => ({
          "data-disabled": state.disabled ? "" : undefined,
          "data-orientation": state.orientation,
          "data-state": state.open ? "open" : "closed",
        }),
      )}
      {...props}
    >
      {asChild ? undefined : children}
    </AccordionPrimitive.Item>
  );
}

function AccordionTrigger({
  asChild = false,
  className,
  children,
  render,
  ...props
}: AccordionPrimitive.Trigger.Props & { asChild?: boolean; children?: React.ReactNode }) {
  return (
    <AccordionPrimitive.Header
      className="flex"
      render={renderWithAliases<AccordionPrimitive.Item.State>(
        undefined,
        React.createElement("h3"),
        (state) => ({
          "data-disabled": state.disabled ? "" : undefined,
          "data-orientation": state.orientation,
          "data-state": state.open ? "open" : "closed",
        }),
      )}
    >
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger flex flex-1 items-center justify-between border-border bg-main p-4 text-left text-base font-heading text-main-foreground transition-all focus-visible:ring-[3px] aria-disabled:pointer-events-none aria-disabled:opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50 data-panel-open:rounded-b-none data-panel-open:border-b-2 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-5",
          className,
        )}
        render={renderWithAliases<AccordionPrimitive.Trigger.State>(
          asChild ? getChildElement(children, "AccordionTrigger") : render,
          React.createElement("button"),
          (state) => ({
            "data-disabled": state.disabled ? "" : undefined,
            "data-orientation": state.orientation,
            "data-state": state.open ? "open" : "closed",
          }),
        )}
        {...props}
      >
        {asChild ? undefined : children}
        <ChevronDownIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none shrink-0 transition-transform duration-200 group-data-panel-open/accordion-trigger:rotate-180 group-aria-expanded/accordion-trigger:rotate-180"
        />
        <ChevronUpIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none hidden shrink-0"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  asChild = false,
  children,
  className,
  forceMount,
  keepMounted,
  render,
  style,
  ...props
}: Omit<AccordionPrimitive.Panel.Props, "keepMounted"> & {
  asChild?: boolean;
  children?: React.ReactNode;
  forceMount?: true;
  keepMounted?: boolean;
}) {
  const child = asChild ? getChildElement(children, "AccordionContent") : undefined;
  const content = child ? (child.props as { children?: React.ReactNode }).children : children;
  const contentElement = (
    <div
      className={cn(
        "p-4 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        className,
      )}
    >
      {content}
    </div>
  );

  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="h-(--accordion-panel-height) overflow-hidden rounded-b-base bg-secondary-background text-sm font-base transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0"
      keepMounted={keepMounted ?? forceMount}
      style={mergeContentStyle(style)}
      render={renderWithAliases<AccordionPrimitive.Panel.State>(
        child ? React.cloneElement(child, undefined, contentElement) : render,
        React.createElement("div"),
        (state) => ({
          "data-disabled": state.disabled ? "" : undefined,
          "data-orientation": state.orientation,
          "data-state": state.open ? "open" : "closed",
        }),
      )}
      {...props}
    >
      {child ? undefined : contentElement}
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
