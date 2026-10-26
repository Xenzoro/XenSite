"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Navbar.module.css";

const THRESHOLD = 8;

// Desktop nav: slides away when scrolling down, comes back when scrolling up or at the top
export default function HideOnScroll({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    function onScroll() {
      const current = window.scrollY;
      if (current <= 0) setHidden(false);
      else if (current - lastY.current > THRESHOLD) setHidden(true);
      else if (lastY.current - current > THRESHOLD) setHidden(false);
      else return;
      lastY.current = current;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav aria-label="Main" onFocus={() => setHidden(false)} className={`${styles.desktopNav} ${hidden ? styles.desktopHidden : ""}`}>
      {children}
    </nav>
  );
}
