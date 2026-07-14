import type { KnownPublicationTypeSlug } from '@features/foro'

/** Maps a resolved publication-type slug to the design system's category accent class. */
export function typeSlugToCatClass(slug: KnownPublicationTypeSlug | null): string {
  switch (slug) {
    case 'paper': return 'foro-cat-papers'
    case 'podcast': return 'foro-cat-podcasts'
    case 'novedad': return 'foro-cat-novedades'
    case 'discusion': return 'foro-cat-foros'
    default: return ''
  }
}

export function typeSlugToCssVar(slug: KnownPublicationTypeSlug | null): string {
  switch (slug) {
    case 'paper': return 'var(--foro-c-papers)'
    case 'podcast': return 'var(--foro-c-podcasts)'
    case 'novedad': return 'var(--foro-c-novedades)'
    case 'discusion': return 'var(--foro-c-foros)'
    default: return 'var(--foro-teal)'
  }
}

/**
 * Editorial "channel" eyebrow shown above each feed strip's heading — a short
 * journal-style descriptor per category, rendered in the category accent color.
 */
export function typeSlugChannelLabel(slug: KnownPublicationTypeSlug | null): string {
  switch (slug) {
    case 'paper': return 'Investigación'
    case 'podcast': return 'Audio'
    case 'novedad': return 'Actualidad'
    case 'discusion': return 'Comunidad'
    default: return 'Foro'
  }
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
