import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Server badge verification" };

export default function ServerBadgePage() {
  return (
    <main className="grid gap-4 p-6">
      <h1 className="text-2xl font-heading">Server-rendered badges</h1>
      <Badge>Published</Badge>
      <Badge
        style={{ letterSpacing: "0.5px" }}
        render={
          <a href="/" style={{ fontWeight: 700 }}>
            Read the guide
          </a>
        }
      />
    </main>
  );
}
