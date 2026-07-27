import { COMPONENT_DIRECTORY_LINKS } from "./component-directory";

const COMPONENTS_LINKS = COMPONENT_DIRECTORY_LINKS;

const GETTING_STARTED_LINKS = [
  {
    href: "/docs",
    text: "Introduction",
  },
  {
    href: "/docs/installation",
    text: "Installation",
  },
  {
    href: "/docs/registry",
    text: "Registry",
  },
];

const EXPLORE_LINKS = [
  {
    href: "/styling",
    text: "Styling",
  },
  {
    href: "/charts",
    text: "Charts",
  },
  {
    href: "/stars",
    text: "Stars",
  },
  {
    href: "/templates",
    text: "Templates",
  },
];

const PROJECT_LINKS = [
  {
    href: "/docs/resources",
    text: "Resources",
  },
  {
    href: "/docs/credits",
    text: "Credits & license",
  },
];

const MAIN_SIDEBAR = [
  "Getting started",
  ...GETTING_STARTED_LINKS,
  "Foundation",
  {
    href: "/docs/design-tokens",
    text: "Design tokens",
  },
  "Components",
  ...COMPONENTS_LINKS,
  "Extras",
  {
    href: "/docs/stars",
    text: "Stars",
  },
  "Project",
  ...PROJECT_LINKS,
];

export { MAIN_SIDEBAR, COMPONENTS_LINKS, EXPLORE_LINKS, GETTING_STARTED_LINKS, PROJECT_LINKS };
