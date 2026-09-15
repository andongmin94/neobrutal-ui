import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const SHEET_SIDES = ["top", "right", "bottom", "left"] as const;
const reviewNotes = [
  "Review the summary, owner, and due date before sharing this workspace with the team.",
  "Confirm that keyboard navigation, empty states, and narrow-screen layouts are in the release checklist.",
  "Record unresolved decisions next to the component they affect so the next review starts with context.",
];

export default function SheetDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      {SHEET_SIDES.map((side) => (
        <Sheet key={side}>
          <SheetTrigger render={<Button variant="noShadow" className="capitalize" />}>
            {side} sheet
          </SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle className="capitalize">{side} panel review</SheetTitle>
              <SheetDescription>
                Review how the panel enters from the {side} edge and handles long content.
              </SheetDescription>
            </SheetHeader>
            <div className="overflow-y-auto px-4 text-sm">
              <h4 className="mb-4 text-lg leading-none font-medium">Project review notes</h4>
              {Array.from({ length: 9 }, (_, index) => (
                <p key={index} className="mb-4 leading-normal">
                  {reviewNotes[index % reviewNotes.length]}
                </p>
              ))}
            </div>
            <SheetFooter>
              <SheetClose render={<Button />}>Close panel</SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  );
}
