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
  /** Draft vs. published. Defaults to `'published'` if the backend omits it. */
  status: 'draft' | 'published'
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
  /** Draft vs. published. Defaults to `'published'` if the backend omits it. */
  status: 'draft' | 'published'
}

export interface ListPublicationsParams {
  typeId?: number
  categoryId?: number
  createdBy?: string
  limit?: number
  offset?: number
}

export interface PublicationInput {
  title: string
  /** `null` explicitly clears the field on PATCH; `undefined` leaves it unset/unchanged. */
  subtitle?: string | null
  /** `null` explicitly clears the field on PATCH; `undefined` leaves it unset/unchanged. */
  frontImageUrl?: string | null
  content: string
  /** `null` explicitly clears the field on PATCH; `undefined` leaves it unset/unchanged. */
  typeId?: number | null
  tagIds?: number[]
  categoryIds?: number[]
  externalLinks?: ExternalLink[]
  imageIds?: number[]
  status?: 'draft' | 'published'
}
