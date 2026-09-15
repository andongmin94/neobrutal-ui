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
            <MenubarCheckboxItem checked>Show component previews</MenubarCheckboxItem>
            <MenubarCheckboxItem checked>Show accessibility notes</MenubarCheckboxItem>
            <MenubarCheckboxItem>Compact navigation</MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Environment</MenubarTrigger>
          <MenubarContent>
            <MenubarRadioGroup value="preview">
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
