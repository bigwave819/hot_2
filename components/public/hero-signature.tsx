"use client";

import * as React from "react";
import { gsap, EASE, REDUCED_MOTION_QUERY, type ReducedMotionConditions } from "./motion";
import { cn } from "@/lib/utils";

/**
 * Drop this inside the hero section, absolutely positioned, behind the
 * text content:
 *
 *   <section className="relative ...">
 *     <Image ... />                     ← existing background photo
 *     <HeroSignature />                 ← new: add this
 *     <div className="absolute inset-0 bg-linear-to-t ..." />
 *     <div className="relative ...">    ← existing text content
 *
 * It never plays once-and-stops the way scroll reveals do — the flare
 * drifts continuously (slow, looping, eased) so there's always something
 * quietly alive on screen even if the visitor never scrolls. This is the
 * one place on the site where motion is ambient rather than tied to an
 * event (load or scroll), which is what makes it read as a "signature"
 * moment rather than another reveal.
 */
export function HeroSignature({ className }: { className?: string }) {
  const flareRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const flare = flareRef.current;
    if (!flare) return;

    const mm = gsap.matchMedia();

    mm.add(REDUCED_MOTION_QUERY, (context) => {
      const { reduceMotion } = context.conditions as ReducedMotionConditions;

      // Reduced motion: show the flare as a static soft glow, no drift.
      if (reduceMotion) {
        gsap.set(flare, { autoAlpha: 0.5, x: 0, y: 0 });
        return;
      }

      gsap.set(flare, { autoAlpha: 0 });

      const tl = gsap.timeline({ delay: 0.3 });
      tl.to(flare, { autoAlpha: 0.55, duration: 2, ease: EASE.out });
      tl.to(
        flare,
        {
          x: "+=60",
          y: "-=40",
          duration: 9,
          ease: EASE.ambient,
          repeat: -1,
          yoyo: true,
        },
        "<",
      );

      return () => {
        tl.kill();
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      <div
        ref={flareRef}
        className="absolute -top-1/4 right-[10%] h-[45vw] w-[45vw] max-h-125 max-w-125 rounded-full opacity-0 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--color-gold) 55%, transparent) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}