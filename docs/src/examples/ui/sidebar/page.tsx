import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { AppSidebar } from "./_sidebar";

const metrics = [
  { label: "Components", value: "49", detail: "Documented and installable" },
  { label: "Themes", value: "17", detail: "Light and dark presets" },
  { label: "Templates", value: "4", detail: "Ready for the App Router" },
];

const activity = [
  { title: "Button reference updated", detail: "Variants, sizes, and navigation guidance" },
  { title: "Sidebar install verified", detail: "Component source and mobile hook included" },
  { title: "Theme export checked", detail: "Registry tokens match the customizer output" },
];

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b-2 border-border transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex min-w-0 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/docs">Documentation</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Registry overview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <section aria-labelledby="sidebar-overview-heading">
            <div className="mb-4">
              <p className="text-sm font-base text-foreground/70">Workspace</p>
              <h2 id="sidebar-overview-heading" className="text-2xl font-heading">
                Registry overview
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {metrics.map((metric) => (
                <article
                  key={metric.label}
                  className="rounded-base border-2 border-border bg-background p-4 shadow-shadow"
                >
                  <p className="text-sm font-base text-foreground/70">{metric.label}</p>
                  <p className="mt-2 text-3xl font-heading">{metric.value}</p>
                  <p className="mt-2 text-sm leading-6">{metric.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="sidebar-activity-heading"
            className="rounded-base border-2 border-border bg-background p-4 shadow-shadow"
          >
            <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-border pb-4">
              <div>
                <p className="text-sm font-base text-foreground/70">Review queue</p>
                <h2 id="sidebar-activity-heading" className="text-xl font-heading">
                  Recent documentation work
                </h2>
              </div>
              <a className="font-heading underline underline-offset-4" href="/docs/installation">
                Installation guide
              </a>
            </div>
            <ul className="divide-y-2 divide-border">
              {activity.map((item) => (
                <li key={item.title} className="grid gap-1 py-4 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <div>
                    <h3 className="font-heading">{item.title}</h3>
                    <p className="text-sm leading-6 text-foreground/75">{item.detail}</p>
                  </div>
                  <span className="mt-1 text-sm font-heading sm:mt-0">Ready</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
