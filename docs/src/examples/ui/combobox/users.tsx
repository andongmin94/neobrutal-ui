"use client";

import { CheckIcon, ChevronsUpDown, PlusCircleIcon } from "lucide-react";

import * as React from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { cn } from "@/lib/utils";

const users = [
  {
    id: "1",
    username: "johndoe",
    initials: "JD",
  },
  {
    id: "2",
    username: "janedoe",
    initials: "JD",
  },
  {
    id: "3",
    username: "alexsmith",
    initials: "AS",
  },
] as const;

export default function UserCombobox() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("1");
  const contentId = React.useId();

  const selectedUser = React.useMemo(() => users.find((user) => user.id === value), [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* A button-backed select-only combobox follows the ARIA combobox pattern. */}
      <PopoverTrigger
        render={
          <Button
            variant="noShadow"
            role="combobox"
            aria-haspopup="listbox"
            aria-label="Select a user"
            aria-expanded={open}
            aria-controls={open ? contentId : undefined}
            className="w-full justify-between px-2 md:max-w-[200px]"
          />
        }
      >
        {selectedUser ? (
          <div className="flex items-center gap-2">
            <Avatar className="size-5">
              <AvatarFallback>{selectedUser.initials}</AvatarFallback>
            </Avatar>
            {selectedUser.username}
          </div>
        ) : (
          "Select user..."
        )}
        <ChevronsUpDown className="text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent id={contentId} className="w-(--anchor-width) border-0 p-0">
        <Command className="**:data-[slot=command-input-wrapper]:h-11">
          <CommandInput placeholder="Search user..." />
          <CommandList className="p-1">
            <CommandEmpty>No user found.</CommandEmpty>
            <CommandGroup className="[&_[cmdk-group-items]]:flex [&_[cmdk-group-items]]:flex-col [&_[cmdk-group-items]]:gap-1">
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.id}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Avatar className="size-5">
                    <AvatarFallback>{user.initials}</AvatarFallback>
                  </Avatar>
                  {user.username}
                  <CheckIcon
                    className={cn("ml-auto", value === user.id ? "opacity-100" : "opacity-0")}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem>
                <PlusCircleIcon />
                Create user
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
