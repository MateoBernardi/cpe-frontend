# Handoff: Clínica para Empresas — Servicios, Publicación & Formulario

## Overview
Three redesigned screens for the **Clínica para Empresas** site, rebuilt in the refined editorial brand direction (deep teal-green, cream background, high-contrast serif display, generous whitespace) established by the Foro pages:

1. **Servicios** — a service detail section ("Acompañamiento a las personas") with objetivo + ejes de trabajo and a dark CTA band.
2. **Publicación** — an editorial article layout ("paper") with header, hero, long-form body, pull quote, aside, author card, and related posts.
3. **Formulario** — the "Solicitá tu presupuesto" contact form, restyled as a split panel (dark brand panel + form).

## About the Design Files
The file in this bundle (`Clinica Foro.dc.html`) is a **design reference created in HTML** — a prototype showing intended look and behavior, **not production code to copy directly**. It is authored in a lightweight in-house component format (`.dc.html`) and uses inline styles throughout.

The task is to **recreate these designs in the target codebase's existing environment** (React, Vue, Astro, WordPress, etc.) using its established patterns, component library, and tokens. If no environment exists yet, pick the most appropriate framework for the project. Translate the inline styles into whatever styling system the codebase already uses (CSS modules, Tailwind, styled-components, etc.) — don't ship the inline styles verbatim.

## Fidelity
**High-fidelity (hifi).** Colors, typography, spacing, radii, and layout are final and intended to be matched precisely. Imagery is represented by striped placeholders — swap in real assets (see Assets).

---

## Design Tokens

### Colors
| Token | Hex | Usage |
|---|---|---|
| `--deep-green` | `#0e3b35` | Primary brand dark: buttons, dark panels/bands, headings on light nav |
| `--green-accent` | `#2f8f6b` | Accent "period" on headlines, list numbers, left rule of pull quotes |
| `--green-accent-light` | `#7fd0b3` | Accent period/numbers on dark backgrounds |
| `--teal-eyebrow` | `#0f6b5c` | Small-caps eyebrow labels, links |
| `--teal-eyebrow-onDark` | `#8fc9b6` | Eyebrow labels on deep-green backgrounds |
| `--ink` | `#1d1d1b` | Serif display headlines (warm near-black) |
| `--ink-soft` | `#2c2c28` | Nav links, form labels, strong body |
| `--body` | `#33332e` | Article body text |
| `--body-muted` | `#55554f` | Intro/supporting paragraphs |
| `--muted` | `#7a7a72` | Meta text, captions |
| `--caption` | `#8a8272` | Placeholder/monospace captions |
| `--cream` | `#f3f0e9` | Primary page background & light text on dark |
| `--cream-2` | `#faf8f2` / `#fbfaf6` | Card / input / nav surfaces |
| `--cream-3` | `#f0ece2` | "Seguir leyendo" band background |
| `--page-bg` | `#eae5da` | Outer canvas behind the mock frames (presentation only) |
| `--border` | `#ddd6c8` | Frame & section borders |
| `--border-warm` | `#cfc7b6` / `#e0d8c8` | Input borders, list dividers |
| `--aside-bg` | `#eef3f0` | "En la práctica" aside |
| `--aside-border` | `#d5e2db` | Aside border, tag pills border `#cfe0d9` |
| `--dark-divider` | `#2a5850` | Divider inside deep-green form panel |
| `--required` | `#c0392b` | Required-field asterisk |
| Dark panel avatar bg | `#1e5248` | Author/avatar circle on dark |

### Typography
- **Display / headlines:** `Newsreader` (Google Fonts), weight **500** (some 400). Used for all H1/H2/H3, pull quotes, standfirst (italic 400), author names. Letter-spacing `-0.01em` on large sizes; line-height 1.04–1.1.
- **Body / UI:** `Hanken Grotesk` (Google Fonts), weights 400/500/600/700. Body copy, labels, buttons, nav, meta.
- **Mono:** system `monospace` — image-placeholder captions only.
- **Google Fonts import:** `Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500` + `Hanken+Grotesk:wght@400;500;600;700`.

**Type scale (px):**
| Role | Size / weight / line-height |
|---|---|
| Section headline (H2) | 56 / 500 / 1.04 (Newsreader) |
| Article H1 | 52 / 500 / 1.08 |
| Panel/CTA H2–H3 | 38–46 / 500 / 1.06–1.1 |
| Article H3 (subhead) | 30 / 500 |
| Pull quote | 30 / 500 / 1.35 |
| Standfirst (italic) | 22 / 400 / 1.5 |
| Objetivo quote (italic) | 23 / 400 / 1.45 |
| Body | 18 / 400 / 1.75 |
| Intro / lead | 16–17 / 400 / 1.6 |
| List item | 16 / 400 / 1.45 |
| Nav link | 14 / 600 |
| Label / meta | 13–14 / 600 |
| Eyebrow | 12 / 700 / letter-spacing 0.18–0.2em, uppercase |
| Drop cap | 78 / Newsreader / green `#0e3b35`, float left |

### Spacing, radii, shadows
- Frame radius **6px**; pills **20px**; avatars/icons **50%**.
- Standard control padding: inputs `13px 15px`; primary button `15px 34px`; nav CTA `8–9px 16px`.
- Section inner padding: `64px 72px`; article column max-width **680px** (centered); hero max-width **1100px**; header max-width **820px**.
- Borders `1px`; accent left rule on pull quote `3px`; nav circle icon border `1.5px`.
- **No drop shadows** in the design language — depth comes from color blocks and hairline borders. Input focus uses a ring: `box-shadow: 0 0 0 3px rgba(14,59,53,.1)` + `border-color:#0e3b35`.

---

## Shared Component: Top Navigation
Appears on all three screens. `display:flex; justify-content:space-between; align-items:center; padding:20px 40px;` on a light surface (`#fbfaf6`/`#ffffff`) with a `1px #e4dccd` bottom border.
- **Left:** 34×34 circular logo mark (`1.5px #0e3b35` border) containing three dots (5px `#2f8f6b`, 6px `#0e3b35`, 5px `#2f8f6b`) + two-line wordmark "Clínica para / Empresas" (Hanken 700, 14px, `#0e3b35`).
- **Center:** links `Inicio · Nosotros · Servicios ⌄ · Foro` (14/600, `#2c2c28`); active link `#0e3b35` with 2px bottom border.
- **Right:** "Déjanos tu CV" (outline: `1.5px #0e3b35`, text `#0e3b35`) + "Solicitar presupuesto" (filled `#0e3b35`, text `#f3f0e9`), both 13/600, radius 6px; then Instagram + search icons.

*Replace the dot-cluster mark with the real Clínica para Empresas logo asset.*

---

## Screen 1 — Servicios

**Purpose:** Present a single service ("Acompañamiento a las personas"): its objective and working axes, plus a cross-sell CTA to a related service.

**Layout:** Cream section (`#f3f0e9`). Body padding `64px 72px 0`. Eyebrow "NUESTROS SERVICIOS · 01". Then a 2-column grid `grid-template-columns: 1.15fr 1fr; gap:72px; align-items:start`.

**Left column**
- H1: "Acompañamiento a las personas" + green period. (Newsreader 56/500.)
- Lead paragraph, 17/1.6, `#55554f`, max-width 460.
- **Objetivo block:** top border `1px #cfc7b6`, eyebrow "OBJETIVO", then an italic Newsreader quote (23px) `#2c2c28`, max-width 480.
- **Ejes de trabajo:** eyebrow label, then a list of 5 items. Each item: `flex; gap:22px; align-items:baseline; padding:18px 0; border-bottom:1px #e0d8c8`. Number in Newsreader 20px `#2f8f6b` (min-width 34px), text 16/1.45 `#3a3a34`.
  1. `01` Seguimiento y observación clínica en el día a día laboral.
  2. `02` Lectura del perfil de cada persona en relación con la cultura organizacional.
  3. `03` Análisis de la gestión de conflictos y modos de respuesta.
  4. `04` Relevamiento de habilidades y elaboración de una ficha técnica descriptiva.
  5. `05` Dispositivo de respuesta ante situaciones urgentes (SOS).

**Right column** (`position:sticky; top:24px`)
- Image placeholder, `aspect-ratio:4/5`, radius 6, striped fill. → real photo "acompañamiento".
- Below: 32px circular arrow badge (`1.5px #0e3b35`) + caption text (13/1.5 `#7a7a72`): "Un dispositivo de respuesta ante situaciones urgentes, disponible para toda la organización."

**Dark CTA band** (full width of frame, `margin-top:64px`, bg `#0e3b35`, padding `56px 72px`, `flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:40px`)
- Left: eyebrow "TAMBIÉN OFRECEMOS" (`#8fc9b6`) + H3 (Newsreader 38/500, `#f3f0e9`) "Acompañamiento a integrantes del equipo de trabajo" + light-green period (`#7fd0b3`), max-width 640.
- Right: "Iniciar consulta →" button (bg `#f3f0e9`, text `#0e3b35`, 15/700, padding `15px 30px`, radius 6) + subtext "Sin costo · Reunión virtual" (13, `#cfe0d9`, centered).

---

## Screen 2 — Publicación (editorial article)

**Purpose:** Read a single "paper"/article from the Foro.

**Layout:** Light section (`#faf8f2`). Centered measure of **680px** for body; wider blocks break out.

- **Header** (max-width 820, centered): breadcrumb "Foro · PAPER · N.° 002" (13, `#0f6b5c`/`#7a7a72`); H1 (Newsreader 52/500) "Familia, propiedad y gestión: las tensiones que se heredan" + green period; italic standfirst (Newsreader 22, `#4a4a44`, max-width 640); byline row (14, `#6a6a62`): 26px avatar circle "PB" (`#0e3b35`/white) + "Pablo Biassoni" · "7 min de lectura" · "hace 2 semanas"; `border-bottom:1px #ddd6c8` under the row.
- **Hero** (max-width 1100): image placeholder `aspect-ratio:16/7`, radius 6, striped → real opening image; italic caption below (12.5, `#8a8272`).
- **Body** (max-width 680): 
  - Drop cap "E" (Newsreader 78, `#0e3b35`, `float:left; line-height:.78; padding:6px 14px 0 0`).
  - Two intro paragraphs (18/1.75, `#33332e`).
  - H3 subheads (Newsreader 30/500, `#1d1d1b`, `margin:44px 0 16px`): "Nombrar lo que estaba implícito", "De la tensión al acuerdo".
  - **Pull quote:** `blockquote` with `border-left:3px #2f8f6b; padding-left:28px; margin:48px 0`, Newsreader 30/500/1.35 `#0e3b35`.
  - **Aside "EN LA PRÁCTICA":** bg `#eef3f0`, border `1px #d5e2db`, radius 6, padding `26px 28px`, margin `40px 0`; eyebrow + 3 bullet lines (15.5/1.5 `#33332e`).
  - **Article footer:** top border, tag pills (12, `#0f6b5c`, `1px #cfe0d9`, radius 20, padding `5px 13px`): "Empresa familiar", "Conflicto", "Sucesión"; right-aligned "Compartir →" (14/600, `#0e3b35`).
- **Author card** (max-width 680): `flex; gap:18px`, bg `#0e3b35`, radius 6, padding `24px 28px`; 52px avatar circle (`#1e5248`, "PB"); name (Newsreader 19, `#f3f0e9`) + role/bio (13.5/1.5, `#a9cabe`).
- **"Seguir leyendo" band:** bg `#f0ece2`, top border, padding `48px 72px`; eyebrow; 3-column grid (`repeat(3,1fr); gap:28px`). Each card: 3/2 striped image, "PAPER · N.° 00x" (11/700, `#8a8272`), title (Newsreader 20/1.2, `#1d1d1b`), meta (13, `#7a7a72`):
  - N.° 003 — "Equipos que deciden mejor: el rol del conflicto sano" — 6 min · hace 3 semanas
  - N.° 004 — "Crecimiento con estructura: cuando el orden habilita" — 5 min · hace 1 mes
  - N.° 001 — "Pensar la empresa, puertas adentro" — 5 min · hace 5 días

*Full article body copy is placeholder Spanish — replace with real content. Structure (drop cap → paras → H3 → pull quote → aside → footer) is the reusable template.*

---

## Screen 3 — Formulario ("Solicitá tu presupuesto")

**Purpose:** Capture a budget request.

**Layout:** Cream section. Below nav, a 2-column grid `grid-template-columns: 0.85fr 1.15fr; min-height:640px`.

**Left panel** (bg `#0e3b35`, padding `64px 52px`, `flex-direction:column`)
- Eyebrow "SOLICITAR PRESUPUESTO" (`#8fc9b6`).
- H2 (Newsreader 46/500, `#f3f0e9`) "Solicitá tu presupuesto" + light-green period.
- Subtitle (16/1.6, `#c3d8d0`, max-width 340): "Completá el formulario y nos pondremos en contacto a la brevedad."
- **"QUÉ SUCEDE DESPUÉS"** block: top border `1px #2a5850`; 3 numbered steps — number Newsreader 20 `#7fd0b3`, text 15/1.5 `#d7e6e0`:
  1. Recibimos y revisamos tu solicitud.
  2. Coordinamos una reunión virtual sin costo.
  3. Conocemos tus necesidades y te acercamos una propuesta.
- Bottom (pushed with `margin-top:auto`): "Reunión virtual **sin costo** para conocer mejor tus necesidades." (14/1.6, `#a9cabe`, bold `#f3f0e9`).

**Right form** (padding `56px 60px`, bg `#f3f0e9`)
- Field grid `grid-template-columns:1fr 1fr; gap:22px 24px`.
  - Nombre* (full width), Email* + Teléfono (row), Localidad* + Cantidad de personas* (row, number min 1), Dirección* (full), textarea "Contanos sobre tu organización" (full, rows 4).
- **Inputs:** `padding:13px 15px; border:1px #cfc7b6; radius:6; bg:#fbfaf6; font Hanken 15; color #2c2c28`. **Focus:** `border-color:#0e3b35; box-shadow:0 0 0 3px rgba(14,59,53,.1)`.
- **Labels:** 13/600 `#2c2c28`, 8px below; required asterisk `#c0392b`.
- **Submit:** "Enviar solicitud →" — bg `#0e3b35`, text `#f3f0e9`, 15/700, padding `15px 34px`, radius 6; beside it hint "Los campos con * son obligatorios." (13, `#7a7a72`).
- Placeholders: Juan Pérez / juan@ejemplo.com / +54 11 5555-1234 / San Isidro / 1 / Av. Siempre Viva 742 / "Rubro, tamaño del equipo, qué necesidad querés abordar…".

---

## Interactions & Behavior
- **Form submit:** `preventDefault` → set `sent=true` → replace the form area with a success state: 64px circle (`#0e3b35`/`#7fd0b3`, "✓"), H3 "¡Solicitud enviada!" (Newsreader 34), confirmation paragraph, and an outline "Enviar otra solicitud" button that resets `sent=false`. The left dark panel stays.
- **Validation:** HTML5 `required` on Nombre, Email (type=email), Localidad, Dirección, Cantidad de personas (type=number, min 1). Teléfono and message optional. Wire real validation + submission endpoint in the codebase.
- **Focus states:** teal border + 3px ring on all inputs/textarea (above).
- **Nav / buttons:** add hover states per codebase conventions (e.g. filled buttons darken to `#0a4a40`; links use `#0f6b5c`→`#0a4a40`). Links default color `#0f6b5c`, hover `#0a4a40` (defined globally).
- **Sticky:** Screen 1 right column is `position:sticky; top:24px`.

## State Management
Only the form needs state:
- `sent: boolean` (default false) — toggles form vs. success panel.
- Add field state + submit handler (POST to backend) when implementing for real.
Static content (ejes, related posts, steps) is provided as arrays in the prototype's logic — treat as CMS/props data.

## Responsive Behavior
Prototype is designed at desktop width. For implementation:
- Screen 1 & 3 grids collapse to single column on narrow viewports (stack left over right; form panel above fields).
- Screen 2 already single-column measure — reduce H1 to ~34–40px on mobile, 3-up related grid → 1 column.
- Nav collapses to a hamburger below ~900px.

## Assets
All imagery is **striped placeholder** (`repeating-linear-gradient`) with monospace captions — no real assets bundled. Provide/replace:
- Screen 1: portrait "acompañamiento" image (4:5).
- Screen 2: article opening image (16:7) + 3 related thumbnails (3:2).
- Logo: replace the dot-cluster placeholder mark with the real Clínica para Empresas logo.
- Icons (Instagram, search, arrows, checkmark) — use the codebase's icon set.
Fonts: Newsreader + Hanken Grotesk (Google Fonts) — self-host or use the codebase's font pipeline.

## Files
- `Clinica Foro.dc.html` — the design reference containing all three sections (Servicios, Publicación, Formulario), stacked and labeled 1/2/3. Inline styles hold every value documented above.
