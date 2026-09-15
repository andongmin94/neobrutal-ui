"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export default function DialogDemo() {
  const [open, setOpen] = useState(false);
  const [savedName, setSavedName] = useState("");
  return (
    <div className="grid justify-items-center gap-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button />}>Edit profile</DialogTrigger>
        <DialogContent>
          <form
            className="grid gap-5"
            onSubmit={(event) => {
              event.preventDefault();
              setSavedName(String(new FormData(event.currentTarget).get("name") ?? ""));
              setOpen(false);
            }}
          >
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                This demo only updates local state. No data is sent.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="dialog-name">Name</Label>
              <Input id="dialog-name" name="name" defaultValue={savedName || "Alex Doe"} required />
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="neutral" />}>Cancel</DialogClose>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <output className="min-h-5 text-sm">
        {savedName ? `Saved: ${savedName}` : "Open the dialog, try Tab, then Escape."}
      </output>
    </div>
  );
}
