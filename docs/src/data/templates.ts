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
    description: "A focused blog archive with search and readable post rows.",
    preview: "/template-previews/blog-ab017b7060.png",
    color: "#ffbe00",
  },
  {
    slug: "portfolio",
    registryItem: "portfolio-template",
    title: "Portfolio",
    description: "A minimal portfolio with an introduction, selected work, and contact links.",
    preview: "/template-previews/portfolio-9130fb37f6.png",
    color: "#ff7b07",
  },
  {
    slug: "cms",
    registryItem: "cms-template",
    title: "CMS",
    description: "A compact CMS for finding, editing, and publishing posts.",
    preview: "/template-previews/cms-7aa8e7ec5f.png",
    color: "#7983ff",
  },
  {
    slug: "links",
    registryItem: "link-hub-template",
    title: "Link in bio",
    description: "A compact profile and link grid for projects, social profiles, and contact.",
    preview: "/template-previews/link-hub-e95f6ed496.png",
    color: "#5093fe",
  },
];

const TEMPLATES: TemplateEntry[] = templatePresentations.map((template) => ({
  ...template,
  installCommand: registryInstallCommand(template.registryItem),
}));

export default TEMPLATES;
