# Handoff — Home page: "Quiénes somos" (hero) + "Cómo intervenimos" (metodología)

These are two INDEPENDENT sections. They share only the color tokens and the
same "reveal on scroll" pattern, but each ships as its own file and should be
dropped into the page separately — do not merge their markup.

## Files
- `About Hero - Quienes somos.html` — the merged About/Expertos hero.
- `Metodologia - Como intervenimos.html` — the process accordion + step wheel.
- `image-slot.js` — required only by the hero file (photo placeholders); replace with real `<img>` tags in production.

## Fonts (hero)
Google Fonts: **Spectral** (headings, serif) + **IBM Plex Sans** (body) +
**IBM Plex Mono** (micro-labels: eyebrow, list numbers, roles, photo caption).
Keep this trio — it carries the scientific/editorial tone.

## Shared tokens
```css
--navy-deep:#082b36; /* headings */
--teal:#0f8a8a;       /* accent: eyebrows, bullets, borders */
--paper:#fbfaf7;      /* background */
--ink:#0b3b49;        /* body text */
```
Both sections are light theme, no drop shadows anywhere, no rounded card
containers — accents are flat 1-2px borders / offset frames only.

---

## 1) About / Hero section ("Quiénes somos")

**What it is:** merges the old "Quiénes somos" bio blurb and the "Expertos en
orientación..." banner into a single above-the-fold hero. Big photo on the
LEFT. Light theme, no shadows, no cards — all accents are 1px teal lines and
offset frames.

**Structure:**
- `.hero` — full-viewport light section on a faint 56px graph-paper grid (two
  `linear-gradient` background layers). Ambient movement comes from `.dial`,
  a dashed instrument-dial circle half off-canvas on the right, rotating
  slowly (`@keyframes spin`, 90s) with an inner ring and an orbiting teal dot.
  Purely decorative; hidden under 900px.
- `.hero-grid` — 2 cols: photo 44vw + copy, 5vw gap.
- `.hero-photo` — big founders photo (4:5, grayscale 50%), 1px teal offset
  frame drawn behind-LEFT via `::before` (top:28px; left:-28px — keep it on
  the left so it never crosses into the copy column). `.photo-caption` is a
  rotated mono micro-label along the photo's left edge. The wrap
  (`#parallax-photo`) gets a small scroll parallax from the trailing script.
- `.hero-copy` — eyebrow (mono, 56px rule that draws in via
  `.reveal.in .rule`) → serif H1 "Asesores empresariales." with italic teal
  second line "Psicólogos clínicos." → numbered flat list (mono 01–05 in a
  34px column, hairline dividers, no card bg) → two mini-member chips
  (58px photo, 1px teal offset frame, serif name + mono role).
- Content blocks carry `.reveal`; the IntersectionObserver script staggers
  fade+rise, reveals above-the-fold items immediately, and has a 2.5s
  failsafe so nothing can stay invisible.

**To implement:** drop the whole `<section class="hero">...</section>` plus
its `<style>` block and trailing `<script>` into the page. Replace the two
`<image-slot>` placeholders (`team-photo`, `mini-p1`, `mini-p2`) with real
`<img>` tags (or keep image-slot if the target page already uses it).

---

## 2) Metodología section ("Cómo intervenimos")

**What it is:** a flat accordion (native `<details>`, no JS framework, no
box-shadow) paired with the existing 5-color step wheel graphic.

**Structure:**
- `.process-head` — eyebrow "Metodología" → H2 restated as an outcome
  ("Un proceso, cinco etapas, resultados medibles.") instead of the flat
  generic label.
- `.process-grid` — 2 columns: accordion left, wheel SVG right.
- `.step` — native `<details>`, top border only between rows (no shadow, no
  background fill, no rounding); numbered index (01–05) + title + chevron
  that rotates open/closed via `[open]`.
- `.wheel` — unchanged 5-segment ring SVG, kept because it's a distinctive
  diagram, not a generic card.

**To implement:** drop `<section class="process">...</section>` with its
`<style>` and trailing `<script>` in wherever this section belongs on the
page — it has no dependency on the hero section and no shared IDs.

---

## Notes for whoever wires these in
- Both scripts assume the "reveal" IntersectionObserver runs once per page;
  if both sections land on the same page, keep only ONE copy of that script
  (they're identical) and give it access to `.reveal` elements from both
  sections.
- Real founder photos: 4:5 aspect for the hero photo, ~1:1 crops for the
  mini chips.
