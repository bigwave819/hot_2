"use client";

import * as React from "react";
import { gsap, ScrollTrigger, REDUCED_MOTION_QUERY, type ReducedMotionConditions } from "./motion";
import { cn } from "@/lib/utils";

/**
 * Wraps an image (or any element) that should drift at a different speed
 * than the page as the user scrolls past it. Unlike Reveal, this is
 * scroll-*scrubbed* (tied directly to scroll position, not a one-time
 * play-on-enter animation) — it keeps moving for as long as the element
 * is in the viewport.
 *
 * `speed` > 0 moves the content up relative to scroll (classic parallax —
 * background feels like it's lagging behind); values around 0.15–0.3 read
 * as a subtle, premium drift rather than an obvious effect. The wrapped
 * element should be positioned to overflow its container slightly (e.g.
 * given `scale-110` or extra height) so the moving edges never show.
 */
export function ParallaxLayer({
  children,
  className,
  speed = 0.2,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const layerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const wrapper = wrapperRef.current;
    const layer = layerRef.current;
    if (!wrapper || !layer) return;

    const mm = gsap.matchMedia();

    mm.add(REDUCED_MOTION_QUERY, (context) => {
      const { reduceMotion } = context.conditions as ReducedMotionConditions;
      if (reduceMotion) return;

      const tween = gsap.to(layer, {
        yPercent: speed * 100,
        ease: "none",
        scrollTrigger: {
          trigger: wrapper,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    return () => mm.revert();
  }, [speed]);

  return (
    <div ref={wrapperRef} className={cn("relative overflow-hidden", className)}>
      <div ref={layerRef} className="absolute inset-0 top-[-10%] h-[120%]">
        {children}
      </div>
    </div>
  );
}