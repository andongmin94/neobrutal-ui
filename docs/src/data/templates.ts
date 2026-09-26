import { registryInstallCommand } from "@/data/registry-endpoints";

export type TemplateEntry = {
  color: string;
  description: string;
  installCommand: string;
  registryItem: `${string}-template`;
  slug: "blog" | "portfolio" | "cms" | "links" | "dashboard" | "landing";
  title: string;
};

type TemplatePresentation = Omit<TemplateEntry, "installCommand">;

const templatePresentations: TemplatePresentation[] = [
  {
    slug: "blog",
    registryItem: "blog-template",
    title: "Blog",
    description: "An editorial archive with topic filters, search, sorting, and reading pages.",
    color: "#ffbe00",
  },
  {
    slug: "portfolio",
    registryItem: "portfolio-template",
    title: "Portfolio",
    description: "A design practice with services, expandable case studies, and a project inquiry.",
    color: "#ff7b07",
  },
  {
    slug: "cms",
    registryItem: "cms-template",
    title: "CMS",
    description: "An editorial workspace with content preview, local save, and change recovery.",
    color: "#7983ff",
  },
  {
    slug: "links",
    registryItem: "link-hub-template",
    title: "Link in bio",
    description: "A creator profile with categorized destinations and a copyable contact address.",
    color: "#5093fe",
  },
  {
    slug: "dashboard",
    registryItem: "dashboard-template",
    title: "Dashboard",
    description: "A project overview with task search, status filters, and progress summaries.",
    color: "#a4e7ba",
  },
  {
    slug: "landing",
    registryItem: "landing-template",
    title: "Landing page",
    description:
      "A product landing page with feature sections, billing options, and plan selection.",
    color: "#f8a4d5",
  },
];

const TEMPLATES: TemplateEntry[] = templatePresentations.map((template) => ({
  ...template,
  installCommand: registryInstallCommand(template.registryItem),
}));

export default TEMPLATES;
