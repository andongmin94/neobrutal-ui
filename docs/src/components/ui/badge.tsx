import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-base border-2 border-border px-2.5 py-0.5 text-xs font-base w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-main text-main-foreground",
        neutral: "bg-secondary-background text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  render,
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
    render?: React.ReactElement;
  }) {
  const child = asChild
    ? (React.Children.toArray(children).find(React.isValidElement) as React.ReactElement)
    : render;
  const badgeClassName = cn(badgeVariants({ variant }), className);

  if (React.isValidElement(child)) {
    const childElement = child as React.ReactElement<Record<string, unknown>>;

    return React.cloneElement(childElement, {
      ...props,
      ...childElement.props,
      "data-slot": "badge",
      className: cn(badgeClassName, childElement.props.className as string),
    });
  }

  return (
    <span data-slot="badge" className={badgeClassName} {...props}>
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
