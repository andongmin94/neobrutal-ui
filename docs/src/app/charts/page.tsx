import { Metadata } from "next";
import Link from "next/link";

import { PageDescription, PageHeader, PageHeading, PageWrapper } from "@/components/app/page";

import Examples from "./examples";

export const metadata: Metadata = {
  title: "Registry Charts",
  description: "Chart recipes for registry activity, catalog coverage, and install performance.",
};

export default function Page() {
  return (
    <PageWrapper>
      <PageHeader className="gap-0 p-0 sm:p-0">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(280px,0.8fr)_minmax(420px,1.2fr)] lg:items-end">
          <PageHeading>Registry charts.</PageHeading>

          <PageDescription>
            Operational examples for releases, component coverage, build speed, and install timing.
            Each recipe is built with Recharts and the neobrutal-ui chart primitive. <br />
            Read the{" "}
            <Link className="underline" href="/docs/chart">
              chart API
            </Link>{" "}
            before adapting a recipe to your own data.
          </PageDescription>
        </div>

        <div className="grid grid-cols-2 border-t-2 border-border sm:grid-cols-3">
          <div className="flex items-baseline gap-2 border-r-2 border-border px-6 py-4 sm:px-8">
            <strong className="font-heading text-xl">47</strong>
            <span className="font-mono text-xs font-bold uppercase">recipes</span>
          </div>
          <div className="flex items-baseline gap-2 px-6 py-4 sm:px-8">
            <strong className="font-heading text-xl">6</strong>
            <span className="font-mono text-xs font-bold uppercase">data stories</span>
          </div>
          <div className="col-span-2 flex items-center border-t-2 border-border px-6 py-4 sm:col-span-1 sm:border-l-2 sm:border-t-0 sm:px-8">
            <strong className="font-heading text-base">Recharts + Base UI</strong>
          </div>
        </div>
      </PageHeader>

      <Examples />
    </PageWrapper>
  );
}
