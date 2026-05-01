import React, { useEffect, useRef, useState } from "react";

/**
 * Thin gradient progress bar anchored to the top of the viewport that tracks
 * how far the user has scrolled through the document. Pure CSS transform scale
 * for GPU-accelerated smoothness, rAF-throttled measurement.
 */
export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    const measure = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight <= 0 ? 0 : Math.min(1, Math.max(0, scrollTop / docHeight));
      setProgress(pct);
    };
    const onScroll = () => {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    measure();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame.current);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent"
    >
      <div
        className="h-full origin-left bg-gradient-to-r from-aura-signal via-aura-violet to-aura-violet shadow-[0_0_10px_color-mix(in_srgb,var(--color-signal)_35%,transparent)] motion-reduce:transition-none transition-transform duration-75 ease-out"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
