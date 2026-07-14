import type { InteractionCounts, KnownPublicationTypeSlug } from '@features/foro'

interface Row { label: string; value: number }

/**
 * Maps the DTO's generic `{saves, visits, likes, comments}` counters to
 * Spanish labels appropriate for the publication type — same fields, just
 * localized wording (podcasts call `visits` "Reproducciones", etc). Rows are
 * omitted entirely when the underlying field is null/undefined — never
 * fabricated.
 */
export function interactionRows(counts: InteractionCounts | null, slug: KnownPublicationTypeSlug | null): Row[] {
  if (!counts) return []
  const rows: Row[] = []

  const visitsLabel = slug === 'podcast' ? 'Reproducciones' : slug === 'discusion' ? 'Vistas' : 'Vistas'
  if (counts.visits != null) rows.push({ label: visitsLabel, value: counts.visits })
  if (counts.likes != null) rows.push({ label: 'Me gusta', value: counts.likes })
  if (counts.comments != null) {
    rows.push({ label: slug === 'discusion' ? 'Respuestas' : 'Comentarios', value: counts.comments })
  }
  if (counts.saves != null) rows.push({ label: 'Guardados', value: counts.saves })

  return rows
}
