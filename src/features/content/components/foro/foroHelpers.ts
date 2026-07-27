import type { MouseEvent } from 'react'
import type { InteractionCounts, KnownPublicationTypeSlug, Publication, PublicationPreview } from '@features/foro'
import { foroAccents } from '../../../../theme'

/**
 * Maps a resolved publication-type slug to its Foro accent color
 * (`foroAccents` in `theme.ts`) — replaces the old `--foro-c-*` oklch
 * custom properties / `typeSlugToCssVar` + `typeSlugToCatClass` pair.
 */
export function typeAccent(slug: KnownPublicationTypeSlug | null): string {
  switch (slug) {
    case 'paper': return foroAccents.paper
    case 'podcast': return foroAccents.podcast
    case 'novedad': return foroAccents.novedad
    case 'discusion': return foroAccents.discusion
    default: return foroAccents.podcast
  }
}

/** `#rrggbb` + alpha (0–1) becomes `rgba(r, g, b, a)`. Only accepts the theme's plain 6-digit hex tokens. */
export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const MONTHS_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/** Relative/short date formatting: "Hoy", "Ayer", "hace N días", "jun 2026". */
export function formatForoDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `hace ${diffDays} días`

  const month = MONTHS_ES[date.getMonth()]
  return `${month} ${date.getFullYear()}`
}

export function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

/**
 * `createdBy` is a raw backend user id, never joined to a human name by the
 * API (e.g. `"s4SQKY9ela9Uh2sU2UVzahs0yeJQzKAN"`) — it must never be rendered
 * verbatim. This heuristic recognizes that opaque-id shape (long, no spaces,
 * mixed alphanumerics) and returns `null` for it so callers fall back to a
 * generic byline. Demo/preview data that carries an actual human name
 * (contains a space) passes through untouched.
 */
const OPAQUE_ID_RE = /^[A-Za-z0-9_-]{16,}$/
export function displayByline(createdBy: string | null | undefined): string | null {
  if (!createdBy) return null
  const trimmed = createdBy.trim()
  if (!trimmed) return null
  if (!trimmed.includes(' ') && OPAQUE_ID_RE.test(trimmed)) return null
  return trimmed
}

/** Generic institutional byline used whenever `createdBy` resolves to "no author" (see `displayByline`). */
export const GENERIC_BYLINE = 'Equipo CPE'

/**
 * Byline shown for a publication card/detail: `null` for novedades (they're
 * institutional announcements, never authored — existing rule), otherwise
 * the real name when `displayByline` can extract one, falling back to the
 * generic institutional byline instead of ever rendering a raw id.
 */
export function bylineFor(createdBy: string, slug: KnownPublicationTypeSlug | null): string | null {
  if (slug === 'novedad') return null
  return displayByline(createdBy) ?? GENERIC_BYLINE
}

/**
 * The detail hero's secondary meta slot (clock icon), per format:
 *  - discusión: reply count when the backend sent one, else a generic
 *    "Ver conversación" label — never a fabricated number.
 *  - every other format (paper / novedad / podcast): always `null` — the
 *    slot is only meaningful for discusiones.
 */
export function heroMetaValue(slug: KnownPublicationTypeSlug | null, publication: Publication): string | null {
  switch (slug) {
    case 'discusion': {
      const n = publication.interactions?.comments
      return n != null && n > 0 ? `${n} respuestas` : 'Ver conversación'
    }
    default:
      return null
  }
}

/**
 * The same meta slot for list/preview cards, where `PublicationPreview` has
 * no `content` field (so reading time cannot be derived) — falls back to the
 * byline, or the reply count for discusiones. Returns `null` when nothing
 * real backs it (never renders a placeholder).
 */
export function previewMetaLine(slug: KnownPublicationTypeSlug | null, publication: PublicationPreview): string | null {
  if (slug === 'discusion') {
    const n = publication.interactions?.comments
    return n != null && n > 0 ? `${n} respuestas` : 'Ver conversación'
  }
  return bylineFor(publication.createdBy, slug)
}

/** "Últimas novedades" / "Últimos papers" / "Últimos episodios" / "Últimas discusiones". */
export function latestListHeading(slug: KnownPublicationTypeSlug | null): string {
  switch (slug) {
    case 'paper': return 'Últimos papers'
    case 'podcast': return 'Últimos episodios'
    case 'discusion': return 'Últimas discusiones'
    case 'novedad': return 'Últimas novedades'
    default: return 'Últimas publicaciones'
  }
}

/** "Compartir este paper" / "...este episodio" / "...esta novedad" / "...esta discusión". */
export function shareCardTitle(slug: KnownPublicationTypeSlug | null): string {
  switch (slug) {
    case 'paper': return 'Compartir este paper'
    case 'podcast': return 'Compartir este episodio'
    case 'discusion': return 'Compartir esta discusión'
    case 'novedad': return 'Compartir esta novedad'
    default: return 'Compartir esta publicación'
  }
}

/** Absolute URL for a publication's detail screen — used by the share links. */
export function publicationUrl(id: number): string {
  if (typeof window === 'undefined') return `/publicaciones/${id}`
  return `${window.location.origin}/publicaciones/${id}`
}

/**
 * Novedad-only helper: detects a YouTube link among a publication's
 * `external_links` and turns it into an embeddable URL. Recognizes the
 * three common share/link shapes:
 *   - youtube.com/watch?v=<id>
 *   - youtu.be/<id>
 *   - youtube.com/embed/<id> (already an embed URL)
 * Anything else (Spotify, a plain "sitio web" link, a non-YouTube video
 * host…) returns `null` so callers fall back to the existing
 * `<ExternalLinksCTA>` chip idiom instead of trying to embed it.
 */
export function getYouTubeEmbedUrl(url: string): string | null {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }

  const host = parsed.hostname.replace(/^www\./, '').replace(/^m\./, '')

  if (host === 'youtu.be') {
    const id = parsed.pathname.slice(1).split('/')[0]
    return id ? `https://www.youtube.com/embed/${id}` : null
  }

  if (host === 'youtube.com') {
    if (parsed.pathname === '/watch') {
      const id = parsed.searchParams.get('v')
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    if (parsed.pathname.startsWith('/embed/')) {
      return url
    }
  }

  return null
}

/**
 * Per-type verb for a "go to detail" CTA. Unused by this rewrite's own
 * components (the new cards use a plain arrow glyph instead of a verb), but
 * kept exported — `ForoPreviewSection.tsx` (home page, owned by another
 * in-flight redesign, out of this rewrite's scope) still imports it.
 */
export function heroCtaVerb(slug: KnownPublicationTypeSlug | null): string {
  switch (slug) {
    case 'podcast': return 'Escuchar episodio'
    case 'discusion': return 'Participar'
    case 'novedad': return 'Ver más'
    default: return 'Leer más'
  }
}

/**
 * `onMouseEnter`/`onMouseLeave` pair that swaps a solid `backgroundColor`
 * between a base and hover token — the site's established way of doing a
 * brand-exact button hover (see `ServiceDetailSection`'s CTA), since
 * Tailwind's `hover:` utility can't read a JS/theme constant directly.
 */
export function hoverBgSwap(base: string, hover: string) {
  return {
    onMouseEnter: (e: MouseEvent<HTMLElement>) => { e.currentTarget.style.backgroundColor = hover },
    onMouseLeave: (e: MouseEvent<HTMLElement>) => { e.currentTarget.style.backgroundColor = base },
  }
}

interface InteractionRow { label: string; value: number }

/**
 * Maps the DTO's generic `{saves, visits, likes, comments}` counters to
 * Spanish labels appropriate for the publication type — same fields, just
 * localized wording (podcasts call `visits` "Reproducciones", etc). Rows are
 * omitted entirely when the underlying field is null/undefined — never
 * fabricated.
 */
export function interactionRows(counts: InteractionCounts | null, slug: KnownPublicationTypeSlug | null): InteractionRow[] {
  if (!counts) return []
  const rows: InteractionRow[] = []

  const visitsLabel = slug === 'podcast' ? 'Reproducciones' : 'Vistas'
  if (counts.visits != null) rows.push({ label: visitsLabel, value: counts.visits })
  if (counts.likes != null) rows.push({ label: 'Me gusta', value: counts.likes })
  if (counts.comments != null) {
    rows.push({ label: slug === 'discusion' ? 'Respuestas' : 'Comentarios', value: counts.comments })
  }
  if (counts.saves != null) rows.push({ label: 'Guardados', value: counts.saves })

  return rows
}
