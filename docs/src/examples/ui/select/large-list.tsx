import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const teams = ["Design", "Engineering", "Research", "Operations"];
const workspaces = Array.from({ length: 80 }, (_, index) => {
  const number = String(Math.floor(index / teams.length) + 1).padStart(2, "0");
  const team = teams[index % teams.length];
  return {
    value: `${team.toLowerCase()}-${number}`,
    label: `${team} workspace ${number}`,
  };
});

export default function SelectDemo() {
  return (
    <Select>
      <SelectTrigger className="w-full max-w-[260px]" aria-label="Select a workspace">
        <SelectValue placeholder="Choose a workspace" />
      </SelectTrigger>
      <SelectContent>
        {workspaces.map((workspace) => (
          <SelectItem key={workspace.value} value={workspace.value}>
            {workspace.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
