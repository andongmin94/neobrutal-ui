export type TemplateEntry = {
  color: string;
  description: string;
  installCommand: string;
  preview: string;
  slug: "blog" | "portfolio" | "cms" | "links";
  title: string;
};

const TEMPLATES: TemplateEntry[] = [
  {
    slug: "blog",
    title: "Blog",
    description: "A searchable home for articles and notes.",
    preview: "/template-previews/blog-ab017b7060.png",
    installCommand: "npx shadcn@latest add @neobrut-ui/blog-template",
    color: "#ffbe00",
  },
  {
    slug: "portfolio",
    title: "Portfolio",
    description: "A simple personal site for selected work and contact details.",
    preview: "/template-previews/portfolio-26ccf36d51.png",
    installCommand: "npx shadcn@latest add @neobrut-ui/portfolio-template",
    color: "#ff7b07",
  },
  {
    slug: "cms",
    title: "CMS",
    description: "A focused workspace for finding, editing, and publishing posts.",
    preview: "/template-previews/cms-7aa8e7ec5f.png",
    installCommand: "npx shadcn@latest add @neobrut-ui/cms-template",
    color: "#7983ff",
  },
  {
    slug: "links",
    title: "Link in bio",
    description: "A profile and link grid for sharing your work in one place.",
    preview: "/template-previews/link-hub-3bc1514ce7.png",
    installCommand: "npx shadcn@latest add @neobrut-ui/link-hub-template",
    color: "#5093fe",
  },
];

export default TEMPLATES;
