"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./links";
import styles from "./Navbar.module.css";

function normalize(path: string): string {
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

// Marks the link for the current page, like the old highlightActiveNavLink
export default function NavLinks() {
  const current = normalize(usePathname());

  return NAV_ITEMS.map((item) => {
    const active = normalize(item.href) === current;
    const className = [
      styles.link,
      item.tilt === "right" ? styles.tiltRight : styles.tiltLeft,
      item.wide && styles.wide,
      active && styles.active,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <Link key={item.href} href={item.href} className={className} aria-current={active ? "page" : undefined}>
        <span>{item.label}</span>
      </Link>
    );
  });
}
