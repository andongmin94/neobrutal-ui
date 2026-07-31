import type { MDXComponents } from "mdx/types";
import { type ComponentProps, type ComponentType, type HTMLAttributes } from "react";
import { Link as RouterLink } from "react-router";

import { Pre } from "@/components/docs/pre";
import { ComponentPreview } from "./component-preview";
import { Installation } from "./installation";
import { SpecialPage } from "./special-page";

function MdxLink({ children, href = "", ...props }: ComponentProps<"a">) {
  if (href.startsWith("/") && !props.target) {
    return (
      <RouterLink to={href} {...props}>
        {children}
      </RouterLink>
    );
  }

  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}

function Heading({
  as: Tag,
  children,
  id,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & {
  as: ComponentType<HTMLAttributes<HTMLHeadingElement>>;
}) {
  return (
    <Tag id={id} {...props}>
      {id && (
        <a className="header-anchor" href={`#${id}`} aria-label={`Link to ${id}`}>
          #
        </a>
      )}
      {children}
    </Tag>
  );
}

function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="md-table-shell">
      <table className={["md-table", className].filter(Boolean).join(" ")} {...props} />
    </div>
  );
}

function TableHeader(props: ComponentProps<"thead">) {
  return <thead {...props} />;
}

function TableBody(props: ComponentProps<"tbody">) {
  return <tbody {...props} />;
}

function TableFooter(props: ComponentProps<"tfoot">) {
  return <tfoot {...props} />;
}

function TableRow(props: ComponentProps<"tr">) {
  return <tr {...props} />;
}

function TableHead(props: ComponentProps<"th">) {
  return <th {...props} />;
}

function TableCell(props: ComponentProps<"td">) {
  return <td {...props} />;
}

function TableCaption(props: ComponentProps<"caption">) {
  return <caption {...props} />;
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    a: MdxLink,
    h1: (props) => <Heading as="h1" {...props} />,
    h2: (props) => <Heading as="h2" {...props} />,
    h3: (props) => <Heading as="h3" {...props} />,
    pre: Pre,
    table: Table,
    ComponentPreview,
    Installation,
    Link: MdxLink,
    SpecialPage,
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
