import type { RegistryItem } from "shadcn/schema";

type DiscoverableRegistryItem = RegistryItem & {
  description: string;
  categories: string[];
};

const UI = [
  {
    name: "accordion",
    title: "Accordion",
    description: "A vertically stacked set of collapsible content sections.",
    categories: ["layout", "disclosure"],
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
    description: "A prominent message for status updates, notices, and warnings.",
    categories: ["feedback", "status"],
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
    description: "A modal confirmation dialog for important or destructive actions.",
    categories: ["overlay", "dialog", "feedback"],
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    registryDependencies: ["button"],
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
    description: "An image or fallback that identifies a person or entity.",
    categories: ["data-display", "identity"],
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
    description: "A compact label for statuses, categories, and metadata.",
    categories: ["data-display", "status"],
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
    description: "A navigation trail that shows the current page hierarchy.",
    categories: ["navigation"],
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
    name: "button",
    title: "Button",
    description: "An interactive control that triggers an action or navigation.",
    categories: ["action", "form"],
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
    description: "A date picker calendar with single and range selection support.",
    categories: ["form", "date-time"],
    type: "registry:ui",
    dependencies: ["react-day-picker"],
    registryDependencies: ["button"],
    files: [
      {
        path: "src/components/ui/calendar.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "card",
    title: "Card",
    description: "A bordered container for grouping related content and actions.",
    categories: ["layout", "data-display"],
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
    description: "A scrollable collection of content with previous and next controls.",
    categories: ["data-display", "media"],
    type: "registry:ui",
    dependencies: ["embla-carousel-react"],
    registryDependencies: ["button"],
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
    description: "Composable Recharts helpers with neobrutalist styling and legends.",
    categories: ["data-display", "data-visualization"],
    type: "registry:ui",
    dependencies: ["recharts"],
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
    description: "A control for toggling one or more independent selections.",
    categories: ["form", "selection"],
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
    description: "An expandable region that reveals or hides related content.",
    categories: ["layout", "disclosure"],
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
    description: "A searchable command palette for actions and navigation.",
    categories: ["navigation", "search"],
    type: "registry:ui",
    dependencies: ["cmdk"],
    registryDependencies: ["dialog"],
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
    description: "A contextual action menu opened with a secondary pointer action.",
    categories: ["overlay", "menu"],
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
    name: "dialog",
    title: "Dialog",
    description: "A modal overlay for focused content, forms, and actions.",
    categories: ["overlay", "dialog"],
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    registryDependencies: ["button"],
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
    description: "A panel that slides in from the edge of the viewport.",
    categories: ["overlay", "dialog"],
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
    description: "A button-triggered menu for actions, choices, and nested options.",
    categories: ["overlay", "menu"],
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
    description: "Accessible form helpers with React Hook Form and Zod validation.",
    categories: ["form", "validation"],
    type: "registry:ui",
    dependencies: ["@base-ui/react", "@hookform/resolvers", "react-hook-form", "zod"],
    registryDependencies: ["label"],
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
    description: "A preview card that appears when a linked element is hovered.",
    categories: ["overlay", "data-display"],
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
    description: "A neobrutalist card for presenting an image with supporting content.",
    categories: ["data-display", "media"],
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
    description: "A styled text field for collecting short-form user input.",
    categories: ["form", "input"],
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
    description: "A text input composed with buttons, icons, or inline controls.",
    categories: ["form", "input"],
    type: "registry:ui",
    registryDependencies: ["button", "input", "textarea"],
    files: [
      {
        path: "src/components/ui/input-group.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "input-otp",
    title: "Input OTP",
    description: "A segmented input for one-time passwords and verification codes.",
    categories: ["form", "input", "authentication"],
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
    name: "label",
    title: "Label",
    description: "An accessible text label for a form control.",
    categories: ["form", "input"],
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
    description: "A continuously scrolling row for logos, quotes, or featured content.",
    categories: ["animation", "data-display"],
    docs: "Make sure there is enough content in `items` so it loops perfectly. Visit https://jackwhiting.co.uk/posts/creating-a-marquee-with-tailwind-css to learn more.",
    type: "registry:ui",
    cssVars: {
      theme: {
        "animate-marquee": "marquee 5s linear infinite",
        "animate-marquee2": "marquee2 5s linear infinite",
      },
    },
    css: {
      "@keyframes marquee": {
        "0%": {
          transform: "translateX(0%)",
        },
        "100%": {
          transform: "translateX(-100%)",
        },
      },
      "@keyframes marquee2": {
        "0%": {
          transform: "translateX(100%)",
        },
        "100%": {
          transform: "translateX(0%)",
        },
      },
    },
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
    description: "A horizontal application menu with nested commands and shortcuts.",
    categories: ["navigation", "menu"],
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    registryDependencies: ["dropdown-menu"],
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
    description: "A responsive site navigation menu with expandable link panels.",
    categories: ["navigation", "menu"],
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
    description: "Navigation controls for moving between pages of content.",
    categories: ["navigation"],
    type: "registry:ui",
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
    description: "A floating panel for contextual content and lightweight controls.",
    categories: ["overlay"],
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
    description: "A visual indicator of task or process completion.",
    categories: ["feedback", "status"],
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
    description: "A set of mutually exclusive options for selecting one value.",
    categories: ["form", "selection"],
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
    description: "Adjustable panel groups with draggable resize handles.",
    categories: ["layout"],
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
    description: "A custom scrollable viewport with styled scrollbars.",
    categories: ["layout"],
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
    description: "A dropdown control for choosing one value from a list.",
    categories: ["form", "selection"],
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
    description: "A visual divider for separating related content groups.",
    categories: ["layout"],
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
    description: "A modal panel that enters from a configurable screen edge.",
    categories: ["overlay", "dialog"],
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    registryDependencies: ["button"],
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
    description: "A responsive, collapsible application sidebar with navigation primitives.",
    categories: ["layout", "navigation"],
    type: "registry:ui",
    registryDependencies: [
      "avatar",
      "collapsible",
      "dropdown-menu",
      "button",
      "input",
      "sheet",
      "skeleton",
      "tooltip",
      "separator",
    ],
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
    description: "A placeholder that communicates content is loading.",
    categories: ["feedback", "loading"],
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
    description: "A draggable control for selecting a value or range.",
    categories: ["form", "input"],
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
    description: "A toast notification provider styled for neobrutalist interfaces.",
    categories: ["feedback", "notification"],
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
    description: "A binary control for turning a setting on or off.",
    categories: ["form", "selection"],
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
    description: "Semantic table primitives for structured rows and columns.",
    categories: ["data-display", "table"],
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
    description: "A tabbed interface for switching between related content panels.",
    categories: ["navigation", "layout"],
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
    description: "A multiline text field for collecting longer user input.",
    categories: ["form", "input"],
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
    description: "A concise text hint shown when an element is hovered or focused.",
    categories: ["overlay", "feedback"],
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    files: [
      {
        path: "src/components/ui/tooltip.tsx",
        type: "registry:ui",
      },
    ],
  },
] satisfies DiscoverableRegistryItem[];

const RECIPES = [
  {
    name: "data-table",
    title: "Data table",
    description: "A sortable, filterable data table recipe built with TanStack Table.",
    categories: ["data-display", "table", "recipe"],
    type: "registry:block",
    dependencies: ["@tanstack/react-table", "lucide-react"],
    registryDependencies: ["neobrutal-ui", "button", "checkbox", "dropdown-menu", "input", "table"],
    files: [
      {
        path: "src/components/ui/data-table.tsx",
        type: "registry:component",
        target: "components/ui/data-table.tsx",
      },
    ],
  },
] satisfies DiscoverableRegistryItem[];

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
] satisfies DiscoverableRegistryItem[];

function createStarRegistryItem(number: number) {
  const name = `s${number}`;

  return {
    name,
    title: `Star ${number}`,
    description: `A neobrutalist star graphic variant ${number} for decorative accents.`,
    categories: ["graphic", "icon", "decoration"],
    type: "registry:component",
    files: [
      {
        path: `src/components/stars/${name}.tsx`,
        type: "registry:component",
        target: `components/stars/${name}.tsx`,
      },
    ],
  } satisfies DiscoverableRegistryItem;
}

const STAR_COUNT = 40;
const STARS = Array.from({ length: STAR_COUNT }, (_, index) => createStarRegistryItem(index + 1));

const REGISTRY = [...UI, ...RECIPES, ...TEMPLATES, ...STARS];

export default REGISTRY;
