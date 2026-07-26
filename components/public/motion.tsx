"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

let registered = false;

/**
 * Registers every GSAP plugin the public site uses, exactly once, no
 * matter how many components import this module. Safe to call at module
 * scope in each component file.
 */
export function registerMotionPlugins() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  registered = true;
}

registerMotionPlugins();

export { gsap, ScrollTrigger, SplitText };

/**
 * Shared easing vocabulary. Keep this small and reuse it everywhere rather
 * than picking a new ease per component — consistency of *feel* across
 * sections is what reads as "designed" rather than "animated."
 */
export const EASE = {
  /** Entrances: reveals, fade-ups, scale-ins. */
  out: "power3.out",
  /** Continuous/ambient motion: drifting light, slow parallax. */
  ambient: "sine.inOut",
  /** Hover / micro-interactions. */
  hover: "power2.out",
  /** Timeline-internal transitions (hero → next section). */
  inOut: "power2.inOut",
} as const;

export const DURATION = {
  fast: 0.4,
  base: 0.8,
  slow: 1.2,
} as const;

/**
 * A single named matchMedia condition for prefers-reduced-motion, so every
 * component checks it the same way. Usage:
 *
 *   const mm = gsap.matchMedia();
 *   mm.add(REDUCED_MOTION_QUERY, (context) => {
 *     const { reduceMotion } = context.conditions as ReducedMotionConditions;
 *     if (reduceMotion) { gsap.set(el, { autoAlpha: 1 }); return; }
 *     // ...full animation
 *   });
 */
export const REDUCED_MOTION_QUERY = {
  reduceMotion: "(prefers-reduced-motion: reduce)",
};

export type ReducedMotionConditions = { reduceMotion: boolean };