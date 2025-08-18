"use client";

import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollProviderProps {
  children: React.ReactNode;
}

const ScrollProvider = ({ children }: ScrollProviderProps) => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return; // ✅ avoids SSR crash

    const lenis = new Lenis({
      smooth: true,
      lerp: 0.1,
      duration: 1.2,
    });

    lenisRef.current = lenis;

    // ✅ RAF loop
    let frame: number;
    const raf = (time: number) => {
      lenis.raf(time);
      ScrollTrigger.update();
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    // ✅ scroller proxy
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        return arguments.length
          ? lenis.scrollTo(value as number)
          : lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: document.body.style.transform ? "transform" : "fixed",
    });

    // ✅ Refresh after mount
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("resize", refresh);
    refresh();

    return () => {
      lenis.destroy();
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", refresh);
    };
  }, []);

  return <>{children}</>;
};

export default ScrollProvider;
