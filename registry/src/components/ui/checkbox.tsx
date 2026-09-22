"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Checkbox({
  className,
  nativeButton,
  render,
  ...props
}: CheckboxPrimitive.Root.Props) {
  const usesDefaultButton = render === undefined;

  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      nativeButton={nativeButton ?? usesDefaultButton}
      render={render ?? <button type="button" />}
      {...props}
      className={(state) =>
        cn(
          "peer relative flex size-4 shrink-0 items-center justify-center rounded-base border-2 border-border bg-secondary-background outline-hidden transition-colors focus-visible:ring-1 focus-visible:ring-ring data-checked:bg-main data-checked:text-main-foreground data-disabled:cursor-not-allowed data-disabled:opacity-50 data-indeterminate:bg-main data-indeterminate:text-main-foreground",
          typeof className === "function" ? className(state) : className,
        )
      }
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
