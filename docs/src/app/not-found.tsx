import { ArrowUpRight } from "lucide-react";

import Link from "next/link";

import { raisedPress } from "@/lib/raised-press";

export default function NotFound() {
  return (
    <div className="text-foreground max-h-[100dvh] h-[100dvh] portrait:max-h-[100dvh] portrait:h-[100dvh] w-full flex items-center justify-center bg-background prose-headings:font-heading prose-h1:md:text-5xl prose-h1:text-3xl">
      <div className="flex flex-col items-center text-center max-w-(--breakpoint-xl) px-5">
        <h1 className="leading-normal">404 Not Found</h1>

        <p className="leading-snug font-base sm:mt-[30px] sm:mb-[40px] my-9 2xl:text-3xl xl:text-2xl lg:text-2xl w-full md:text-2xl sm:text-xl text-xl">
          Could not find requested resource.
        </p>

        <Link
          className={`flex w-max items-center gap-2.5 rounded-base border-2 border-border bg-main px-4 py-2 font-base text-base text-main-foreground shadow-shadow md:px-10 md:py-3 md:text-[22px] ${raisedPress}`}
          href={"/"}
        >
          Return home
          <ArrowUpRight className="md:size-[30px] size-5" />
        </Link>
      </div>
    </div>
  );
}
