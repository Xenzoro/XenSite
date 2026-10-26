"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Navbar.module.css";

// Hamburger button and the slide in mobile menu. Esc, an outside click or picking a link closes it.
export default function MenuToggle({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);

  // Closing always hands focus back to the hamburger
  function close() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  useEffect(() => {
    // Lets the desktop nav step aside while the menu is open (see Navbar.module.css)
    document.documentElement.toggleAttribute("data-menu-open", open);
    if (!open) return;
    menuRef.current?.querySelector("a")?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    function onClick(event: MouseEvent) {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !buttonRef.current?.contains(target)) close();
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onClick);
    return () => {
      document.documentElement.removeAttribute("data-menu-open");
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onClick);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={`${styles.hamburger} ${open ? styles.hamburgerOpen : ""}`}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={styles.hamburgerIcon} aria-hidden="true">
          {open ? "✕" : "☰"}
        </span>
      </button>
      <nav
        ref={menuRef}
        id="mobile-menu"
        aria-label="Menu"
        className={`${styles.mobileNav} ${open ? "" : styles.mobileHidden}`}
        inert={!open}
        onClick={(event) => {
          if ((event.target as Element).closest("a")) close();
        }}
      >
        <div className={styles.mobileList}>{children}</div>
      </nav>
    </>
  );
}
