"use client";

import { Combobox } from "@base-ui/react/combobox";
import { CheckIcon, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";

const frameworks = ["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"];

export default function ComboboxWithCheckbox() {
  return (
    <Combobox.Root items={frameworks} multiple autoHighlight>
      <Combobox.Trigger
        aria-label="Select frameworks"
        render={<Button variant="noShadow" className="w-full max-w-[300px] justify-between" />}
      >
        <span className="min-w-0 truncate">
          <Combobox.Value>
            {(values: string[]) => values.join(", ") || "Select frameworks (multi-select)..."}
          </Combobox.Value>
        </span>
        <ChevronsUpDown aria-hidden="true" />
      </Combobox.Trigger>
      <Combobox.Portal>
        <Combobox.Positioner align="start" sideOffset={4} className="isolate z-50">
          <Combobox.Popup
            data-slot="combobox-popup"
            aria-label="Choose frameworks"
            className="max-h-(--available-height) w-[300px] max-w-(--available-width) overflow-y-auto rounded-base border-2 border-border bg-main text-main-foreground outline-none"
          >
            <Combobox.Input
              aria-label="Search frameworks"
              placeholder="Search framework..."
              className="h-11 w-full border-0 border-b-2 border-main-foreground bg-transparent px-3 text-sm font-base text-main-foreground outline-none placeholder:text-main-foreground"
            />
            <Combobox.Empty className="py-6 text-center text-sm">
              No framework found.
            </Combobox.Empty>
            <Combobox.List aria-label="Frameworks" className="grid gap-1 p-2 empty:p-0">
              {(framework: string) => (
                <Combobox.Item
                  key={framework}
                  value={framework}
                  className="relative flex cursor-default items-center gap-2 rounded-base px-2 py-2 text-sm font-base outline-none select-none data-highlighted:outline-2 data-highlighted:outline-solid data-highlighted:-outline-offset-4 data-highlighted:outline-current"
                >
                  <span
                    data-slot="combobox-selection-mark"
                    aria-hidden="true"
                    className="grid size-5 shrink-0 place-content-center rounded-base border-2 border-current"
                  >
                    <Combobox.ItemIndicator>
                      <CheckIcon className="size-4" />
                    </Combobox.ItemIndicator>
                  </span>
                  {framework}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
