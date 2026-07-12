"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import * as React from "react";

import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

type CheckedState = boolean | "indeterminate";
type CheckboxProps = Omit<
  CheckboxPrimitive.Root.Props,
  "checked" | "defaultChecked" | "onCheckedChange"
> & {
  checked?: CheckedState;
  defaultChecked?: CheckedState;
  onCheckedChange?: (
    checked: CheckedState,
    eventDetails: CheckboxPrimitive.Root.ChangeEventDetails,
  ) => void;
};

function setRefValue<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

function Checkbox({
  checked,
  className,
  defaultChecked,
  form,
  indeterminate,
  inputRef,
  onClick,
  onCheckedChange,
  ...props
}: CheckboxProps) {
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
      data-slot="checkbox"
      checked={currentChecked === true}
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-base border-2 border-border bg-secondary-background outline-hidden ring-offset-white transition-colors focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-checked:bg-main data-checked:text-main-foreground data-indeterminate:bg-main data-indeterminate:text-main-foreground",
        className,
      )}
      form={form}
      indeterminate={indeterminate ?? currentChecked === "indeterminate"}
      inputRef={mergedInputRef}
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
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
