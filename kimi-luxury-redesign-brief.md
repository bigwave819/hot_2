# Baobab Hotel — Luxury UI & Motion Redesign Brief

## Context

Baobab Hotel is a Next.js 16 + Tailwind CSS v4 + GSAP web app for a real single-property luxury hotel in Kigali, Rwanda. The backend, database, auth, booking flow, and full staff dashboard are complete and working correctly. **This brief is scoped to visual and motion design only** — do not change data models, server logic, routing structure, or business logic. This is a redesign pass on top of a functioning app.

**The problem:** the current public-facing site is functionally complete but visually generic. It looks like a SaaS app, not a five-star hotel. Specifically:

1. **No sense of arrival.** The homepage doesn't grab attention in the first few seconds. There's no signature moving element, no "wow" moment — a visitor has no reason to stay and scroll.
2. **Animation is inconsistent and thin.** GSAP is installed and used in a couple of places (a basic scroll-fade wrapper), but most sections just appear with no motion at all. It reads as an afterthought, not a designed experience.
3. **Shape language reads cheap, not luxury.** Cards, buttons, and containers default to generic `rounded-xl`/`rounded-lg` Tailwind corners everywhere. Heavy uniform rounding is a SaaS-dashboard convention — five-star hospitality brands (Aman, Belmond, Four Seasons, One&Only) use sharper, more architectural shapes: minimal or no rounding, thin hairline borders, generous negative space, occasional single-accent details (a thin gold rule, a corner mark) instead of soft bubble corners everywhere.
4. **Dark mode palette is weak.** The current dark theme doesn't feel rich or intentional — it reads flat/muddy rather than deep and premium.
5. **Typography doesn't commit to luxury.** A display serif (Fraunces) is loaded but under-used — headlines are too conservatively sized/weighted to carry the "editorial hotel brand" feeling the brand deserves.

## What "done" looks like

A visitor lands on the homepage and, within 2–3 seconds, something moving/alive on screen signals "this is a designed, premium experience" — before they've even started scrolling. As they scroll, every section reveals itself with deliberate, choreographed motion (not just a uniform fade-up on everything — vary the technique: staggered word/character reveals on headlines, parallax on imagery, scale-ins, clip-path wipes). Cards and containers use a shape language that feels architectural and considered, not templated. Dark mode feels like a deliberate "evening at the hotel" mode, not an inverted color scheme.

## Explicit scope boundaries — read this carefully

- **In scope:** `(public)` route group (homepage, rooms listing/detail, gallery, dining, about, contact), `(auth)` login/register split-screens, shared `SiteHeader`/`SiteFooter`, and any shared UI primitive (`Button`, `Card`, etc.) *as used on public-facing pages*.
- **Out of scope, do not touch:** the `(staff)` dashboard and everything under it. That's intentionally utilitarian — dense data tables, fast interactions, zero decorative animation — by deliberate earlier design decision. Don't "improve" it with motion; that would actively hurt the people using it 8 hours a day.
- **Out of scope:** database schema, server actions, auth logic, business rules (booking availability, reservation state machine, etc.). If a visual change requires new data, flag it — don't invent new data flows unprompted.
- Respect `prefers-reduced-motion` on every single animation added, no exceptions.

## Technical constraints — work within these, don't replace them

- **Stack already in place:** Next.js 16 App Router, TypeScript, Tailwind CSS v4 (CSS-based `@theme` tokens in `globals.css`, no `tailwind.config.ts`), GSAP + ScrollTrigger (already installed), `next/font` for Fraunces (display serif) / Manrope (body sans) / IBM Plex Mono (data/labels).
- **Design tokens already exist** in `app/globals.css` as CSS custom properties (`--color-canvas`, `--color-forest`, `--color-gold`, `--color-clay`, `--color-abyss` for immersive dark screens, etc.), each exposed as a Tailwind utility. Extend/adjust these values rather than hardcoding new arbitrary colors inline — the whole point of the token system is that one edit propagates everywhere.
- **Component primitives** live in `components/ui/` (hand-rolled, shadcn-style API — `Button`, `Card`, `Dialog`, etc.) and are shared with the dashboard. If you need a public-site-only visual treatment, prefer a variant or a public-specific wrapper over forking the primitive, so the dashboard doesn't silently inherit changes meant only for the marketing site.
- **Existing motion helper:** `components/public/reveal.tsx` — a GSAP `matchMedia()`-based scroll-reveal wrapper. Feel free to replace or significantly extend it, but keep the reduced-motion handling pattern it establishes.

## Specific direction per problem area

### 1. Homepage hero — the "why should I stay" moment
Build a real signature moment, not just a static image with text overlay. Options to consider (pick what serves the brand, don't do all of them):
- A slow, continuous parallax on the hero image/layers as the user scrolls
- Character-by-character or word-by-word headline reveal on load (GSAP `SplitText`-style stagger)
- A subtle floating/drifting decorative element (a slow-moving light flare, an animated line drawing, a soft-moving gradient) that runs continuously, not just on load
- A scroll-driven transition from the hero into the next section (image scale/mask reveal, not a hard cut)

### 2. Motion system across every section
Every scroll-triggered reveal should feel choreographed:
- Stagger children (don't animate a whole section as one block — stagger cards, list items, headline words)
- Vary the technique per content type: images might scale+fade, headlines might clip-reveal or split-reveal, stat/number cards might count up
- Micro-interactions on hover: buttons, room cards, and gallery images should respond to hover with intention (subtle scale, image zoom, underline draw-on, not just a color swap)
- Nothing should "pop in" abruptly — everything should feel eased and intentional (GSAP `power2`/`power3` easing, not linear)

### 3. Shape language audit
Go through every card, button, image container, and input on the public site and public-site-only components. Replace the default heavy-rounding convention with something more architectural:
- Prefer `rounded-none` or very small radii (2–4px) for structural containers (room cards, gallery tiles, content cards)
- Reserve any pill/full-rounding for genuinely circular elements only (icon buttons, avatars) — not for photo containers or cards
- Consider thin 1px hairline borders in the gold/clay accent as a signature detail instead of shadows-and-radius as the primary "this is a card" signal

### 4. Dark mode palette
Revisit `--color-canvas` (dark variant), `--color-canvas-raised`, and the accent tokens for dark mode specifically. It should feel like a deliberately designed "evening" mode — richer near-black with warmth, not a flat desaturated inversion of the light palette. Check contrast on every accent color against the new dark background.

### 5. Typography commitment
Push the display serif (Fraunces) harder on the public site: larger scale on hero/section headlines, more confident use of weight/italic variation, more generous line-height and letter-spacing on display type. The body font (Manrope) and data font (IBM Plex Mono) pairing can stay — the gap is in how boldly the display face is currently being used, not in the font choices themselves.

## Deliverables

1. Updated `globals.css` tokens (dark mode palette revision, any new motion-related CSS variables)
2. Redesigned homepage (`app/(public)/page.tsx` and its section components)
3. A more capable motion system replacing/extending `reveal.tsx` — should support stagger, varied reveal types, and a hero-specific "signature moment" component
4. Shape-language pass across public-facing cards/containers (rooms listing/detail, gallery, dining menu, about, contact — all already built, this is a visual refactor not a rebuild)
5. Before/after reasoning for each major change — explain *why* a choice serves "five-star hotel" positioning specifically, not just "looks nicer"

## What NOT to do

- Don't introduce a new component library or animation dependency beyond GSAP (already installed) — no Framer Motion, no Lottie, unless there's a specific gap GSAP genuinely can't cover
- Don't touch anything under `(staff)/` 
- Don't change the database schema, server actions, or auth
- Don't abandon the existing design token system in favor of hardcoded one-off values
- Don't animate literally everything uniformly — restraint and variation is what makes motion feel premium instead of gimmicky