"use client";

import { useState } from "react";

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";

export default function MenubarDemo() {
  const [showPreviews, setShowPreviews] = useState(true);
  const [showNotes, setShowNotes] = useState(true);
  const [compactNavigation, setCompactNavigation] = useState(false);
  const [environment, setEnvironment] = useState("preview");

  return (
    <div className="w-full overflow-x-auto p-1">
      <Menubar className="w-max min-w-full">
        <MenubarMenu>
          <MenubarTrigger>Project</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              New component <MenubarShortcut>Ctrl+N</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>Open registry</MenubarItem>
            <MenubarSub>
              <MenubarSubTrigger>Export</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Registry JSON</MenubarItem>
                <MenubarItem>Theme CSS</MenubarItem>
                <MenubarItem>Documentation snapshot</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem disabled>Publish release</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem
              checked={showPreviews}
              onCheckedChange={(checked) => setShowPreviews(checked === true)}
            >
              Show component previews
            </MenubarCheckboxItem>
            <MenubarCheckboxItem
              checked={showNotes}
              onCheckedChange={(checked) => setShowNotes(checked === true)}
            >
              Show accessibility notes
            </MenubarCheckboxItem>
            <MenubarCheckboxItem
              checked={compactNavigation}
              onCheckedChange={(checked) => setCompactNavigation(checked === true)}
            >
              Compact navigation
            </MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Environment</MenubarTrigger>
          <MenubarContent>
            <MenubarRadioGroup value={environment} onValueChange={setEnvironment}>
              <MenubarRadioItem value="local">Local</MenubarRadioItem>
              <MenubarRadioItem value="preview">Preview</MenubarRadioItem>
              <MenubarRadioItem value="production">Production</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  );
}
