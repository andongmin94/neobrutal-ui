import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AvatarDemo() {
  return (
    <Avatar>
      <AvatarImage src="https://github.com/andongmin94.png?size=80" alt="@andongmin94" />
      <AvatarFallback>AM</AvatarFallback>
    </Avatar>
  );
}
