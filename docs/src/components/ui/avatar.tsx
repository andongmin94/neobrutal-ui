"use client";

import * as React from "react";
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";

import { cn } from "@/lib/utils";

function getChildElement(children: React.ReactNode, componentName: string) {
  const child = React.Children.toArray(children).find(React.isValidElement);
  if (child === undefined) {
    throw new Error(`${componentName} with asChild requires a valid React element child.`);
  }
  return child;
}

function Avatar({
  asChild = false,
  className,
  children,
  render,
  size = "default",
  ...props
}: AvatarPrimitive.Root.Props & {
  asChild?: boolean;
  children?: React.ReactNode;
  size?: "default" | "sm" | "lg";
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "group/avatar relative flex size-10 shrink-0 overflow-hidden rounded-full outline-2 outline-border select-none data-[size=lg]:size-12 data-[size=sm]:size-8",
        className,
      )}
      render={asChild ? getChildElement(children, "Avatar") : render}
      {...props}
    >
      {asChild ? undefined : children}
    </AvatarPrimitive.Root>
  );
}

function AvatarImage({
  asChild = false,
  children,
  className,
  render,
  ...props
}: AvatarPrimitive.Image.Props & { asChild?: boolean; children?: React.ReactNode }) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full rounded-full object-cover", className)}
      render={asChild ? getChildElement(children, "AvatarImage") : render}
      {...props}
    />
  );
}

function AvatarFallback({
  asChild = false,
  children,
  className,
  delay,
  delayMs,
  render,
  ...props
}: AvatarPrimitive.Fallback.Props & {
  asChild?: boolean;
  children?: React.ReactNode;
  delayMs?: number;
}) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-secondary-background text-sm font-base text-foreground group-data-[size=sm]/avatar:text-xs",
        className,
      )}
      delay={delay ?? delayMs}
      render={asChild ? getChildElement(children, "AvatarFallback") : render}
      {...props}
    >
      {asChild ? undefined : children}
    </AvatarPrimitive.Fallback>
  );
}

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground bg-blend-color ring-2 ring-background select-none",
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
        className,
      )}
      {...props}
    />
  );
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
        className,
      )}
      {...props}
    />
  );
}

function AvatarGroupCount({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "relative flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary-background text-sm font-base text-foreground ring-2 ring-border group-has-data-[size=lg]/avatar-group:size-12 group-has-data-[size=sm]/avatar-group:size-8 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarBadge };
