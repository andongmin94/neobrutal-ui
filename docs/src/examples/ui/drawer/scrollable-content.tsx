import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const reviewNotes = [
  "Review the summary, owner, and due date before sharing this workspace with the team.",
  "Confirm that keyboard navigation, empty states, and narrow-screen layouts are in the release checklist.",
  "Record unresolved decisions next to the component they affect so the next review starts with context.",
];

export default function DrawerWithScrollableContent() {
  return (
    <Drawer direction="right">
      <DrawerTrigger render={<Button />}>Scrollable Content</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Project review notes</DrawerTitle>
          <DrawerDescription>
            Check how long-form content scrolls inside a right-side drawer.
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 text-sm">
          {Array.from({ length: 9 }, (_, index) => (
            <p key={index} className="mb-4 leading-normal">
              {reviewNotes[index % reviewNotes.length]}
            </p>
          ))}
        </div>
        <DrawerFooter>
          <DrawerClose render={<Button />}>Close review</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
