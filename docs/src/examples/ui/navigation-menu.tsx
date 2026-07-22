"use client";

import * as React from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import { cn } from "@/lib/utils";

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Alert Dialog",
    href: "/docs/alert-dialog",
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Hover Card",
    href: "/docs/hover-card",
    description: "For sighted users to preview content available behind a link.",
  },
  {
    title: "Progress",
    href: "/docs/progress",
    description:
      "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
  {
    title: "Scroll Area",
    href: "/docs/scroll-area",
    description: "Provides a consistent scrollable viewport for long content.",
  },
  {
    title: "Tabs",
    href: "/docs/tabs",
    description:
      "A set of layered sections of content, known as tab panels, that are displayed one at a time.",
  },
  {
    title: "Tooltip",
    href: "/docs/tooltip",
    description:
      "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  },
];

export default function NavigationMenuDemo() {
  return (
    <NavigationMenu className="z-5 ">
      <NavigationMenuList>
        <NavigationMenuItem className="sm:block hidden">
          <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[min(500px,calc(100vw-2rem))] gap-3 p-2 lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-base p-6 no-underline outline-hidden"
                    href="/docs/"
                  >
                    <div className="mb-2 mt-4 text-lg font-heading">neobrutal-ui</div>
                    <p className="text-sm font-base leading-tight">
                      Source-owned React components built with Base UI and Tailwind CSS.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="/docs/" title="Introduction">
                Learn the project model and how the registry fits into your app.
              </ListItem>
              <ListItem href="/docs/installation" title="Installation">
                Install components with the shadcn CLI or copy them manually.
              </ListItem>
              <ListItem href="/docs/design-tokens" title="Design tokens">
                Customize color, type, borders, radius, and hard shadows.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[min(400px,calc(100vw-2rem))] gap-1 p-2 sm:w-[500px] sm:grid-cols-2 sm:gap-3 lg:w-[600px]">
              {components.map((component) => (
                <ListItem key={component.title} title={component.title} href={component.href}>
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/docs/">
            Documentation
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function ListItem({ className, title, children, ...props }: React.ComponentProps<"a">) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          className={cn(
            "hover:bg-accent block text-main-foreground select-none space-y-1 rounded-base border-2 border-transparent p-2 leading-none no-underline outline-hidden transition-colors hover:border-border sm:p-3",
            className,
          )}
          {...props}
        >
          <div className="text-base font-heading leading-none">{title}</div>
          <p className="font-base hidden text-sm leading-snug sm:line-clamp-2">{children}</p>
        </a>
      </NavigationMenuLink>
    </li>
  );
}
ListItem.displayName = "ListItem";
