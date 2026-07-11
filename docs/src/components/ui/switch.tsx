"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-border bg-secondary-background transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[size=default]:h-6 data-[size=default]:w-12 data-[size=sm]:h-5 data-[size=sm]:w-10 data-checked:bg-main data-unchecked:bg-secondary-background data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full border-2 border-border bg-white ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-6 group-data-[size=sm]/switch:data-checked:translate-x-5 group-data-[size=default]/switch:data-unchecked:translate-x-1 group-data-[size=sm]/switch:data-unchecked:translate-x-1"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
