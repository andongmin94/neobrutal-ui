"use client"

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"
import * as React from "react"

function Collapsible({
  asChild = false,
  children,
  render,
  ...props
}: CollapsiblePrimitive.Root.Props & {
  asChild?: boolean
  children?: React.ReactNode
}) {
  const renderElement =
    asChild && React.isValidElement(children) ? children : render

  return (
    <CollapsiblePrimitive.Root
      data-slot="collapsible"
      render={renderElement}
      {...props}
    >
      {asChild && React.isValidElement(children) ? undefined : children}
    </CollapsiblePrimitive.Root>
  )
}

function CollapsibleTrigger({
  asChild = false,
  children,
  render,
  ...props
}: CollapsiblePrimitive.Trigger.Props & {
  asChild?: boolean
  children?: React.ReactNode
}) {
  const renderElement =
    asChild && React.isValidElement(children) ? children : render

  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      render={renderElement}
      {...props}
    >
      {asChild && React.isValidElement(children) ? undefined : children}
    </CollapsiblePrimitive.Trigger>
  )
}

function CollapsibleContent({ ...props }: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel data-slot="collapsible-content" {...props} />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
