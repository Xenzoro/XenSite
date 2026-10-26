"use client";

import gsap from "gsap";
import Lenis from "lenis";
import { useEffect } from "react";

// Smooth scrolling and the intro entrance from the old main.js. Skipped when the visitor prefers reduced motion.
export default function HomeMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis();
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Photo fades and slides in just before the text box and resume button
    const intro = gsap
      .timeline({ defaults: { duration: 0.8, ease: "power2.out" } })
      .from("[data-intro='photo']", { opacity: 0, y: 30 })
      .from("[data-intro='content']", { opacity: 0, y: 30 }, "-=0.5");

    return () => {
      intro.kill();
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
