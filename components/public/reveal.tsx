"use client";

import * as React from "react";
import {
  gsap,
  ScrollTrigger,
  EASE,
  DURATION,
  REDUCED_MOTION_QUERY,
  type ReducedMotionConditions,
} from "./motion";

export type RevealVariant = "fade-up" | "scale-in" | "clip-wipe";

const VARIANT_FROM: Record<RevealVariant, gsap.TweenVars> = {
  "fade-up": { autoAlpha: 0, y: 32 },
  "scale-in": { autoAlpha: 0, scale: 0.94 },
  "clip-wipe": { autoAlpha: 1, clipPath: "inset(0 0 100% 0)" },
};

const VARIANT_TO: Record<RevealVariant, gsap.TweenVars> = {
  "fade-up": { autoAlpha: 1, y: 0 },
  "scale-in": { autoAlpha: 1, scale: 1 },
  "clip-wipe": { autoAlpha: 1, clipPath: "inset(0 0 0% 0)" },
};

const VARIANT_REST: Record<RevealVariant, gsap.TweenVars> = {
  "fade-up": { autoAlpha: 1, y: 0 },
  "scale-in": { autoAlpha: 1, scale: 1 },
  "clip-wipe": { autoAlpha: 1, clipPath: "inset(0 0 0% 0)" },
};

/**
 * Wraps a section (or a group of children) for a choreographed scroll
 * reveal. Used across the public site only — the staff dashboard stays
 * unanimated by design.
 *
 * - No `stagger` prop: the wrapper itself animates as one block (same
 *   behavior as the original Reveal — safe drop-in replacement).
 * - `stagger` prop set: the wrapper's *direct children* are each animated
 *   individually with that offset between them, so a row of cards or a
 *   list reveals piece by piece instead of popping in as a slab.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  variant = "fade-up",
  stagger,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: RevealVariant;
  stagger?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = stagger !== undefined ? Array.from(el.children) : el;
    const from = VARIANT_FROM[variant];
    const to = VARIANT_TO[variant];
    const rest = VARIANT_REST[variant];

    const mm = gsap.matchMedia();

    mm.add(REDUCED_MOTION_QUERY, (context) => {
      const { reduceMotion } = context.conditions as ReducedMotionConditions;

      if (reduceMotion) {
        gsap.set(targets, rest);
        return;
      }

      gsap.fromTo(targets, from, {
        ...to,
        duration: DURATION.base,
        delay,
        stagger,
        ease: EASE.out,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      return () => {
        ScrollTrigger.getAll().forEach((t) => {
          if (t.trigger === el) t.kill();
        });
      };
    });

    return () => mm.revert();
  }, [delay, variant, stagger]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}