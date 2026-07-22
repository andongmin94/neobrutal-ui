import { Metadata } from "next";

import TEMPLATES from "@/data/templates";

import { PageDescription, PageHeading } from "@/components/app/page";
import TemplateCatalog from "@/components/app/template-catalog";

export const metadata: Metadata = {
  title: "neobrutal-ui Templates",
  description: "Installable Base UI templates built from the neobrutal-ui registry.",
};

export default function Page() {
  return (
    <main
      className="min-h-dvh bg-background pt-[70px] text-foreground"
      style={{
        backgroundImage:
          "linear-gradient(to right, color-mix(in srgb, var(--foreground) 13%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--foreground) 13%, transparent) 1px, transparent 1px)",
        backgroundSize: "70px 70px",
      }}
    >
      <div className="mx-auto w-[1300px] max-w-full px-5 py-10 sm:py-14">
        <header className="mx-auto mb-10 max-w-4xl text-center">
          <PageHeading className="text-center">Templates</PageHeading>

          <PageDescription className="mx-auto mt-4 text-center">
            Four focused starting points. Open a preview or copy the install command.
          </PageDescription>
        </header>

        <TemplateCatalog items={TEMPLATES} />
      </div>
    </main>
  );
}
