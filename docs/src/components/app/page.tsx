import { cn } from "@/lib/utils";

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-background pt-[70px] text-foreground prose-h4:text-lg prose-h4:lg:text-xl prose-h4:xl:text-2xl">
      <div className="mx-auto w-[1540px] max-w-full px-5 py-10 text-left sm:py-14">{children}</div>
    </div>
  );
}

function PageHeading({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h1 className={cn("text-left font-heading text-4xl sm:text-5xl", className)} {...props} />;
}

function PageHeader({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-5 border-b-2 border-border bg-main p-6 text-main-foreground sm:p-8",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function PageDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("max-w-3xl text-left font-base text-base leading-7 sm:text-lg", className)}
      {...props}
    />
  );
}

function PageActions({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex w-full items-center justify-start gap-2 pt-2", className)}
      {...props}
    />
  );
}

export { PageWrapper, PageActions, PageDescription, PageHeading, PageHeader };
