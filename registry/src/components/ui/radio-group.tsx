"use client";

import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";

import { cn } from "@/lib/utils";

function RadioGroup({
  className,
  ...props
}: RadioGroupPrimitive.Props<string>) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      {...props}
      className={(state) =>
        cn("grid gap-2", typeof className === "function" ? className(state) : className)
      }
    />
  );
}

function RadioGroupItem({
  className,
  nativeButton,
  render,
  ...props
}: RadioPrimitive.Root.Props<string>) {
  const usesDefaultButton = render === undefined;

  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      nativeButton={nativeButton ?? usesDefaultButton}
      render={render ?? <button type="button" />}
      {...props}
      className={(state) =>
        cn(
          "group/radio-group-item peer relative flex aspect-square size-4 shrink-0 rounded-full border-2 border-current text-inherit outline-none focus-visible:ring-1 focus-visible:ring-ring data-disabled:cursor-not-allowed data-disabled:opacity-50",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex size-4 items-center justify-center"
      >
        <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  );
}

export { RadioGroup, RadioGroupItem };
