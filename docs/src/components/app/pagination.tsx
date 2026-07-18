import { ArrowLeft, ArrowRight } from "lucide-react";

import Link from "next/link";

import { Button } from "@/components/ui/button";

type Props = {
  prev?: {
    name: string;
    path: string;
  };
  next?: {
    name: string;
    path: string;
  };
};

export default function Pagination({ prev, next }: Props) {
  let justifyContent;

  if (prev && next) {
    justifyContent = "justify-between";
  } else if (prev) {
    justifyContent = "justify-start";
  } else if (next) {
    justifyContent = "justify-end";
  }

  return (
    <div className={`${justifyContent} flex w-full items-center`}>
      {prev?.name && (
        <Button
          asChild
          className="h-[unset] px-3.5 py-2 text-xs sm:px-5 sm:text-sm"
          nativeButton={false}
        >
          <Link href={prev.path}>
            <ArrowLeft />
            {prev.name}
          </Link>
        </Button>
      )}

      {next?.name && (
        <Button
          asChild
          className="h-[unset] px-3.5 py-2 text-xs sm:px-5 sm:text-sm"
          nativeButton={false}
        >
          <Link href={next.path}>
            {next.name}
            <ArrowRight />
          </Link>
        </Button>
      )}
    </div>
  );
}
