export interface PublicationType {
  id: number
  name: string
  slug: string
}

/**
 * Well-known slugs seeded by the backend. Used only to select which detail
 * template variant renders — the actual `id` is always resolved at runtime
 * via `GET /publication-types`, never hardcoded.
 */
export type KnownPublicationTypeSlug = 'paper' | 'podcast' | 'novedad' | 'discusion'

export function resolveKnownSlug(type: PublicationType | undefined | null): KnownPublicationTypeSlug | null {
  if (!type) return null
  const slug = type.slug.toLowerCase()
  if (slug.includes('paper')) return 'paper'
  if (slug.includes('podcast')) return 'podcast'
  if (slug.includes('novedad')) return 'novedad'
  if (slug.includes('discus')) return 'discusion'
  return null
}
