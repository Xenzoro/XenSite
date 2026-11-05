export interface NavItem {
  href: string;
  label: string;
  // Hover tilt direction, alternating like the old liquid buttons
  tilt: "right" | "left";
  wide?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", tilt: "right" },
  { href: "/projects/", label: "Projects", tilt: "left" },
  { href: "/fun/", label: "Fun", tilt: "right" },
  { href: "/about/", label: "About Me", tilt: "left" },
  { href: "/contact/", label: "Contact", tilt: "left", wide: true },
];
