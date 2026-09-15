"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function SheetDemo() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <div className="grid justify-items-center gap-3">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button>Open sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit profile</SheetTitle>
            <SheetDescription>
              Edit this local profile preview. No account request is sent.
            </SheetDescription>
          </SheetHeader>
          <form
            id="sheet-profile-form"
            className="grid flex-1 auto-rows-min gap-6 px-4"
            onSubmit={(event) => {
              event.preventDefault();
              setMessage("Profile preview updated locally.");
              setOpen(false);
            }}
          >
            <div className="grid gap-3">
              <Label htmlFor="sheet-demo-name">Name</Label>
              <Input id="sheet-demo-name" defaultValue="Pedro Duarte" required />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="sheet-demo-username">Username</Label>
              <Input id="sheet-demo-username" defaultValue="@andongmin94" required />
            </div>
          </form>
          <SheetFooter>
            <Button form="sheet-profile-form" type="submit">
              Save changes
            </Button>
            <SheetClose asChild>
              <Button type="button" variant="neutral">
                Close
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <output className="block min-h-5 text-sm" aria-live="polite">
        {message}
      </output>
    </div>
  );
}
