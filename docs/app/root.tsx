import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { ReactRouterProvider } from "fumadocs-core/framework/react-router";

import type { Route } from "./+types/root";
import { BridgeToaster } from "~/components/toaster";
import NotFound from "~/routes/not-found";

import "./app.css";

const themeScript = `
(() => {
  const current = localStorage.getItem("neobrutal-ui-theme")
    ?? localStorage.getItem("vitepress-theme-appearance");
  const theme = current === "light" || current === "dark"
    ? current
    : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
})();
`;

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.ico" },
  { rel: "preload", href: "/preview.png", as: "image" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffcc00" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Meta />
        <Links />
      </head>
      <body>
        <ReactRouterProvider>{children}</ReactRouterProvider>
        <BridgeToaster />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFound />;
  }

  const message =
    error instanceof Error ? error.message : isRouteErrorResponse(error) ? error.statusText : "";

  return (
    <main className="special-main" id="main-content" tabIndex={-1}>
      <div className="directory-empty">
        <h1>Something went wrong</h1>
        <p>{message || "The page could not be rendered."}</p>
        <a className="pressable" href="/">
          Return to the directory
        </a>
      </div>
    </main>
  );
}
