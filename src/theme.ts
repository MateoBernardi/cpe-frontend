/**
 * ─── CPE Design System / Theme ───
 *
 * Single source of truth for colors, typography, spacing, and layout tokens.
 * Import this file everywhere instead of hardcoding values.
 *
 * Palette (from brand guidelines):
 *   #eeeeee  – light gray
 *   #0db6b4  – teal bright
 *   #01888d  – teal mid
 *   #036f73  – teal deep
 *   #0b6383  – blue mid
 *   #064860  – blue dark
 */

// ─── Color palette ──────────────────────────────────────────────────────────
export const colors = {
  // Brand palette
  lightGray:  '#eeeeee',
  tealBright: '#0db6b4',
  tealMid:    '#01888d',
  tealDeep:   '#036f73',
  blueMid:    '#0b6383',
  blueDark:   '#064860',

  // Neutrals
  white:      '#ffffff',
  black:      '#000000',
  offWhite:   '#f8faf9',

  // Semantic aliases (sections)
  aboutBg:          '#ffffff',
  circuitBg:        '#eeeeee',
  infoPrimaryBg:    '#01888d',
  infoPrimaryText:  '#ffffff',
  infoSecondaryBg:  '#eeeeee',
  secondaryHeroBg:  '#0b6383',
  secondaryHeroText:'#ffffff',
  contactBg:        '#eeeeee',
  footerBg:         '#064860',
  footerText:       '#ffffff',
  headerBgScrolled: '#ffffff',

  // Donut chart palette (brand degradé)
  donut: ['#0db6b4', '#01888d', '#036f73', '#0b6383', '#064860'],
  donutHover: ['#3dc9c7', '#02a0a6', '#048388', '#0d7a9e', '#07597a'],

  // Interactive / accent
  ctaPrimary:      '#01888d',
  ctaPrimaryHover: '#0db6b4',
  ctaGhost:        'rgba(255,255,255,0.10)',
  ctaGhostHover:   'rgba(255,255,255,0.20)',
  ctaShadow:       'rgba(1,136,141,0.30)',

  // Form
  inputBorder:      '#0db6b4',
  inputFocus:       '#01888d',
  inputBg:          '#ffffff',

  // Links & nav
  navDefault:       'rgba(255,255,255,0.75)',
  navHover:         '#ffffff',
  navScrolled:      '#036f73',
  navScrolledHover: '#01888d',

  // Misc UI
  whatsapp:         '#25D366',
  /** Chip de "Borrador": ámbar sólido, deliberadamente fuera de la paleta de marca para que no se confunda con un estado normal. */
  draftBadge:       '#b45309',

  // Secondary pages: alternating accent usage
  secondary: {
    attention:  '#0db6b4', // lighter teal – llamar la atención
    trust:      '#064860', // dark blue – seguridad / confianza
    accent1:    '#01888d',
    accent2:    '#036f73',
    accent3:    '#0b6383',
  },
} as const

/**
 * Acento por tipo de publicación del Foro (papers / CPEVoz / novedades / discusiones).
 * Cada "canal" se distingue por color dentro de la paleta de marca — reemplaza los
 * `--foro-c-*` en oklch del design handoff original.
 */
export const foroAccents = {
  paper:     colors.blueDark,
  podcast:   colors.tealMid,
  novedad:   colors.tealDeep,
  discusion: colors.blueMid,
} as const

/** Hairline compartido por las superficies del Foro — mismo borde plano que usa el hero. */
export const foroHairline = `${colors.blueDark}1f`

/**
 * ─── Foro palette ───
 *
 * The Foro's design-handoff arrived with its own bespoke warm/cream palette
 * (oklch custom properties, later flattened into raw hex literals scattered
 * across the ported components). That palette has been retired in favour of
 * the brand tokens above (`colors.*`, `foroAccents`) and Tailwind's stock
 * gray scale wherever the rewritten Foro components need neutral text/
 * surfaces. What remains here are the handful of values still consumed by
 * `ForoAuthDialog` (owned by the `features/foro` data-layer module, out of
 * this rewrite's scope) — kept so that dialog keeps compiling unchanged.
 */
export const foroPalette = {
  // Text
  ink:       '#17242a', // body copy on light surfaces
  muted:     '#5c6f74', // meta text — secondary copy
  mutedSoft: '#849399', // lowest-emphasis text — separators

  // Warm neutral surface (auth dialog tab strip)
  surfaceAlt: '#eae9e4',
  line:       '#d8d5cc',

  // Teal tint on light surfaces (hover fills)
  tealTint: '#e3f0f0',

  // Modal backdrop, ~55% black
  scrim: `${colors.black}8c`,

  // Status — functional, not brand-mapped (an error stays legibly red regardless of palette)
  errorBg:   '#fce8e6',
  errorText: '#b3261e',
} as const

/**
 * Colors that encode third-party brand identity (Spotify / YouTube marks) —
 * kept exactly as those brands specify, never swapped for the site's own
 * palette. Most usages still appear as raw Tailwind arbitrary values in
 * their components regardless: `hover:`/pseudo-class utilities can't read a
 * JS constant, and CSS-var indirection would add behaviour this port isn't
 * meant to change. This group exists so the values are named and
 * documented in one place rather than silently duplicated.
 */
export const platformColors = {
  spotifyGreen:       '#1db954', // <SpotifyLink>'s wordmark + hover border (raw literal at the two Tailwind hover call sites)
  youtubeRed:         '#FF0000', // <YouTubeMark>'s badge fill
  youtubeDarkBg:      '#0f0f0f', // YouTube-labeled CTA buttons (raw literal — Tailwind `bg-[]`/`hover:bg-[]` pair)
  youtubeDarkBgHover: '#282828',

  // Los cuatro colores de la "G" de Google, en el orden en que los usa el
  // logo oficial. Van fijos (no `currentColor`) porque el mark es multicolor
  // por definición: recolorearlo dejaría de ser el logo de Google, y las
  // guidelines de "Sign in with Google" exigen usarlo tal cual.
  googleYellow: '#FFC107',
  googleRed:    '#FF3D00',
  googleGreen:  '#4CAF50',
  googleBlue:   '#1976D2',
} as const

// ─── Typography ─────────────────────────────────────────────────────────────
// Using system-available equivalents: sans-serif for DM Sans, serif for Lora
export const fonts = {
  primary: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
  secondary: "Georgia, 'Times New Roman', serif",
} as const

export const fontSizes = {
  xs:   '0.75rem',   // 12px
  sm:   '0.875rem',  // 14px
  base: '1rem',      // 16px
  lg:   '1.125rem',  // 18px
  xl:   '1.25rem',   // 20px
  '2xl':'1.5rem',    // 24px
  '3xl':'1.875rem',  // 30px
  '4xl':'2.25rem',   // 36px
  '5xl':'3rem',      // 48px
  '6xl':'3.75rem',   // 60px
} as const

// ─── Layout / Spacing (vh-based containers) ─────────────────────────────────
export const layout = {
  /** Full-viewport section */
  sectionFull: 'min-h-screen',
  /** Standard section padding using vh */
  sectionPadY: 'py-[6vh] sm:py-[8vh] md:py-[10vh]',
  /** Compact section padding */
  sectionPadYCompact: 'py-[4vh] sm:py-[5vh] md:py-[6vh]',
  /** Max-width container */
  container: 'mx-auto max-w-7xl px-[4vw] sm:px-[3vw] lg:px-[2vw]',
  /** Narrow container for text-centric layouts */
  containerNarrow: 'mx-auto max-w-4xl px-[4vw] sm:px-[3vw]',
  /** Wide container */
  containerWide: 'mx-auto max-w-screen-2xl px-[4vw] sm:px-[3vw]',

  /** Standard gap between grid items */
  gridGap: 'gap-[3vh] sm:gap-[4vh] lg:gap-[5vh]',
  /** Section heading margin bottom */
  headingMb: 'mb-[3vh] sm:mb-[4vh] md:mb-[6vh]',
} as const

// ─── Transitions ────────────────────────────────────────────────────────────
export const transitions = {
  sectionEntry: 'transition-all duration-700',
  sectionEntryLong: 'transition-all duration-1000',
  hover: 'transition-all duration-300',
  color: 'transition-colors duration-300',
} as const

// ─── Border radius ──────────────────────────────────────────────────────────
export const radii = {
  card: 'rounded-2xl',
  button: 'rounded-xl',
  pill: 'rounded-full',
  input: 'rounded-lg',
} as const

// ─── Shadows ────────────────────────────────────────────────────────────────
export const shadows = {
  card: 'shadow-lg',
  cardHover: 'shadow-xl',
  button: 'shadow-md',
} as const

// ── Tailwind class helpers that reference theme colors (for inline usage) ───
// These use Tailwind arbitrary values: bg-[#hex], text-[#hex], etc.
export const tw = {
  // Backgrounds
  bgLightGray:      `bg-[${colors.lightGray}]`,
  bgTealBright:     `bg-[${colors.tealBright}]`,
  bgTealMid:        `bg-[${colors.tealMid}]`,
  bgTealDeep:       `bg-[${colors.tealDeep}]`,
  bgBlueMid:        `bg-[${colors.blueMid}]`,
  bgBlueDark:       `bg-[${colors.blueDark}]`,
  bgWhite:          'bg-white',
  bgOffWhite:       `bg-[${colors.offWhite}]`,

  // Text
  textWhite:        'text-white',
  textBlack:        'text-black',
  textLightGray:    `text-[${colors.lightGray}]`,
  textTealBright:   `text-[${colors.tealBright}]`,
  textTealMid:      `text-[${colors.tealMid}]`,
  textTealDeep:     `text-[${colors.tealDeep}]`,
  textBlueMid:      `text-[${colors.blueMid}]`,
  textBlueDark:     `text-[${colors.blueDark}]`,

  // Borders
  borderTealBright: `border-[${colors.tealBright}]`,
  borderTealMid:    `border-[${colors.tealMid}]`,
  borderTealDeep:   `border-[${colors.tealDeep}]`,

  // Ring
  ringTealBright:   `ring-[${colors.tealBright}]`,

  // Accents
  accentTealMid:    `accent-[${colors.tealMid}]`,
} as const

export default {
  colors,
  fonts,
  fontSizes,
  layout,
  transitions,
  radii,
  shadows,
  tw,
}
