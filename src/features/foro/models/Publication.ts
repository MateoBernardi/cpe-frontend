import type { InteractionCounts } from './Interaction'
import type { ForoImage } from './ForoImage'

export interface ExternalLink {
  label: string
  url: string
}

/** Full publication detail — GET /publications/:id */
export interface Publication {
  id: number
  title: string
  subtitle: string | null
  imageUrl: string | null
  content: string
  typeId: number | null
  createdBy: string
  createdAt: Date
  tags: string[]
  categoryIds: number[]
  interactions: InteractionCounts | null
  externalLinks: ExternalLink[]
  images: ForoImage[]
}

/** List item — GET /publications */
export interface PublicationPreview {
  id: number
  title: string
  subtitle: string | null
  imageUrl: string | null
  typeId: number | null
  createdBy: string
  createdAt: Date
  interactions: InteractionCounts | null
  /**
   * Channel/external links (e.g. podcast Spotify/Apple/YouTube), mapped from
   * the read MAP. Optional and omitted entirely when the backend preview does
   * not include `external_links` — consumers render nothing in that case.
   */
  externalLinks?: ExternalLink[]
}

export interface ListPublicationsParams {
  typeId?: number
  categoryId?: number
  limit?: number
  offset?: number
}

export interface PublicationInput {
  title: string
  subtitle?: string
  frontImageUrl?: string
  content: string
  typeId?: number
  tagIds?: number[]
  categoryIds?: number[]
  externalLinks?: ExternalLink[]
  imageIds?: number[]
}
