"use client";

import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function AlertDialogDemo() {
  const [message, setMessage] = useState("");

  return (
    <div className="grid justify-items-center gap-3">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline">Archive release candidate</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this release candidate?</AlertDialogTitle>
            <AlertDialogDescription>
              It will leave the active review queue. You can restore it later from the archive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep active</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => setMessage("Release candidate archived in this local preview.")}
            >
              Archive candidate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <output className="block min-h-5 text-sm" aria-live="polite">
        {message}
      </output>
    </div>
  );
}
