"use client";

import { Copy, ExternalLink, FolderInput, Pin, Trash2 } from "lucide-react";
import { useState } from "react";

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export default function ContextMenuDemo() {
  const [pinned, setPinned] = useState(true);
  const [visibility, setVisibility] = useState("team");

  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={<button type="button" aria-label="Open component card context menu" />}
        aria-haspopup="menu"
        className="flex min-h-44 w-full max-w-sm flex-col items-start justify-between rounded-base border-2 border-border bg-secondary-background p-5 text-left shadow-shadow focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <span className="rounded-base border-2 border-border bg-main px-2 py-1 text-xs font-heading uppercase tracking-wide text-main-foreground">
          Component
        </span>
        <span>
          <strong className="block text-xl font-heading">Dialog</strong>
          <span className="mt-2 block text-sm leading-6 text-foreground/75">
            Right-click or press Shift+F10 for registry actions.
          </span>
        </span>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem>
          <ExternalLink aria-hidden="true" />
          Open documentation
          <ContextMenuShortcut>Enter</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <Copy aria-hidden="true" />
          Copy install command
          <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <FolderInput aria-hidden="true" />
            Move to collection
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>Forms</ContextMenuItem>
            <ContextMenuItem>Overlays</ContextMenuItem>
            <ContextMenuItem>Navigation</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem
          checked={pinned}
          onCheckedChange={(checked) => setPinned(checked === true)}
        >
          <Pin aria-hidden="true" />
          Pin to workspace
        </ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuLabel inset>Visibility</ContextMenuLabel>
        <ContextMenuRadioGroup value={visibility} onValueChange={setVisibility}>
          <ContextMenuRadioItem value="private">Private</ContextMenuRadioItem>
          <ContextMenuRadioItem value="team">Team</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">
          <Trash2 aria-hidden="true" />
          Remove from collection
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
