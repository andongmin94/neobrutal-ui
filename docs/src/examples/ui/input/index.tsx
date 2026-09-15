import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function InputDemo() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="invite-email">Invite by email</Label>
      <Input
        id="invite-email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="name@example.com"
        aria-describedby="invite-email-help"
      />
      <p id="invite-email-help" className="text-sm text-foreground/70">
        An invitation is sent only after the form is submitted.
      </p>
    </div>
  );
}
