import type { Metadata, Site, Socials } from "@types";

export const SITE: Site = {
  TITLE: "Abhinav",
  DESCRIPTION: "I am a Software Developer, with an interest in firmware, EE and healthcare",
  EMAIL: "atg271@gmail.com",
  NUM_POSTS_ON_HOMEPAGE: 5,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "If this deeplink works, then you're on a somewhat acceptable",
};

export const BLOG: Metadata = {
  TITLE: "Blog",
  DESCRIPTION: "A collection of articles on topics I am passionate about.",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION:
    "A collection of my projects with links to repositories and live demos.",
};

export const SOCIALS: Socials = [
  {
    NAME: "X (formerly Twitter)",
    HREF: "https://twitter.com/augustradjoe",
  },
  {
    NAME: "GitHub",
    HREF: "https://github.com/abhinavmir",
  },
  {
    NAME: "LinkedIn",
    HREF: "https://www.linkedin.com/in/abhinavmir",
  },
];
