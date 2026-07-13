"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { mergeProps } from "@base-ui/react/merge-props";
import * as React from "react";

import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

type CheckedState = boolean | "indeterminate";
type CheckboxProps = Omit<
  CheckboxPrimitive.Root.Props,
  "checked" | "defaultChecked" | "onCheckedChange" | "ref"
> & {
  asChild?: boolean;
  checked?: CheckedState;
  children?: React.ReactNode;
  defaultChecked?: CheckedState;
  forceMount?: true;
  onCheckedChange?: (
    checked: CheckedState,
    eventDetails: CheckboxPrimitive.Root.ChangeEventDetails,
  ) => void;
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

function getChildElement(children: React.ReactNode) {
  const child = React.Children.toArray(children).find(React.isValidElement);
  if (child === undefined) {
    throw new Error("Checkbox with asChild requires a valid React element child.");
  }
  return preserveRadixEventCancellation(
    child as React.ReactElement<{ [key: string]: unknown; children?: React.ReactNode }>,
  );
}

function setRefValue<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
  {
    asChild = false,
    checked,
    children,
    className,
    defaultChecked,
    forceMount,
    form,
    indeterminate,
    inputRef,
    nativeButton,
    onClick,
    onCheckedChange,
    render,
    ...props
  },
  forwardedRef,
) {
  const [uncontrolledChecked, setUncontrolledChecked] = React.useState<CheckedState>(
    defaultChecked ?? false,
  );
  const currentChecked = checked ?? uncontrolledChecked;
  const initialCheckedRef = React.useRef<CheckedState>(defaultChecked ?? false);
  const [associatedForm, setAssociatedForm] = React.useState<HTMLFormElement | null>(null);
  const mergedInputRef = React.useCallback(
    (input: HTMLInputElement | null) => {
      setRefValue(inputRef, input);
      setAssociatedForm(input?.form ?? null);
    },
    [inputRef],
  );
  const renderElement = asChild
    ? getChildElement(children)
    : (render ?? React.createElement("button"));
  const resolvedNativeButton =
    nativeButton ??
    (typeof renderElement !== "function" &&
      typeof renderElement.type === "string" &&
      renderElement.type === "button");

  React.useEffect(() => {
    if (checked !== undefined || associatedForm === null) {
      return undefined;
    }

    const reset = () => setUncontrolledChecked(initialCheckedRef.current);
    associatedForm.addEventListener("reset", reset);
    return () => associatedForm.removeEventListener("reset", reset);
  }, [associatedForm, checked]);

  return (
    <CheckboxPrimitive.Root
      ref={forwardedRef}
      data-slot="checkbox"
      checked={currentChecked === true}
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-base border-2 border-border bg-secondary-background outline-hidden ring-offset-white transition-colors focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-checked:bg-main data-checked:text-main-foreground data-indeterminate:bg-main data-indeterminate:text-main-foreground",
        className,
      )}
      form={form}
      indeterminate={indeterminate ?? currentChecked === "indeterminate"}
      inputRef={mergedInputRef}
      nativeButton={resolvedNativeButton}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) {
          event.preventBaseUIHandler();
        }
      }}
      onCheckedChange={(nextChecked, eventDetails) => {
        onCheckedChange?.(nextChecked, eventDetails);
        if (!eventDetails.isCanceled && checked === undefined) {
          setUncontrolledChecked(nextChecked);
        }
      }}
      render={renderWithAliases<CheckboxPrimitive.Root.State>(
        renderElement,
        React.createElement("button"),
        (state) => ({
          "data-disabled": state.disabled ? "" : undefined,
          "data-state": state.indeterminate
            ? "indeterminate"
            : state.checked
              ? "checked"
              : "unchecked",
        }),
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
        keepMounted={forceMount}
        render={renderWithAliases<CheckboxPrimitive.Indicator.State>(
          undefined,
          <span />,
          (state) => ({
            "data-disabled": state.disabled ? "" : undefined,
            "data-state": state.indeterminate
              ? "indeterminate"
              : state.checked
                ? "checked"
                : "unchecked",
          }),
        )}
      >
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});

export { Checkbox };
