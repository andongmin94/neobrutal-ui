import { BookOpen, Copy, FileJson, Palette, Plus, Settings, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DropdownMenuDemo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="noShadow" />}>
        Registry actions
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        <DropdownMenuLabel>neobrutal-ui</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BookOpen aria-hidden="true" />
            Open documentation
            <DropdownMenuShortcut>Ctrl+D</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Copy aria-hidden="true" />
            Copy install command
            <DropdownMenuShortcut>Ctrl+C</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <FileJson aria-hidden="true" />
            Inspect registry JSON
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette aria-hidden="true" />
            Apply theme
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Yellow</DropdownMenuItem>
              <DropdownMenuItem>Blue</DropdownMenuItem>
              <DropdownMenuItem>Rose</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuItem>
          <Plus aria-hidden="true" />
          Add to collection
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Settings aria-hidden="true" />
          Registry settings
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <UploadCloud aria-hidden="true" />
          Publish release
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
