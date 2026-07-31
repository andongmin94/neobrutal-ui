export type NavigationLink = {
  href: string;
  text: string;
};

export const PRIMARY_NAVIGATION_LINKS = [
  { href: "/docs", text: "Docs" },
  { href: "/styling", text: "Styling" },
  { href: "/charts", text: "Charts" },
  { href: "/stars", text: "Stars" },
  { href: "/templates", text: "Templates" },
] as const satisfies readonly NavigationLink[];

export const SITE_NAVIGATION_LINKS = [
  { href: "/", text: "Component directory" },
  ...PRIMARY_NAVIGATION_LINKS,
] as const satisfies readonly NavigationLink[];

export function normalizePath(path: string) {
  return path.replace(/\/+$/, "") || "/";
}

export function isNavigationPathActive(
  currentPath: string,
  targetPath: string,
  includeDescendants = false,
) {
  const current = normalizePath(currentPath);
  const target = normalizePath(targetPath);

  if (current === target) return true;
  return includeDescendants && target !== "/" && current.startsWith(`${target}/`);
}
