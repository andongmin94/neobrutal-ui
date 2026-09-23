"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function InteractionPreview() {
  const [selected, setSelected] = useState(false);

  return (
    <section aria-label="Installed interactions" className="grid min-w-0 gap-6">
      <h2 className="text-xl font-heading">Installed interactions</h2>
      <div className="grid justify-items-start gap-3">
        <Button variant="outline">Before navigation</Button>
        <NavigationMenu aria-label="Installed navigation">
          <NavigationMenuList>
            <NavigationMenuItem value="start">
              <NavigationMenuTrigger>Start</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-52 gap-1">
                  <li>
                    <NavigationMenuLink href="#consumer-first">
                      First destination
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink href="#consumer-second">
                      Second destination
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem value="reference">
              <NavigationMenuTrigger>Reference</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="#consumer-first">
                  Reference destination
                </NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <div className="flex flex-wrap gap-4">
        <Dialog>
          <DialogTrigger render={<Button />}>Long dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Installed long dialog</DialogTitle>
              <DialogDescription>Review all notes before closing the dialog.</DialogDescription>
            </DialogHeader>
            <Button variant="outline">Start of review</Button>
            <div className="space-y-4">
              {Array.from({ length: 24 }, (_, index) => (
                <p key={index}>
                  Review note {index + 1}. This content must remain reachable on a short screen
                  without adding application-specific dialog styles.
                </p>
              ))}
            </div>
            <DialogFooter>
              <DialogClose render={<Button />}>Finish review</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Sheet>
          <SheetTrigger render={<Button />}>Open panel</SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Installed panel</SheetTitle>
              <SheetDescription>Check a nested popup above the panel backdrop.</SheetDescription>
            </SheetHeader>
            <div className="px-4">
              <Popover>
                <PopoverTrigger render={<Button />}>Panel options</PopoverTrigger>
                <PopoverContent aria-label="Panel options">
                  <Button onClick={() => setSelected(true)}>
                    {selected ? "Option selected" : "Choose option"}
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
            <SheetFooter>
              <SheetClose render={<Button />}>Close panel</SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      <p id="consumer-first">First destination</p>
      <p id="consumer-second">Second destination</p>
    </section>
  );
}
