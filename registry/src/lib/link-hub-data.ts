export type LinkHubProfile = {
  name: string;
  initials: string;
  handle: string;
  bio: string;
  email?: string;
};

export type LinkHubLink = {
  id: string;
  group: string;
  title: string;
  detail: string;
  href: string;
  icon?: "website" | "code" | "social" | "writing" | "profile" | "email";
  highlighted?: boolean;
  external?: boolean;
};

export const LINK_HUB_PROFILE = {
  name: "Alex Doe",
  initials: "AD",
  handle: "@alexbuilds",
  bio: "Designer and developer sharing small tools, notes, and experiments.",
  email: "hello@example.com",
} satisfies LinkHubProfile;

export const LINK_HUB_LINKS = [
  {
    id: "portfolio",
    group: "Work",
    title: "Portfolio",
    detail: "example.com",
    href: "https://example.com",
    icon: "website",
    highlighted: true,
    external: true,
  },
  {
    id: "github",
    group: "Work",
    title: "GitHub",
    detail: "github.com",
    href: "https://github.com",
    icon: "code",
    external: true,
  },
  {
    id: "x",
    group: "Connect",
    title: "X",
    detail: "x.com",
    href: "https://x.com",
    icon: "social",
    external: true,
  },
  {
    id: "newsletter",
    group: "Writing",
    title: "Newsletter",
    detail: "buttondown.email",
    href: "https://buttondown.email",
    icon: "writing",
    external: true,
  },
  {
    id: "linkedin",
    group: "Connect",
    title: "LinkedIn",
    detail: "linkedin.com",
    href: "https://www.linkedin.com",
    icon: "profile",
    external: true,
  },
  {
    id: "email",
    group: "Connect",
    title: "Email",
    detail: "hello@example.com",
    href: "mailto:hello@example.com",
    icon: "email",
  },
] as const satisfies readonly LinkHubLink[];
