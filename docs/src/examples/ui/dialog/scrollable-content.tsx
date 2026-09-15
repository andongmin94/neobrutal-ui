import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const reviewNotes = [
  "Review the summary, owner, and due date before sharing this workspace with the team.",
  "Confirm that keyboard navigation, empty states, and narrow-screen layouts are in the release checklist.",
  "Record unresolved decisions next to the component they affect so the next review starts with context.",
];

export default function DialogWithScrollableContent() {
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>Scrollable Content</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Project review notes</DialogTitle>
          <DialogDescription>
            Check how long-form content scrolls inside the modal surface.
          </DialogDescription>
        </DialogHeader>
        <div className="-mx-6 max-h-[500px] overflow-y-auto px-6 text-sm">
          {Array.from({ length: 9 }, (_, index) => (
            <p key={index} className="mb-4 leading-normal">
              {reviewNotes[index % reviewNotes.length]}
            </p>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
