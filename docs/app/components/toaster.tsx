import { useEffect, useState } from "react";
import type { ToasterProps } from "sonner";

import { Toaster } from "@/components/ui/sonner";

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

  return <Toaster theme={theme} />;
}
