import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonDemo() {
  return (
    <section aria-busy="true" aria-label="Profile">
      <output className="sr-only">Loading profile.</output>
      <div aria-hidden="true" className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 sm:w-[250px] w-[100px]" />
          <Skeleton className="h-4 sm:w-[200px] w-[100px]" />
        </div>
      </div>
    </section>
  );
}
