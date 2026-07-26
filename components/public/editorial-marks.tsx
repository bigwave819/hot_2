import { cn } from "@/lib/utils";

/**
 * Structural container treatment (room cards, gallery tiles, dining
 * cards, content cards on About/Contact): minimal radius + a single thin
 * hairline ring instead of the shared Card primitive's rounded-xl +
 * ring-foreground/10. Intentionally NOT edited into components/ui/card.tsx
 * — that file is shared with the dashboard, which keeps its own rounded,
 * denser treatment by design. Compose this className onto a plain <div>
 * (or the shared Card, via `className`) on public-facing pages only.
 *
 *   <div className={editorialFrame}>...</div>
 *   <Card className={editorialFrame}>...</Card>   ← also works, overrides
 *                                                     the shared radius/ring
 */
export const editorialFrame =
  "rounded-[var(--radius-public)] bg-card ring-1 ring-hairline transition-[box-shadow,ring-color] duration-(--duration-hover) ease-(--ease-signature)";

/** Same idea, for image/media containers (no bg needed, image fills it). */
export const editorialMedia = "overflow-hidden rounded-[var(--radius-public)]";

/** Slightly larger radius variant for bigger surfaces (dining/about panels). */
export const editorialFrameLg =
  "rounded-[var(--radius-public-lg)] bg-card ring-1 ring-hairline";

/**
 * A thin horizontal rule in the gold accent, fading at both ends. Use as a
 * one-off signature detail — under a section eyebrow, between a heading
 * and body copy — not as a repeated component on every card.
 */
export function Hairline({ className }: { className?: string }) {
  return (
    <div
      className={cn("h-px w-full", className)}
      style={{
        background:
          "linear-gradient(to right, transparent, var(--color-hairline-strong), transparent)",
      }}
      aria-hidden="true"
    />
  );
}

/**
 * A small L-shaped corner accent in the gold hairline color, meant to sit
 * absolutely positioned at one corner of an image or card
 * (`className="absolute -top-1 -left-1"` etc.). Use on the hero image or a
 * single hero-adjacent element — not on every gallery tile — per the
 * brief's "occasional single-accent detail" direction.
 */
export function CornerMark({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-hairline-strong", className)}
      aria-hidden="true"
    >
      <path d="M1 1H12" stroke="currentColor" strokeWidth="1" />
      <path d="M1 1V12" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}