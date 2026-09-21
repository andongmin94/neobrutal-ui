import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AvatarDemo() {
  return (
    <Avatar>
      <AvatarImage src="/avatar-placeholder.svg" alt="John Doe" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  );
}
