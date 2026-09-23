import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";

// Exporting metadata makes converting this fixture into a Client Component an error.
export const metadata = { title: "Server input group verification" };

export default function ServerInputGroupPage() {
  return (
    <main className="mx-auto grid w-full max-w-lg gap-6 p-6">
      <h1 className="text-2xl font-heading">Server-rendered input groups</h1>
      <form action="/server-input-group" className="grid gap-4">
        <label htmlFor="server-search">Search documentation</label>
        <InputGroup>
          <InputGroupAddon data-testid="server-search-addon">
            <InputGroupText>Query</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput id="server-search" name="q" defaultValue="Registry" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton>Keep search value</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <label htmlFor="server-notes">Notes</label>
        <InputGroup>
          <InputGroupTextarea id="server-notes" name="notes" defaultValue="Server composition" />
          <InputGroupAddon align="block-end" data-testid="server-notes-addon">
            <InputGroupText>Review notes</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </main>
  );
}
