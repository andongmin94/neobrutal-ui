"use client";

import { Calculator, Calendar, CreditCard, Settings, Smile, User } from "lucide-react";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

export default function CommandDemo() {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const runCommand = (label: string) => {
    setOpen(false);
    setMessage(`${label} selected.`);
  };

  React.useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === "j" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((currentOpen) => !currentOpen);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className="grid justify-items-start gap-3">
      <Button type="button" onClick={() => setOpen(true)}>
        Open command menu
      </Button>
      <p className="text-sm text-foreground">
        Or press{" "}
        <kbd className="pointer-events-none inline-flex h-5 items-center gap-1 rounded-base border-2 bg-main px-1.5 font-mono text-[10px] font-heading text-main-foreground select-none">
          <span>Ctrl/Command</span>
          <span>J</span>
        </kbd>
      </p>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => runCommand("Calendar")}>
              <Calendar />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand("Emoji search")}>
              <Smile />
              <span>Search Emoji</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand("Calculator")}>
              <Calculator />
              <span>Calculator</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem onSelect={() => runCommand("Profile")}>
              <User />
              <span>Profile</span>
              <CommandShortcut>Ctrl+P</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand("Billing")}>
              <CreditCard />
              <span>Billing</span>
              <CommandShortcut>Ctrl+B</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand("Settings")}>
              <Settings />
              <span>Settings</span>
              <CommandShortcut>Ctrl+S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
      <output className="block min-h-5 text-sm" aria-live="polite">
        {message}
      </output>
    </div>
  );
}
