import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

export default function CommandDemo() {
  return (
    <Command>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList className="max-h-[9999px] min-h-[565px] overflow-y-hidden">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem className="outline-2" value="Calendar">
            Calendar
          </CommandItem>
          <CommandItem value="Search Emoji">Search Emoji</CommandItem>
          <CommandItem value="Calculator">Calculator</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem value="Profile">Profile</CommandItem>
          <CommandItem value="Billing">Billing</CommandItem>
          <CommandItem value="Settings">Settings</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
