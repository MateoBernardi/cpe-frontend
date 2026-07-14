# Handoff: Foro — Clínica para Empresas (visual redesign)

## Overview
Restyle of the existing Foro (the CPE content hub: papers, podcasts, novedades, and community discussion threads) away from a generic corporate look toward a serious, "scientific publication / journal" tone that matches the brand's Instagram art direction (solid navy/teal color blocks, serif headlines, honest photography). The flow, IA, and interactions were already approved — **only visual design changed.**

## About the Design Files
The files in this bundle are **design references built in HTML/CSS/vanilla JS** — they show intended look, typography, spacing, and behavior. They are not production code to paste into the real app. The task is to **recreate this design in the target codebase's existing environment** (whatever frontend framework/component library the product already uses) using its established patterns — componentizing what's here as reusable pieces (PublicationCard, PublicationDetail, TagList, ExternalLinksCTA, etc.).

## Fidelity
**High-fidelity.** Colors, typography, spacing, and copy are final-intent. Recreate pixel-close using the codebase's existing styling approach (CSS-in-JS, Tailwind, SCSS modules — whatever the app already uses), mapping the tokens below 1:1.

## Data model constraint (important)
The client provided this canonical shape and asked that **every publication template render only fields that exist on it** — no invented metadata (no fake "reading time," no fabricated stats, no guest bios):

```ts
export interface PublicationDTO {
  id: number;
  title: string;
  subtitle?: string | null;
  image_url?: string | null;
  content: string;
  type_id?: number | null;      // maps to Paper / Podcast / Novedad (and possibly others)
  tags?: string[] | null;
  category_ids?: number[] | null;
  created_by: string;
  created_at: Date;
  interactions?: InteractionCounts;   // shape not provided — assume {views, likes, comments} or similar
  external_links?: { [key: string]: string };
  images?: ImageDTO[];
}
```

Discussion threads (Foro - Discusion.html) are **not** a Publication — they're a separate thread/reply model (not specified by the client), so that template is looser and should be treated as its own entity when you build the real data layer.

Field → UI mapping used throughout:
- `title` → H1 / card title
- `subtitle` → the italic/serif "lede" line under the title (optional — omit the block if null)
- `image_url` → the single hero/cover image on the detail page and the small thumbnail in list rows (optional — the layout must gracefully collapse the thumbnail column when absent)
- `content` → the flowing prose body (rendered from whatever rich text/markdown the backend stores)
- `type_id` → selects which detail template variant renders (Paper / Podcast / Novedad share one structural template; only the rail's primary CTA and icon differ)
- `tags` → the small pill row under the meta line (`.tags-row`); render 0-N, hide row if empty
- `category_ids` → resolves to the category taxonomy already in the app (Papers / Podcasts / Novedades / Discusión) — drives the color accent (`--c-papers`, `--c-podcasts`, `--c-novedades`, `--c-foros`) and the `.tag` label
- `created_by` → author name/initials avatar in the meta line
- `created_at` → the relative/short date shown in the meta line ("Jun 2026", "Ayer", "Hoy") — format client-side
- `interactions` → the small stat rows in the `.info-card` (views/likes/comments — confirm exact field names with backend, the mock uses placeholder numbers)
- `external_links` → renders as the pill/button row inside `.cta-card` (e.g. Spotify/Apple/YouTube/RSS for a podcast, "Descargar PDF" + "Discusión asociada" for a paper). Render one pill per key/value pair present; don't hardcode platform names.
- `images` → the optional 2-3-image gallery grid below the body content (`.gallery`); render 0-N, hide the grid if empty

## Screens / Views

### 1. Foro - Inicio.html — home feed
- Sticky floating pill navbar (rounded, white, drop shadow) — brand mark + nav links (Foro / Papers / Podcasts / Novedades / Discusión) + search icon + "Suscribirme" button. **There is only one nav — do not add a second sub-navigation row.** Clicking a nav link filters the page into a single-category grouped view (see `foro-feed.js` `showCategory`/`showTodo`) instead of navigating away.
- Hero: flat text block (no card/shadow) with a top+bottom rule, category tag, H2, lede, meta line, primary CTA button, and a solid navy stat panel to the right (edge-to-edge color fill, no border-radius/shadow — this is the one allowed "band" of solid color, not a card).
- Feed: one strip per category. Each strip = section head (H2 + count badge + "Ver todo") followed by a `.list`: a **2-column grid on desktop** (collapses to 1 column under 880px) of `.list-item` rows. Each row = small square thumbnail (`image_url` placeholder) + text column (category tag, title as a link, excerpt, meta). Rows are separated by a bottom rule only — no per-item card shadow/background/border, no whole-row hover box. Infinite scroll appends more strips (see IntersectionObserver in `foro-feed.js`).

### 2. Foro - Paper.html / Foro - Podcast.html / Foro - Novedad.html — publication detail
One shared structural template, three instances:
- **Paper & Podcast**: two-column layout — `.rail` (sticky sidebar: `.cta-card` solid-navy box with the primary action + `external_links` pills, then `.info-card` white box with `interactions` stat rows) + `.pod-main` (tag, H1, meta, `.tags-row`, lede, hero image, prose `content`, optional `.gallery`, related-items list).
- **Novedad**: single centered column (no rail — novedades don't need a persistent action card), same field order: tag, H1, meta, lede, hero image, `.tags-row`, prose, optional gallery, `interactions` shown as a plain inline stat row (not boxed — it's not a CTA).
- Related-items lists at the bottom use the same `.list` component in a 3-column variant (`.list.cols-3`).

### 3. Foro - Discusion.html — discussion thread (not a Publication)
- Original post rendered as plain text under a top rule (no card box).
- Threaded replies (`.reply`), one highlighted as "best answer" (`.reply.best`, tinted background).
- Reply composer (`textarea` + submit button).
- Sidebar: `.info-card` (reply/participant/last-activity counts) + `.cta-card` (link to the related paper).

### 4. Landing - Preview Foro.html
Shows how the Foro surfaces inside the main marketing site: intro band, papers list + a "live" discussion sidebar feed, a solid-teal podcast promo band, and a solid-navy closing CTA band.

## Interactions & Behavior
- Nav-link click → `e.preventDefault()`, toggles `.active` class on the clicked link, and swaps between the home feed and a grouped single-category view (`showCategory`/`showTodo` in `foro-feed.js`). No page navigation for these — they're client-side view switches.
- Infinite scroll on the home feed via `IntersectionObserver` watching a loader sentinel; stops after a bounded number of rounds and shows an end-of-feed message.
- List-item titles are the only clickable/underline-on-hover element — do not make the whole row a hover target with a background/shadow change (explicit client preference, revisit if reversed).
- `.tags-row` pills, `.cta-card` external-link pills — plain hover color/border changes, no motion.

## State Management
- No global app state modeled here — this is a static content browsing surface. Real implementation needs: current category filter/view, infinite-scroll pagination cursor, and (for Discusion) reply list + composer state.

## Design Tokens
Colors (see `:root` in `foro.css` for the authoritative list):
- `--navy: #0c3a48` / `--navy-2: #0a2e3a` — primary dark, used for hero stat panel, CTA cards, footer, solid bands
- `--teal: #0d8b8b` / `--teal-600: #0a7677` / `--teal-700: #096364` — primary action color (links, buttons, active nav)
- `--teal-band: #0b5f60` — solid podcast promo band background
- `--teal-tint: #e3f0f0` / `--teal-tint-2: #d4e8e8` — light backgrounds (avatar bg, ghost button)
- `--bg: #f2f1ed` / `--bg-2: #eae9e4` — page background / hover tint
- `--paper: #fdfdfb` / `--card: #fdfdfb` — surface color (cards, navbar)
- `--line: #d8d5cc` / `--line-2: #e6e4dc` — hairline rules used everywhere instead of shadows
- `--ink: #17242a` — body text / `--muted: #5c6f74` / `--muted-2: #849399` — secondary text
- Category accents (oklch, shared L/C, varied hue): `--c-papers: oklch(0.42 0.09 245)`, `--c-podcasts: oklch(0.50 0.09 195)`, `--c-novedades: oklch(0.48 0.09 150)`, `--c-foros: oklch(0.52 0.10 55)`

Typography:
- Serif (headlines): `'Source Serif 4', Georgia, serif` — weights 400/600/700
- Sans (body/UI): `'IBM Plex Sans', system-ui, sans-serif` — weights 400/500/600/700
- Mono (labels/meta/tags/eyebrows — the "journal" identifier feel): `'IBM Plex Mono', monospace` — weights 400/500/600
- Google Fonts import is in `foro.css` line 5

Radius: `--radius: 18px` (navbar pill, CTA/info cards, hero images, thumbnails use `--radius-sm: 6-12px`)
Shadow: `--shadow` / `--shadow-sm` — used **only** on the navbar pill and the CTA/info cards (download/listen/visit actions and stat boxes). Everything else (list rows, hero blocks, publication bodies) uses hairline rules (`border-top`/`border-bottom`, 1px `--line`/`--line-2`), never a shadow or full border box.

Layout: max content width `1240px` (`.wrap`), 2-column list grid ≥880px / 1-column below, `.list.cols-3` for fixed 3-item related rows.

## Assets
No real photography yet — all imagery is a striped placeholder (`.ph`, diagonal stripe pattern, monospace caption naming what goes there, e.g. `image_url · 1600×900`, `images[0]`). Replace these with real photography/screenshots per `image_url`/`images[]` when content is available. The brand mark (`.brand-mark`) is a simple CSS shape (radial-gradient circle + two "person" bumps) standing in for the "Clínica para Empresas" logo — swap for the real logo asset.

## Files
- `foro.css` — shared design system (tokens, nav, buttons, tags, `.list`/`.list-item`, `.cta-card`/`.info-card`, bands, footer)
- `foro-data.js` — sample content matching the PublicationDTO fields used by the feed
- `foro-feed.js` — renders feed strips, infinite scroll, and the nav-driven category view (reference for interaction logic, not for reuse as-is)
- `Foro - Inicio.html` — home feed
- `Foro - Paper.html`, `Foro - Podcast.html`, `Foro - Novedad.html` — publication detail template, one file per `type_id`
- `Foro - Discusion.html` — discussion thread detail
- `Landing - Preview Foro.html` — Foro surfaced inside the marketing site
