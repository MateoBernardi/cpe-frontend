/**
 * GET /publication-types — public, returns a plain array.
 * Seeded rows: Paper, Podcast, Novedad, Discusión.
 * The frontend MUST resolve `type_id` -> name/slug at runtime via this
 * endpoint — never hardcode numeric ids.
 */
export interface PublicationTypeDTO {
  id: number
  name: string
  slug: string
}
