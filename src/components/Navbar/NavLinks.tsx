"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NAV_ITEMS } from "./links";
import styles from "./Navbar.module.css";

function normalize(path: string): string {
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

// Marks the link for the current page, like the old highlightActiveNavLink.
// Pages are prefetched on hover or focus instead of on load, so the first visit downloads only the current page.
export default function NavLinks() {
  const current = normalize(usePathname());
  const router = useRouter();

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
      <Link
        key={item.href}
        href={item.href}
        className={className}
        aria-current={active ? "page" : undefined}
        prefetch={false}
        onMouseEnter={() => router.prefetch(item.href)}
        onFocus={() => router.prefetch(item.href)}
      >
        <span>{item.label}</span>
      </Link>
    );
  });
}
