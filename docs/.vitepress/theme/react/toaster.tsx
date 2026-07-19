import { useEffect, useState, type CSSProperties } from "react";
import { Toaster, type ToasterProps } from "sonner";

function getDocumentTheme(): NonNullable<ToasterProps["theme"]> {
  if (typeof document === "undefined") return "light";

  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function BridgeToaster() {
  const [theme, setTheme] = useState<NonNullable<ToasterProps["theme"]>>(getDocumentTheme);

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => setTheme(getDocumentTheme()));

    observer.observe(root, {
      attributeFilter: ["class"],
      attributes: true,
    });

    return () => observer.disconnect();
  }, []);

  return (
    <Toaster
      className="toaster group"
      theme={theme}
      style={
        {
          fontFamily: "inherit",
          overflowWrap: "anywhere",
        } as CSSProperties
      }
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "bg-background text-foreground border-border border-2 font-heading shadow-shadow rounded-base text-[13px] flex items-center gap-2.5 p-4 w-[356px] [&:has(button)]:justify-between",
          description: "font-base",
          actionButton:
            "font-base border-2 text-[12px] h-6 px-2 bg-main text-main-foreground border-border rounded-base shrink-0",
          cancelButton:
            "font-base border-2 text-[12px] h-6 px-2 bg-secondary-background text-foreground border-border rounded-base shrink-0",
          error: "bg-black text-white",
        },
      }}
    />
  );
}
