"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export default function DrawerDemo() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <div className="grid justify-items-center gap-3">
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button>Open</Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-[300px]">
            <DrawerHeader>
              <DrawerTitle>Are you absolutely sure?</DrawerTitle>
              <DrawerDescription>This action cannot be undone.</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter className="grid grid-cols-2">
              <Button
                type="button"
                variant="noShadow"
                onClick={() => {
                  setMessage("Action submitted.");
                  setOpen(false);
                }}
              >
                Submit
              </Button>
              <DrawerClose asChild>
                <Button
                  type="button"
                  className="bg-secondary-background text-foreground"
                  variant="noShadow"
                >
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
      <output className="block min-h-5 text-sm" aria-live="polite">
        {message}
      </output>
    </div>
  );
}
