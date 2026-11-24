import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function BreadcrumbDemo() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbSeparator />
          <DropdownMenu>
            <DropdownMenuTrigger
              className="grid size-10 place-items-center"
              aria-label="Show intermediate pages"
            >
              <BreadcrumbEllipsis className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem render={<a href="/docs" />}>Documentation</DropdownMenuItem>
              <DropdownMenuItem render={<a href="/docs/design-tokens" />}>
                Design tokens
              </DropdownMenuItem>
              <DropdownMenuItem render={<a href="/docs/installation" />}>
                Installation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbLink href="/docs/">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
