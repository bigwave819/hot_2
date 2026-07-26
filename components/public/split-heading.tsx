"use client";

import * as React from "react";
import {
  gsap,
  ScrollTrigger,
  SplitText,
  EASE,
  REDUCED_MOTION_QUERY,
  type ReducedMotionConditions,
} from "./motion";

/**
 * Splits its child heading into words (default) or characters and reveals
 * them with a stagger, either on load (`trigger="load"`, for the hero — no
 * ScrollTrigger needed since it's above the fold) or on scroll into view
 * (`trigger="scroll"`, for section headlines further down the page).
 *
 * Renders exactly one child element (the heading itself); SplitText needs
 * the actual text node to split, so this is not a generic wrapper — pass
 * the h1/h2 directly as the single child.
 *
 * Example:
 *   <SplitHeading trigger="load" by="words">
 *     <h1 className="font-display text-6xl">A Sanctuary in Kigali</h1>
 *   </SplitHeading>
 */
export function SplitHeading({
  children,
  by = "words",
  trigger = "scroll",
  delay = 0,
}: {
  children: React.ReactElement;
  by?: "words" | "chars";
  trigger?: "load" | "scroll";
  delay?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const target = container.firstElementChild as HTMLElement | null;
    if (!target) return;

    let split: InstanceType<typeof SplitText> | null = null;
    const mm = gsap.matchMedia();

    mm.add(REDUCED_MOTION_QUERY, (context) => {
      const { reduceMotion } = context.conditions as ReducedMotionConditions;

      if (reduceMotion) {
        gsap.set(target, { autoAlpha: 1 });
        return;
      }

      split = SplitText.create(target, {
        type: by,
        // avoid a flash of the full unsplit heading before the split renders
        autoSplit: true,
      });

      const units = by === "chars" ? split.chars : split.words;

      gsap.set(target, { autoAlpha: 1 });

      const animation: gsap.TweenVars = {
        autoAlpha: 1,
        yPercent: 0,
        duration: by === "chars" ? 0.5 : 0.7,
        delay,
        stagger: by === "chars" ? 0.015 : 0.06,
        ease: EASE.out,
      };

      if (trigger === "scroll") {
        animation.scrollTrigger = {
          trigger: target,
          start: "top 85%",
          toggleActions: "play none none none",
        };
      }

      gsap.fromTo(units, { autoAlpha: 0, yPercent: 100 }, animation);

      return () => {
        ScrollTrigger.getAll().forEach((t) => {
          if (t.trigger === target) t.kill();
        });
        split?.revert();
      };
    });

    return () => {
      mm.revert();
      split?.revert();
    };
  }, [by, trigger, delay]);

  return (
    <div ref={ref} style={{ display: "contents" }}>
      {children}
    </div>
  );
}