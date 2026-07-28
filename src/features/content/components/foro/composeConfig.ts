import type { KnownPublicationTypeSlug } from '@features/foro'

/**
 * Per-type composer field configuration — mirrors the ONE backend create
 * schema (all fields exist for every publication type); the UI just chooses
 * which ones to show/require per type. Shared by the publisher form and its
 * preview pane so both stay in sync with the same rules.
 *
 * Novedad is promotional (a couple of images or a video, not a long-form
 * article): multi-image cover instead of a single one, and its body is
 * labeled "Texto promocional" though it still maps to the same `content`
 * field the backend requires for every type. Discusión has no cover,
 * subtitle, external links or tags — it's a conversation starter.
 */
export type CoverMode = 'single' | 'multi' | 'none'

export interface TypeFieldConfig {
  name: string
  bodyLabel: string
  showSubtitle: boolean
  coverMode: CoverMode
  showLinks: boolean
  showTags: boolean
  /** Editorial "channel" descriptor shown next to the type picker card. */
  channelLabel: string
  /** Overrides the generic label-based links hint for types whose embed
   * detection works differently (novedad's is URL-based, not label-based). */
  linksHint?: string
}

/** The 4 well-known types, in picker order. */
export const TYPE_OPTIONS: { slug: KnownPublicationTypeSlug; name: string }[] = [
  { slug: 'paper', name: 'Paper' },
  { slug: 'podcast', name: 'Podcast' },
  { slug: 'novedad', name: 'Novedad' },
  { slug: 'discusion', name: 'Discusión' },
]

export const MAX_NOVEDAD_IMAGES = 4

export const TYPE_CONFIG: Record<KnownPublicationTypeSlug, TypeFieldConfig> = {
  paper: {
    name: 'Paper',
    bodyLabel: 'Cuerpo',
    showSubtitle: true,
    coverMode: 'single',
    showLinks: true,
    showTags: true,
    channelLabel: 'Investigación',
  },
  podcast: {
    name: 'Podcast',
    bodyLabel: 'Descripción',
    showSubtitle: true,
    coverMode: 'single',
    showLinks: true,
    showTags: true,
    channelLabel: 'Audio',
  },
  novedad: {
    name: 'Novedad',
    bodyLabel: 'Texto promocional',
    showSubtitle: true,
    coverMode: 'multi',
    showLinks: true,
    showTags: true,
    channelLabel: 'Actualidad',
    linksHint: 'Un enlace de YouTube se muestra como video embebido.',
  },
  discusion: {
    name: 'Discusión',
    bodyLabel: 'Descripción',
    showSubtitle: false,
    coverMode: 'none',
    showLinks: false,
    showTags: false,
    channelLabel: 'Comunidad',
  },
}
