import { registryInstallCommand } from "@/data/registry-endpoints";

export type TemplateEntry = {
  color: string;
  description: string;
  installCommand: string;
  preview: string;
  registryItem: `${string}-template`;
  slug: "blog" | "portfolio" | "cms" | "links";
  title: string;
};

type TemplatePresentation = Omit<TemplateEntry, "installCommand">;

const templatePresentations: TemplatePresentation[] = [
  {
    slug: "blog",
    registryItem: "blog-template",
    title: "Blog",
    description: "An editorial archive with topic filters, search, sorting, and reading pages.",
    preview: "/template-previews/blog-ab017b7060.png",
    color: "#ffbe00",
  },
  {
    slug: "portfolio",
    registryItem: "portfolio-template",
    title: "Portfolio",
    description: "A design practice with services, expandable case studies, and a project inquiry.",
    preview: "/template-previews/portfolio-9130fb37f6.png",
    color: "#ff7b07",
  },
  {
    slug: "cms",
    registryItem: "cms-template",
    title: "CMS",
    description: "An editorial workspace with content preview, local save, and change recovery.",
    preview: "/template-previews/cms-c0dbc2ca68.png",
    color: "#7983ff",
  },
  {
    slug: "links",
    registryItem: "link-hub-template",
    title: "Link in bio",
    description: "A creator profile with categorized destinations and a copyable contact address.",
    preview: "/template-previews/link-hub-e95f6ed496.png",
    color: "#5093fe",
  },
];

const TEMPLATES: TemplateEntry[] = templatePresentations.map((template) => ({
  ...template,
  installCommand: registryInstallCommand(template.registryItem),
}));

export default TEMPLATES;
