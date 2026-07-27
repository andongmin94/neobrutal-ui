import components from "@/data/components";
import { STARS_EXAMPLES } from "@/data/stars";

import { cn, transformToSlug } from "@/lib/utils";

import { sharedComponents } from "./mdx-components";

export default function ComponentPreview({
  component,
  children,
  example,
  type = "component",
  wrapperClassName,
}: {
  component: string;
  children: React.ReactNode;
  example?: string;
  type?: "star" | "component";
  wrapperClassName?: string;
}) {
  const { Tabs, TabsList, TabsTrigger, TabsContent } = sharedComponents;

  let ExampleComponent: React.ComponentType | undefined;

  if (type === "star") {
    const starData = STARS_EXAMPLES[component as keyof typeof STARS_EXAMPLES];
    if (!starData) return null;

    ExampleComponent = starData;
  } else {
    const componentData = components.find((c) => transformToSlug(c.name) === component);

    if (!componentData) return null;

    if (type === "component") {
      ExampleComponent = example
        ? componentData.examples?.[example]
        : componentData.exampleComponent;
    }
  }

  if (!ExampleComponent) return null;

  const isPrimaryPreview = type === "component" && !example;

  return (
    <Tabs
      defaultValue="preview"
      className={cn(
        "not-prose w-full border-2 border-border bg-secondary-background shadow-shadow",
        isPrimaryPreview ? "mb-10" : "mb-6",
      )}
    >
      {isPrimaryPreview ? (
        <div className="flex flex-col border-b-2 border-border bg-secondary-background sm:flex-row sm:items-stretch">
          <div className="flex min-h-12 min-w-0 flex-1 items-center gap-3 px-4 py-3 sm:px-5">
            <span aria-hidden="true" className="size-3 shrink-0 border-2 border-border bg-main" />
            <span className="truncate font-heading text-sm sm:text-base">Live preview</span>
          </div>
          <TabsList
            aria-label={`${component} preview`}
            className="grid h-12 w-full grid-cols-2 border-0 border-t-2 border-border sm:h-auto sm:w-56 sm:border-t-0 sm:border-l-2"
          >
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
        </div>
      ) : (
        <TabsList
          aria-label={`${component} example`}
          className="grid w-full grid-cols-2 border-0 border-b-2 border-border"
        >
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
      )}
      <TabsContent value="preview">
        <div
          className={cn(
            "relative isolate flex w-full items-center justify-center overflow-visible bg-background",
            "before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] before:bg-[size:40px_40px] before:opacity-10 before:content-['']",
            isPrimaryPreview
              ? "min-h-[360px] px-5 py-14 sm:min-h-[440px] sm:px-12 sm:py-20"
              : "min-h-[180px] px-4 py-8 sm:min-h-[220px] sm:px-8 sm:py-10",
            wrapperClassName,
          )}
        >
          <ExampleComponent />
        </div>
      </TabsContent>
      <TabsContent
        value="code"
        className={cn(
          "bg-secondary-background [&_[data-slot=pre-wrapper]]:shadow-none [&_[data-slot=pre-wrapper]>pre]:border-0",
          isPrimaryPreview &&
            "[&_[data-slot=pre-wrapper]>pre]:min-h-[360px] [&_[data-slot=pre-wrapper]>pre]:max-h-[520px] sm:[&_[data-slot=pre-wrapper]>pre]:min-h-[440px]",
        )}
      >
        {children}
      </TabsContent>
    </Tabs>
  );
}
