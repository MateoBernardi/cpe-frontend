import type { KnownPublicationTypeSlug } from '@features/foro'

export interface InteraccionSection {
  /** Segmento de URL: /interacciones/<path> */
  path: string
  /** Etiqueta visible en la nav y en el encabezado de la sección. */
  label: string
  /** Slug del tipo de publicación en el backend del Foro. */
  slug: KnownPublicationTypeSlug
}

/**
 * Las cuatro secciones del menú "Interacciones", en orden de aparición.
 *
 * Única fuente de verdad compartida por la nav (`MainLayout`), el router de la
 * app main y las páginas del Foro: los `type_id` nunca se hardcodean, se
 * resuelven en runtime contra `GET /publication-types` haciendo match del slug.
 */
export const INTERACCIONES_SECTIONS: readonly InteraccionSection[] = [
  { path: 'cpevoz', label: 'CPEVoz', slug: 'podcast' },
  { path: 'discusiones', label: 'Discusiones', slug: 'discusion' },
  { path: 'papers', label: 'Papers', slug: 'paper' },
  { path: 'novedades', label: 'Novedades', slug: 'novedad' },
] as const

export function findInteraccionSection(path: string | undefined): InteraccionSection | undefined {
  return INTERACCIONES_SECTIONS.find((section) => section.path === path)
}

/**
 * Ruta de la vista de un tipo de publicación. No existe una vista "todas las
 * publicaciones": cada formato tiene la suya, así que un detalle siempre vuelve
 * a la sección de su propio tipo.
 */
export function interaccionRouteForSlug(slug: KnownPublicationTypeSlug | null | undefined): string {
  const section = INTERACCIONES_SECTIONS.find((s) => s.slug === slug)
  return `/interacciones/${(section ?? INTERACCIONES_SECTIONS[0]).path}`
}

/** Destino de fallback cuando la URL no identifica una sección válida. */
export const DEFAULT_INTERACCION_ROUTE = `/interacciones/${INTERACCIONES_SECTIONS[0].path}`
