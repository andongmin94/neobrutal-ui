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
  const [profile, setProfile] = useState({ name: "John Doe", username: "@johndoe" });

  return (
    <div className="grid justify-items-center gap-3">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button />}>Open sheet</SheetTrigger>
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
              const data = new FormData(event.currentTarget);
              setProfile({
                name: String(data.get("name") ?? ""),
                username: String(data.get("username") ?? ""),
              });
              setMessage("Profile preview updated locally.");
              setOpen(false);
            }}
          >
            <div className="grid gap-3">
              <Label htmlFor="sheet-demo-name">Name</Label>
              <Input id="sheet-demo-name" name="name" defaultValue={profile.name} required />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="sheet-demo-username">Username</Label>
              <Input
                id="sheet-demo-username"
                name="username"
                defaultValue={profile.username}
                required
              />
            </div>
          </form>
          <SheetFooter>
            <Button form="sheet-profile-form" type="submit">
              Save changes
            </Button>
            <SheetClose render={<Button type="button" variant="neutral" />}>Close</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <output className="block min-h-5 text-sm" aria-live="polite">
        {message}
      </output>
    </div>
  );
}
