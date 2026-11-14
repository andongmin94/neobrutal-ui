import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AvatarDemo() {
  return (
    <div className="flex items-center gap-6">
      {(
        [
          { size: "sm", label: "Small" },
          { size: "default", label: "Default" },
          { size: "lg", label: "Large" },
        ] as const
      ).map(({ size, label }) => (
        <div key={size} className="grid justify-items-center gap-3">
          <Avatar size={size}>
            <AvatarImage src="/avatar-placeholder.svg" alt="John Doe" />
            <AvatarFallback>
              <span aria-hidden="true">JD</span>
              <span className="sr-only">John Doe</span>
            </AvatarFallback>
            <AvatarBadge>
              <span className="sr-only">Online</span>
            </AvatarBadge>
          </Avatar>
          <span className="text-xs font-base">{label}</span>
        </div>
      ))}
    </div>
  );
}
