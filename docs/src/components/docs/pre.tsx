import { Children, isValidElement, type ReactNode, type ComponentProps } from "react";
import { CopyButton } from "./copy-button";

type PreProps = ComponentProps<"pre"> & { __rawstring__?: string; wrapperClassName?: string };
function textContent(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") return String(child);
      return isValidElement<{ children?: ReactNode }>(child)
        ? textContent(child.props.children)
        : "";
    })
    .join("");
}
export function Pre({ children, __rawstring__, wrapperClassName, className, ...props }: PreProps) {
  return (
    <div
      data-slot="pre-wrapper"
      className={["docs-code", wrapperClassName].filter(Boolean).join(" ")}
    >
      <CopyButton text={__rawstring__ ?? textContent(children)} />
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Keyboard users need focus to scroll overflowing code. */}
      <pre tabIndex={0} className={className} {...props}>
        {children}
      </pre>
    </div>
  );
}
