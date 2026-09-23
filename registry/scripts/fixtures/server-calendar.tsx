import { Calendar } from "@/components/ui/calendar";

export const metadata = { title: "Server calendar verification" };

export default function ServerCalendarPage() {
  return (
    <main className="mx-auto grid w-full max-w-lg justify-items-start gap-6 p-6">
      <h1 className="text-2xl font-heading">Server-rendered calendar</h1>
      <Calendar mode="single" defaultMonth={new Date(2026, 8, 1)} />
    </main>
  );
}
