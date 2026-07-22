import type { RegistryItem } from "shadcn/schema";

const UI = [
  {
    name: "accordion",
    title: "Accordion",
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    files: [
      {
        path: "src/components/ui/accordion.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "alert",
    title: "Alert",
    type: "registry:ui",
    files: [
      {
        path: "src/components/ui/alert.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "alert-dialog",
    title: "Alert dialog",
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    registryDependencies: ["nbutton"],
    files: [
      {
        path: "src/components/ui/alert-dialog.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "avatar",
    title: "Avatar",
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    files: [
      {
        path: "src/components/ui/avatar.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "badge",
    title: "Badge",
    type: "registry:ui",
    files: [
      {
        path: "src/components/ui/badge.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "breadcrumb",
    title: "Breadcrumb",
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    files: [
      {
        path: "src/components/ui/breadcrumb.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "nbutton",
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    files: [
      {
        path: "src/components/ui/button.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "button",
    title: "Button",
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    files: [
      {
        path: "src/components/ui/button.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "calendar",
    title: "Calendar",
    type: "registry:ui",
    dependencies: ["react-day-picker"],
    registryDependencies: ["nbutton"],
    files: [
      {
        path: "src/components/ui/calendar.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "ncard",
    title: "Card",
    type: "registry:ui",
    files: [
      {
        path: "src/components/ui/card.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "card",
    title: "Card",
    type: "registry:ui",
    files: [
      {
        path: "src/components/ui/card.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "carousel",
    title: "Carousel",
    type: "registry:ui",
    dependencies: ["embla-carousel-react"],
    registryDependencies: ["nbutton"],
    files: [
      {
        path: "src/components/ui/carousel.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "chart",
    title: "Chart",
    type: "registry:ui",
    dependencies: ["recharts"],
    registryDependencies: ["ncard"],
    files: [
      {
        path: "src/components/ui/chart.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "checkbox",
    title: "Checkbox",
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    files: [
      {
        path: "src/components/ui/checkbox.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "collapsible",
    title: "Collapsible",
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    files: [
      {
        path: "src/components/ui/collapsible.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "command",
    title: "Command",
    type: "registry:ui",
    dependencies: ["cmdk"],
    registryDependencies: ["ndialog"],
    files: [
      {
        path: "src/components/ui/command.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "context-menu",
    title: "Context menu",
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    files: [
      {
        path: "src/components/ui/context-menu.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "ndialog",
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    files: [
      {
        path: "src/components/ui/dialog.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "dialog",
    title: "Dialog",
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    files: [
      {
        path: "src/components/ui/dialog.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "drawer",
    title: "Drawer",
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    files: [
      {
        path: "src/components/ui/drawer.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "dropdown-menu",
    title: "Dropdown menu",
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    files: [
      {
        path: "src/components/ui/dropdown-menu.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "form",
    title: "Form",
    type: "registry:ui",
    dependencies: ["@base-ui/react", "react-hook-form"],
    registryDependencies: ["nbutton", "nlabel"],
    files: [
      {
        path: "src/components/ui/form.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "hover-card",
    title: "Hover card",
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    files: [
      {
        path: "src/components/ui/hover-card.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "image-card",
    title: "Image card",
    type: "registry:ui",
    files: [
      {
        path: "src/components/ui/image-card.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "input",
    title: "Input",
    type: "registry:ui",
    files: [
      {
        path: "src/components/ui/input.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "input-group",
    title: "Input Group",
    type: "registry:ui",
    registryDependencies: ["nbutton", "ninput", "textarea"],
    files: [
      {
        path: "src/components/ui/input-group.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "ninput",
    title: "Input",
    type: "registry:ui",
    files: [
      {
        path: "src/components/ui/input.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "input-otp",
    title: "Input OTP",
    type: "registry:ui",
    dependencies: ["input-otp"],
    files: [
      {
        path: "src/components/ui/input-otp.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "nlabel",
    type: "registry:ui",
    files: [
      {
        path: "src/components/ui/label.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "label",
    title: "Label",
    type: "registry:ui",
    files: [
      {
        path: "src/components/ui/label.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "marquee",
    title: "Marquee",
    docs: "Make sure there is enough content in `items` so it loops perfectly. Visit https://jackwhiting.co.uk/posts/creating-a-marquee-with-tailwind to learn more.",
    type: "registry:ui",
    files: [
      {
        path: "src/components/ui/marquee.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "menubar",
    title: "Menubar",
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    files: [
      {
        path: "src/components/ui/menubar.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "navigation-menu",
    title: "Navigation menu",
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    files: [
      {
        path: "src/components/ui/navigation-menu.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "pagination",
    title: "Pagination",
    type: "registry:ui",
    registryDependencies: ["nbutton"],
    files: [
      {
        path: "src/components/ui/pagination.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "popover",
    title: "Popover",
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    files: [
      {
        path: "src/components/ui/popover.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "progress",
    title: "Progress",
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    files: [
      {
        path: "src/components/ui/progress.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "radio-group",
    title: "Radio group",
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    files: [
      {
        path: "src/components/ui/radio-group.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "resizable",
    title: "Resizable",
    type: "registry:ui",
    dependencies: ["react-resizable-panels"],
    files: [
      {
        path: "src/components/ui/resizable.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "scroll-area",
    title: "Scroll area",
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    files: [
      {
        path: "src/components/ui/scroll-area.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "select",
    title: "Select",
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    files: [
      {
        path: "src/components/ui/select.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "separator",
    title: "Separator",
    type: "registry:ui",
    files: [
      {
        path: "src/components/ui/separator.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "sheet",
    title: "Sheet",
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    files: [
      {
        path: "src/components/ui/sheet.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "nsheet",
    title: "Sheet",
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    files: [
      {
        path: "src/components/ui/sheet.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "sidebar",
    title: "Sidebar",
    type: "registry:ui",
    registryDependencies: ["nbutton", "nsheet", "ntooltip", "ninput", "separator", "nskeleton"],
    files: [
      {
        path: "src/components/ui/sidebar.tsx",
        type: "registry:ui",
      },
      {
        path: "src/hooks/use-mobile.ts",
        type: "registry:hook",
      },
    ],
  },
  {
    name: "skeleton",
    title: "Skeleton",
    type: "registry:ui",
    files: [
      {
        path: "src/components/ui/skeleton.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "nskeleton",
    title: "Skeleton",
    type: "registry:ui",
    files: [
      {
        path: "src/components/ui/skeleton.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "slider",
    title: "Slider",
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    files: [
      {
        path: "src/components/ui/slider.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "sonner",
    title: "Sonner",
    type: "registry:ui",
    dependencies: ["sonner", "next-themes"],
    files: [
      {
        path: "src/components/ui/sonner.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "switch",
    title: "Switch",
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    files: [
      {
        path: "src/components/ui/switch.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "table",
    title: "Table",
    type: "registry:ui",
    files: [
      {
        path: "src/components/ui/table.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "tabs",
    title: "Tabs",
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    files: [
      {
        path: "src/components/ui/tabs.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "textarea",
    title: "Textarea",
    type: "registry:ui",
    files: [
      {
        path: "src/components/ui/textarea.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "tooltip",
    title: "Tooltip",
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    files: [
      {
        path: "src/components/ui/tooltip.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "ntooltip",
    title: "Tooltip",
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    files: [
      {
        path: "src/components/ui/tooltip.tsx",
        type: "registry:ui",
      },
    ],
  },
] satisfies RegistryItem[];

const RECIPES = [
  {
    name: "data-table",
    title: "Data table",
    description: "A sortable, filterable data table recipe built with TanStack Table.",
    type: "registry:block",
    dependencies: ["@tanstack/react-table", "lucide-react"],
    registryDependencies: [
      "neobrutal-ui",
      "nbutton",
      "checkbox",
      "dropdown-menu",
      "ninput",
      "table",
    ],
    files: [
      {
        path: "src/components/ui/data-table.tsx",
        type: "registry:component",
        target: "components/ui/data-table.tsx",
      },
    ],
  },
] satisfies RegistryItem[];

const TEMPLATES = [
  {
    name: "blog-template",
    title: "Blog template",
    description: "A focused blog archive with search and readable post rows.",
    type: "registry:block",
    dependencies: ["lucide-react"],
    registryDependencies: ["neobrutal-ui", "button", "input"],
    categories: ["template", "blog"],
    files: [
      {
        path: "src/lib/blog-posts.ts",
        type: "registry:lib",
        target: "lib/blog-posts.ts",
      },
      {
        path: "src/blocks/templates/blog-post-template.tsx",
        type: "registry:component",
        target: "components/templates/blog-post-template.tsx",
      },
      {
        path: "src/blocks/templates/blog-template.tsx",
        type: "registry:component",
        target: "components/templates/blog-template.tsx",
      },
      {
        path: "src/blocks/templates/pages/blog/page.tsx",
        type: "registry:page",
        target: "app/blog/page.tsx",
      },
      {
        path: "src/blocks/templates/pages/blog/[slug]/page.tsx",
        type: "registry:page",
        target: "app/blog/[slug]/page.tsx",
      },
    ],
  },
  {
    name: "portfolio-template",
    title: "Portfolio template",
    description: "A minimal portfolio with an introduction, selected work, and contact links.",
    type: "registry:block",
    dependencies: ["lucide-react"],
    registryDependencies: ["neobrutal-ui", "button"],
    categories: ["template", "portfolio"],
    files: [
      {
        path: "src/blocks/templates/portfolio-template.tsx",
        type: "registry:component",
        target: "components/templates/portfolio-template.tsx",
      },
      {
        path: "src/blocks/templates/pages/portfolio/page.tsx",
        type: "registry:page",
        target: "app/portfolio/page.tsx",
      },
    ],
  },
  {
    name: "cms-template",
    title: "CMS template",
    description: "A compact CMS for finding, editing, and publishing posts.",
    type: "registry:block",
    dependencies: ["lucide-react"],
    registryDependencies: [
      "neobrutal-ui",
      "badge",
      "button",
      "input",
      "switch",
      "tabs",
      "textarea",
    ],
    categories: ["template", "cms"],
    files: [
      {
        path: "src/blocks/templates/cms-template.tsx",
        type: "registry:component",
        target: "components/templates/cms-template.tsx",
      },
      {
        path: "src/blocks/templates/pages/cms/page.tsx",
        type: "registry:page",
        target: "app/cms/page.tsx",
      },
    ],
  },
  {
    name: "link-hub-template",
    title: "Link in bio template",
    description: "A compact profile and link grid for projects, social profiles, and contact.",
    type: "registry:block",
    dependencies: ["lucide-react"],
    registryDependencies: ["neobrutal-ui", "button"],
    categories: ["template", "profile", "links"],
    files: [
      {
        path: "src/blocks/templates/link-hub-template.tsx",
        type: "registry:component",
        target: "components/templates/link-hub-template.tsx",
      },
      {
        path: "src/blocks/templates/pages/links/page.tsx",
        type: "registry:page",
        target: "app/links/page.tsx",
      },
    ],
  },
] satisfies RegistryItem[];

function createStarRegistryItem(number: number) {
  const name = `s${number}`;

  return {
    name,
    title: `Star ${number}`,
    type: "registry:component",
    files: [
      {
        path: `src/components/stars/${name}.tsx`,
        type: "registry:component",
        target: `components/stars/${name}.tsx`,
      },
    ],
  } satisfies RegistryItem;
}

const STAR_COUNT = 40;
const STARS = Array.from({ length: STAR_COUNT }, (_, index) => createStarRegistryItem(index + 1));

const REGISTRY = [...UI, ...RECIPES, ...TEMPLATES, ...STARS];

export default REGISTRY;
