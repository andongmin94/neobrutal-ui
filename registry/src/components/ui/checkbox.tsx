"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"

import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"

type CheckedState = boolean | "indeterminate"
type CheckboxProps = Omit<
  CheckboxPrimitive.Root.Props,
  "checked" | "defaultChecked"
> & {
  checked?: CheckedState
  defaultChecked?: CheckedState
}

function Checkbox({
  checked,
  className,
  defaultChecked,
  indeterminate,
  ...props
}: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      checked={checked === "indeterminate" ? false : checked}
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-base border-2 border-border bg-secondary-background outline-hidden ring-offset-white transition-colors focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-checked:bg-main data-checked:text-main-foreground data-indeterminate:bg-main data-indeterminate:text-main-foreground",
        className
      )}
      defaultChecked={
        defaultChecked === "indeterminate" ? false : defaultChecked
      }
      indeterminate={indeterminate ?? checked === "indeterminate"}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        <CheckIcon
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
