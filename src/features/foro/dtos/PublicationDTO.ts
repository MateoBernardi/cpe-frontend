import type { PublicationImageDTO } from './ImageDTO'
// `Category`'s wire shape is byte-identical to the model (see `dtos/index.ts`'s
// note on collapsed identity pairs) — reused directly instead of a `CategoryDTO`.
import type { Category } from '../models/Category'

/** `interactions` summary embedded in publication DTOs (read-only, aggregated counts). */
export interface InteractionCountsDTO {
  saves?: number
  visits?: number
  favorites?: number
  comments?: number
}

/**
 * The signed-in viewer's own state on this publication. Omitted entirely
 * (not just `false`) when the request is anonymous — the backend only
 * resolves it when there's a session, so `undefined` here means "unknown",
 * never "not favorited".
 */
export interface PublicationViewerStateDTO {
  favorited: boolean
  saved: boolean
}

/** GET /publications/:id — full detail */
export interface PublicationDTO {
  id: number
  title: string
  subtitle?: string | null
  image_url?: string | null
  content: string
  type_id?: number | null
  created_by: string
  /** Resolved author display name. Optional until the backend JOIN lands; nullable for orphaned FKs. */
  created_by_name?: string | null
  created_at: string
  /** Replaces the old `tags`/`category_ids` pair — the single taxonomy now. */
  categories?: Category[]
  interactions?: InteractionCountsDTO
  /** MAP on read: `{ [label]: url }` */
  external_links?: Record<string, string>
  images?: PublicationImageDTO[]
  /** Draft vs. published. Being added on the backend in parallel — optional until it lands. */
  status?: 'draft' | 'published'
  viewer?: PublicationViewerStateDTO
}

/** GET /publications — list item (preview) */
export interface PublicationPreviewDTO {
  id: number
  title: string
  subtitle?: string | null
  image_url?: string | null
  type_id?: number | null
  created_by: string
  /** Same as the detail DTO's field — see there. */
  created_by_name?: string | null
  created_at: string
  /** Replaces the old `tags` — same shape as the detail DTO's `categories`. */
  categories?: Category[]
  interactions?: InteractionCountsDTO
  /**
   * MAP on read: `{ [label]: url }` — mirrors the detail DTO. Optional: the
   * backend may not include it on previews yet, in which case consumers must
   * render nothing (never crash). Surfaced for podcast channel chips.
   */
  external_links?: Record<string, string>
  /** Draft vs. published. Being added on the backend in parallel — optional until it lands. */
  status?: 'draft' | 'published'
  viewer?: PublicationViewerStateDTO
}

/** Query params for GET /publications (all optional; numeric coercion done server-side) */
export interface ListPublicationsQueryDTO {
  type_id?: number
  category_id?: number
  created_by?: string
  limit?: number
  offset?: number
}

/** A single external link, as sent on write (array — asymmetric with the read MAP). */
export interface ExternalLinkWriteDTO {
  label: string
  url: string
}

/** POST/PATCH /publications body. Collection keys are FULL-REPLACE on PATCH. */
export interface PublicationWriteDTO {
  title: string
  subtitle?: string
  front_image_url?: string
  content: string
  type_id?: number
  category_ids?: number[]
  external_links?: ExternalLinkWriteDTO[]
  image_ids?: number[]
  status?: 'draft' | 'published'
}

/**
 * Partial variant for PATCH /publications/:id. `subtitle` / `front_image_url`
 * / `type_id` additionally accept an explicit `null` (backend-supported) so a
 * previously-set value can be cleared — distinct from the key being omitted
 * entirely, which leaves the field unchanged.
 */
export type PublicationPatchDTO = Partial<Omit<PublicationWriteDTO, 'subtitle' | 'front_image_url' | 'type_id'>> & {
  subtitle?: string | null
  front_image_url?: string | null
  type_id?: number | null
}
