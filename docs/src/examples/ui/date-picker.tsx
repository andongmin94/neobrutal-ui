"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function DatePickerDemo() {
  const [date, setDate] = React.useState<Date>();
  const [open, setOpen] = React.useState(false);
  const id = React.useId();
  const trigger = React.useRef<HTMLButtonElement>(null);

  return (
    <div className="w-full max-w-sm">
      <div className="grid gap-2">
        <label htmlFor={id} className="text-sm font-heading">
          Project date
        </label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id={id}
              ref={trigger}
              variant="neutral"
              aria-describedby={`${id}-hint`}
              className="w-full justify-start text-left font-base"
            >
              <CalendarIcon aria-hidden="true" />
              <span className="flex-1">{date ? format(date, "PPP") : "Pick a date"}</span>
              <ChevronDown aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            side="bottom"
            sideOffset={8}
            collisionPadding={12}
            className="w-auto border-0! bg-transparent p-0 shadow-none"
          >
            <Calendar
              mode="single"
              selected={date}
              defaultMonth={date}
              // oxlint-disable-next-line jsx-a11y/no-autofocus -- Focus the active day only inside this user-opened popup.
              autoFocus
              onSelect={(selectedDate) => {
                setDate(selectedDate);
                if (selectedDate) setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
        <p id={`${id}-hint`} className="text-xs leading-5 text-foreground/70">
          Choose a date. Use the arrow keys to move between days.
        </p>
      </div>
      <div className="mt-4 flex min-h-9 items-center justify-between gap-3 border-t border-border pt-3">
        <output className="text-xs text-foreground/80">
          {date ? `Selected: ${format(date, "PPP")}` : "No date selected"}
        </output>
        <Button
          size="sm"
          variant="ghost"
          disabled={!date}
          onClick={() => {
            setDate(undefined);
            trigger.current?.focus();
          }}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
