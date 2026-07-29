import type { MouseEvent } from 'react'
import type { InteractionCounts, KnownPublicationTypeSlug, Publication, PublicationPreview } from '@features/foro'
import FORO_ENV from '@features/foro/api/foroApiConfig'
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

/**
 * Defence-in-depth against stored XSS via `javascript:`/`data:` URLs.
 * `new URL(url)` alone (the previous check, both here and in the backend's
 * `z.string().url()`) happily parses `javascript:alert(1)` and
 * `data:text/html,<script>…</script>` — those are valid URLs, just not safe
 * ones to put in an `href`. React does not sanitize `href`/`src`, so every
 * render site that puts a user-supplied URL there must check this too, not
 * just the composer's `validateForm` — a row saved before this fix (or
 * written by a direct API call bypassing the client) must not execute.
 * Only `http:`/`https:` are allowed.
 */
export function isSafeHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
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
 * Institutional fallback, used only when the backend couldn't resolve an
 * author name (deleted user / orphaned FK). It is NOT the normal case any
 * more: `created_by_name` is joined server-side, so real publications carry
 * the real person's name.
 */
export const GENERIC_BYLINE = 'Equipo CPE'

/**
 * Byline shown for a publication card/detail — the creator's real name.
 *
 * This used to hide the byline entirely for novedades (treating them as
 * unsigned institutional announcements) and to run a heuristic over
 * `createdBy` to avoid printing a raw Better Auth id. Both are gone: the API
 * now returns `created_by_name`, and every format shows who wrote it.
 */
export function bylineFor(authorName: string | null | undefined): string {
  const trimmed = authorName?.trim()
  return trimmed ? trimmed : GENERIC_BYLINE
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
  return bylineFor(publication.authorName)
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

/** Absolute URL for a publication's detail screen — what a human should end up looking at. */
export function publicationUrl(id: number): string {
  if (typeof window === 'undefined') return `/publicaciones/${id}`
  return `${window.location.origin}/publicaciones/${id}`
}

/**
 * URL handed to the social networks instead of `publicationUrl`.
 *
 * This site is a client-rendered SPA: WhatsApp, LinkedIn, X and friends fetch
 * a shared link with a plain HTTP crawler that never runs JavaScript, so they
 * only ever see `index.html`'s generic site-wide Open Graph tags — every
 * publication would preview identically. The backend's `/publications/:id/share`
 * returns a small HTML document carrying that publication's real og:title /
 * og:description / og:image and then redirects a real browser on to
 * `publicationUrl(id)`.
 *
 * Deliberately NOT used by the "copy link" button: a person pasting a link
 * into a chat should get the clean, readable URL.
 */
export function publicationShareUrl(id: number): string {
  return `${FORO_ENV.API_BASE_URL}/publications/${id}/share`
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
 *
 * Always emits a `youtube-nocookie.com` embed URL (including when the input
 * was already a plain `youtube.com/embed/<id>` URL) — the privacy-enhanced
 * host doesn't set tracking cookies until the viewer presses play, and it's
 * the only YouTube host allow-listed in `index.html`'s CSP `frame-src`.
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
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
  }

  if (host === 'youtube.com') {
    if (parsed.pathname === '/watch') {
      const id = parsed.searchParams.get('v')
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
    }
    if (parsed.pathname.startsWith('/embed/')) {
      const id = parsed.pathname.slice('/embed/'.length).split('/')[0]
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
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

  // "visitas" para todos los formatos, incluido podcast: el contador es el
  // mismo dato (`visits`) en todos, y llamarlo "Reproducciones" en un caso
  // sugería una métrica de reproducción de audio que nadie está midiendo.
  if (counts.visits != null) rows.push({ label: 'Visitas', value: counts.visits })
  if (counts.likes != null) rows.push({ label: 'Me gusta', value: counts.likes })
  if (counts.comments != null) {
    rows.push({ label: slug === 'discusion' ? 'Respuestas' : 'Comentarios', value: counts.comments })
  }
  if (counts.saves != null) rows.push({ label: 'Guardados', value: counts.saves })

  return rows
}
