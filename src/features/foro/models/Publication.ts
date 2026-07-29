import type { InteractionCounts } from './Interaction'
import type { ForoImage } from './ForoImage'
import type { Category } from './Category'

export interface ExternalLink {
  label: string
  url: string
}

/** The signed-in viewer's own state on a publication. `null` for anonymous viewers
 *  (the backend omits `viewer` entirely when there's no session — see the mapper). */
export interface PublicationViewerState {
  favorited: boolean
  saved: boolean
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
  /** Resolved display name of the author (`created_by_name` on the wire). `null` when the
   *  backend can't resolve it (deleted user / orphaned FK) — callers fall back to a generic byline. */
  authorName: string | null
  createdAt: Date
  /** The single taxonomy (replaces the old `tags` + `categoryIds` pair on the read side). */
  categories: Category[]
  interactions: InteractionCounts | null
  externalLinks: ExternalLink[]
  images: ForoImage[]
  /** Draft vs. published. Defaults to `'published'` if the backend omits it. */
  status: 'draft' | 'published'
  viewer: PublicationViewerState | null
}

/** List item — GET /publications */
export interface PublicationPreview {
  id: number
  title: string
  subtitle: string | null
  imageUrl: string | null
  typeId: number | null
  createdBy: string
  /** Same as `Publication.authorName` — see there. */
  authorName: string | null
  createdAt: Date
  /** Same shape as `Publication.categories`. `[]` when the backend omits `categories`. */
  categories: Category[]
  interactions: InteractionCounts | null
  /**
   * Channel/external links (e.g. podcast Spotify/Apple/YouTube), mapped from
   * the read MAP. Optional and omitted entirely when the backend preview does
   * not include `external_links` — consumers render nothing in that case.
   */
  externalLinks?: ExternalLink[]
  /** Draft vs. published. Defaults to `'published'` if the backend omits it. */
  status: 'draft' | 'published'
  viewer: PublicationViewerState | null
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
  /** Write-only — full-replace on PATCH, same as the wire contract. There is no `categoryIds`
   *  on the read models above; reads carry resolved `Category[]` instead. */
  categoryIds?: number[]
  externalLinks?: ExternalLink[]
  imageIds?: number[]
  status?: 'draft' | 'published'
}
