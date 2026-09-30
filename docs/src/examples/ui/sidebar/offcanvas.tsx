import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function OffcanvasSidebar() {
  return (
    <SidebarProvider defaultOpen={false} className="relative isolate min-h-64 overflow-hidden">
      <Sidebar className="md:absolute md:h-full">
        <SidebarContent>
          <nav aria-label="Offcanvas navigation" className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton render={<a href="/docs">Documentation</a>} />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton render={<a href="/docs/installation">Installation</a>} />
              </SidebarMenuItem>
            </SidebarMenu>
          </nav>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <div className="flex flex-1 flex-col items-start gap-4 p-4">
        <SidebarTrigger />
        <p>Open the navigation, then collapse it to return to the workspace.</p>
        <Button variant="neutral">Continue working</Button>
      </div>
    </SidebarProvider>
  );
}
