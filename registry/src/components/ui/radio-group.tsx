"use client";

import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { mergeProps } from "@base-ui/react/merge-props";
import * as React from "react";

import { cn } from "@/lib/utils";

type RadioGroupProps = Omit<
  RadioGroupPrimitive.Props<string>,
  "dir" | "onValueChange" | "value"
> & {
  asChild?: boolean;
  children?: React.ReactNode;
  dir?: "ltr" | "rtl";
  loop?: boolean;
  onValueChange?: (value: string, eventDetails: RadioGroupPrimitive.ChangeEventDetails) => void;
  orientation?: "horizontal" | "vertical";
  value?: string | null;
};

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
      elementProps as React.ComponentPropsWithRef<"button">,
      getAliases(state) as React.ComponentPropsWithRef<"button">,
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

function getChildElement(children: React.ReactNode, componentName: string) {
  const child = React.Children.toArray(children).find(React.isValidElement);
  if (child === undefined) {
    throw new Error(`${componentName} with asChild requires a valid React element child.`);
  }
  return preserveRadixEventCancellation(
    child as React.ReactElement<{ [key: string]: unknown; children?: React.ReactNode }>,
  );
}

function RadioGroup({
  asChild = false,
  className,
  children,
  dir,
  loop = true,
  onKeyDown,
  orientation,
  render,
  value,
  ...props
}: RadioGroupProps) {
  const group = (
    <RadioGroupPrimitive
      data-slot="radio-group"
      data-orientation={orientation}
      dir={dir}
      className={cn("grid gap-2", className)}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || event.baseUIHandlerPrevented) {
          event.preventBaseUIHandler();
          return;
        }

        const horizontalKey = event.key === "ArrowLeft" || event.key === "ArrowRight";
        const verticalKey = event.key === "ArrowUp" || event.key === "ArrowDown";

        if (
          (orientation === "horizontal" && verticalKey) ||
          (orientation === "vertical" && horizontalKey)
        ) {
          event.preventBaseUIHandler();
          return;
        }

        if (loop || (!horizontalKey && !verticalKey)) {
          return;
        }

        const radios = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]'),
        ).filter(
          (radio) =>
            radio.closest('[role="radiogroup"]') === event.currentTarget &&
            radio.getAttribute("aria-disabled") !== "true" &&
            !radio.hasAttribute("data-disabled"),
        );
        const currentRadio = (event.target as Element).closest<HTMLElement>('[role="radio"]');
        const currentIndex = currentRadio === null ? -1 : radios.indexOf(currentRadio);

        if (currentIndex === -1) {
          return;
        }

        const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
        const backward =
          event.key === "ArrowUp" || event.key === (rtl ? "ArrowRight" : "ArrowLeft");
        const forward =
          event.key === "ArrowDown" || event.key === (rtl ? "ArrowLeft" : "ArrowRight");

        if ((backward && currentIndex === 0) || (forward && currentIndex === radios.length - 1)) {
          event.preventBaseUIHandler();
        }
      }}
      render={renderWithAliases<RadioGroupPrimitive.State>(
        asChild ? getChildElement(children, "RadioGroup") : render,
        React.createElement("div"),
        (state) => ({
          "data-disabled": state.disabled ? "" : undefined,
          "data-orientation": orientation,
        }),
      )}
      value={value === null ? "" : value}
      {...props}
    >
      {asChild ? undefined : children}
    </RadioGroupPrimitive>
  );

  return dir === undefined ? group : <DirectionProvider direction={dir}>{group}</DirectionProvider>;
}

type RadioGroupItemProps = Omit<RadioPrimitive.Root.Props<string>, "ref" | "value"> & {
  asChild?: boolean;
  checked?: boolean;
  children?: React.ReactNode;
  form?: string;
  forceMount?: true;
  type?: "button" | "reset" | "submit";
  value: string;
};

const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  function RadioGroupItem(
    {
      asChild = false,
      checked: _checked,
      children,
      className,
      form,
      forceMount,
      nativeButton,
      render,
      type = "button",
      value,
      ...props
    },
    forwardedRef,
  ) {
    const renderElement = asChild
      ? getChildElement(children, "RadioGroupItem")
      : (render ?? React.createElement("button", { form, type }));
    const resolvedNativeButton =
      nativeButton ??
      (typeof renderElement !== "function" &&
        typeof renderElement.type === "string" &&
        renderElement.type === "button");

    return (
      <RadioPrimitive.Root
        ref={forwardedRef}
        data-slot="radio-group-item"
        className={cn(
          "group/radio-group-item peer relative flex aspect-square size-4 shrink-0 rounded-full border-2 border-border text-black outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white",
          className,
        )}
        nativeButton={resolvedNativeButton}
        value={value}
        render={renderWithAliases<RadioPrimitive.Root.State>(
          renderElement,
          React.createElement("button"),
          (state) => ({
            "data-disabled": state.disabled ? "" : undefined,
            "data-state": state.checked ? "checked" : "unchecked",
            form,
            type,
            value,
          }),
        )}
        {...props}
      >
        <RadioPrimitive.Indicator
          data-slot="radio-group-indicator"
          className="flex size-4 items-center justify-center"
          keepMounted={forceMount}
          render={renderWithAliases<RadioPrimitive.Indicator.State>(
            undefined,
            <span />,
            (state) => ({
              "data-disabled": state.disabled ? "" : undefined,
              "data-state": state.checked ? "checked" : "unchecked",
            }),
          )}
        >
          <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" />
        </RadioPrimitive.Indicator>
      </RadioPrimitive.Root>
    );
  },
);

export { RadioGroup, RadioGroupItem };
