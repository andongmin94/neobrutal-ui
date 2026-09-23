import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const reviewNotes = [
  "Review the summary, owner, and due date before sharing this workspace with the team.",
  "Confirm that keyboard navigation, empty states, and narrow-screen layouts are in the release checklist.",
  "Record unresolved decisions next to the component they affect so the next review starts with context.",
];

export default function DialogWithStickyFooter() {
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>Sticky Footer</DialogTrigger>
      <DialogContent className="flex flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>Review checklist</DialogTitle>
          <DialogDescription>
            Scroll through the notes while the close action remains available.
          </DialogDescription>
        </DialogHeader>
        <div className="-mx-6 min-h-0 max-h-[500px] overflow-y-auto px-6 text-sm">
          <h4 className="mb-4 text-lg leading-none font-medium">Project review notes</h4>
          {Array.from({ length: 9 }, (_, index) => (
            <p key={index} className="mb-4 leading-normal">
              {reviewNotes[index % reviewNotes.length]}
            </p>
          ))}
        </div>
        <DialogFooter className="shrink-0">
          <DialogClose render={<Button />}>Close review</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
