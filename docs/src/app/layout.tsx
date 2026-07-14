import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";

import "@/styling/globals.css";

import type { Metadata } from "next";

import Navbar from "@/components/app/navbar";
import ScrollToTop from "@/components/app/scroll-to-top";
import SetStylingPref from "@/components/app/set-styling-pref";
import { ThemeProvider } from "@/components/app/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const docsBaseUrl = process.env.NEXT_PUBLIC_DOCS_BASE_URL || "https://neobrutal-ui.andongmin.com";

export const metadata: Metadata = {
  title: {
    default: "neobrutal-ui - Modern neobrutalist components for shadcn/ui",
    template: `%s - neobrutal-ui`,
  },
  description: "A collection of neobrutalism-styled components based on shadcn/ui.",
  keywords: [
    "neobrutalism",
    "neobrutalism components",
    "neobrutalism tailwind",
    "react neobrutalism",
    "react tailwind components",
    "shadcn components",
    "shadcn neobrutalism",
  ],
  authors: [{ name: "andongmin94", url: "https://github.com/andongmin94" }],
  openGraph: {
    type: "website",
    description: "A collection of neobrutalism-styled components based on shadcn/ui.",
    images: [`${docsBaseUrl}/preview.png`],
    url: docsBaseUrl,
    title: "neobrutal-ui",
  },
  metadataBase: new URL(docsBaseUrl),
  twitter: {
    card: "summary_large_image",
    title: "neobrutal-ui - Modern neobrutalist components",
    description: "A collection of neobrutalism-styled components based on shadcn/ui.",
    images: [`${docsBaseUrl}/preview.png`],
    creator: "@andongmin94",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className="scroll-smooth" suppressHydrationWarning lang="en">
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <div data-site-navbar>
            <Navbar />
          </div>
          {children}
          <SetStylingPref />
          <ScrollToTop />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
