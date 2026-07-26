"use client";

import * as React from "react";
import { gsap, ScrollTrigger, EASE, REDUCED_MOTION_QUERY, type ReducedMotionConditions } from "./motion";

/**
 * Counts up from 0 to `value` when scrolled into view. Renders as a plain
 * <span> so it drops into existing headline/stat markup.
 *
 *   <CountUp value={42} suffix=" rooms" className="font-display text-5xl" />
 */
export function CountUp({
  value,
  duration = 1.4,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    mm.add(REDUCED_MOTION_QUERY, (context) => {
      const { reduceMotion } = context.conditions as ReducedMotionConditions;

      if (reduceMotion) {
        el.textContent = `${prefix}${value.toFixed(decimals)}${suffix}`;
        return;
      }

      const counter = { n: 0 };
      const tween = gsap.to(counter, {
        n: value,
        duration,
        ease: EASE.out,
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          toggleActions: "play none none none",
        },
        onUpdate: () => {
          el.textContent = `${prefix}${counter.n.toFixed(decimals)}${suffix}`;
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    return () => mm.revert();
  }, [value, duration, prefix, suffix, decimals]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {(0).toFixed(decimals)}
      {suffix}
    </span>
  );
}