import { useEffect, useRef, useState } from "react";

/**
 * Perceived-progress curve: rushes toward ~90% quickly, then crawls toward 99%
 * while work continues. When `active` becomes false, eases to 100%.
 */
export function useAsymptoticProgress(active, { fastCap = 90, crawlCap = 99, tickMs = 180 } = {}) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("idle");
  const valueRef = useRef(0);
  const intervalRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const clearIntervalSafe = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    const clearRaf = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    if (active) {
      clearRaf();
      valueRef.current = 0;
      setProgress(0);
      setPhase("running");

      intervalRef.current = setInterval(() => {
        let p = valueRef.current;
        if (p < fastCap) {
          const remaining = fastCap - p;
          p += remaining * 0.11 + 0.85;
        } else if (p < crawlCap) {
          const remaining = crawlCap - p;
          p += remaining * 0.045 + 0.04;
        }
        p = Math.min(p, crawlCap);
        valueRef.current = p;
        setProgress(p);
      }, tickMs);

      return () => clearIntervalSafe();
    }

    clearIntervalSafe();

    if (valueRef.current > 0 && valueRef.current < 100) {
      setPhase("completing");
      const start = valueRef.current;
      const startTime = performance.now();
      const duration = 480;

      const finish = (now) => {
        const t = Math.min((now - startTime) / duration, 1);
        const eased = 1 - (1 - t) ** 3;
        const next = start + (100 - start) * eased;
        valueRef.current = next;
        setProgress(next);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(finish);
        } else {
          valueRef.current = 100;
          setProgress(100);
          setPhase("done");
          rafRef.current = null;
        }
      };
      rafRef.current = requestAnimationFrame(finish);
    } else if (!active && valueRef.current === 0) {
      setPhase("idle");
    }

    return () => clearRaf();
  }, [active, crawlCap, fastCap, tickMs]);

  return { progress: Math.round(progress), phase };
}
