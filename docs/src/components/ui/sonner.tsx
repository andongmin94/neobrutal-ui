"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          fontFamily: "inherit",
          overflowWrap: "anywhere",
        } as React.CSSProperties
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
          loading:
            "[&[data-sonner-toast]_[data-icon]]:flex [&[data-sonner-toast]_[data-icon]]:size-4 [&[data-sonner-toast]_[data-icon]]:relative [&[data-sonner-toast]_[data-icon]]:justify-start [&[data-sonner-toast]_[data-icon]]:items-center [&[data-sonner-toast]_[data-icon]]:flex-shrink-0",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
