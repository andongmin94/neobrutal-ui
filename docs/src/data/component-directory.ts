export const COMPONENT_CATEGORIES = [
  "All",
  "Actions",
  "Forms",
  "Navigation",
  "Overlays",
  "Feedback",
  "Disclosure",
  "Data display",
  "Layout",
] as const;

export type ComponentCategory = (typeof COMPONENT_CATEGORIES)[number];
export type ComponentGroup = Exclude<ComponentCategory, "All">;
export type ComponentInstallMode = "Recipe" | "Registry";

const componentCategoryBySlug: Record<string, ComponentGroup> = {
  accordion: "Disclosure",
  "alert-dialog": "Overlays",
  alert: "Feedback",
  avatar: "Data display",
  badge: "Data display",
  breadcrumb: "Navigation",
  button: "Actions",
  calendar: "Data display",
  card: "Data display",
  carousel: "Layout",
  chart: "Data display",
  checkbox: "Forms",
  collapsible: "Disclosure",
  combobox: "Forms",
  command: "Navigation",
  "context-menu": "Overlays",
  "data-table": "Data display",
  "date-picker": "Forms",
  dialog: "Overlays",
  drawer: "Overlays",
  "dropdown-menu": "Overlays",
  form: "Forms",
  "hover-card": "Overlays",
  "image-card": "Data display",
  input: "Forms",
  "input-otp": "Forms",
  label: "Forms",
  marquee: "Layout",
  menubar: "Navigation",
  "navigation-menu": "Navigation",
  pagination: "Navigation",
  popover: "Overlays",
  progress: "Feedback",
  "radio-group": "Forms",
  resizable: "Layout",
  "scroll-area": "Layout",
  select: "Forms",
  sheet: "Overlays",
  sidebar: "Navigation",
  skeleton: "Feedback",
  slider: "Forms",
  sonner: "Feedback",
  switch: "Forms",
  table: "Data display",
  tabs: "Navigation",
  textarea: "Forms",
  tooltip: "Overlays",
};

export function getComponentCategory(slug: string): ComponentGroup {
  return componentCategoryBySlug[slug] ?? "Data display";
}

const recipeSlugs = new Set(["combobox", "data-table", "date-picker"]);

export function getComponentInstallMode(slug: string): ComponentInstallMode {
  return recipeSlugs.has(slug) ? "Recipe" : "Registry";
}

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((word) => (word === "otp" ? "OTP" : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(" ");
}

export const COMPONENT_DIRECTORY_LINKS = Object.keys(componentCategoryBySlug)
  .map((slug) => ({
    href: `/docs/${slug}`,
    text: titleFromSlug(slug),
  }))
  .sort((a, b) => a.text.localeCompare(b.text));
