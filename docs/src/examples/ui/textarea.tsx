import { Textarea } from "@/components/ui/textarea";

export default function TextareaDemo() {
  return (
    <div className="grid w-full max-w-md gap-2">
      <label htmlFor="release-notes" className="text-sm font-heading leading-none select-none">
        Release notes
      </label>
      <Textarea
        id="release-notes"
        name="releaseNotes"
        rows={4}
        maxLength={280}
        placeholder="Summarize what changed in this release."
        aria-describedby="release-notes-help"
      />
      <p id="release-notes-help" className="text-sm text-foreground/70">
        Keep the summary concise and describe user-visible changes.
      </p>
    </div>
  );
}
