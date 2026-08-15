import type { InteractionCounts } from './Interaction'
import type { ForoImage } from './ForoImage'
import type { Category } from './Category'

export interface ExternalLink {
  label: string
  url: string
}

/**
 * Lifecycle state, mirroring the backend's `publicacion_status` enum. Only `published` is
 * publicly readable — the rest are visible to the author (and admins) alone, so they can show
 * up on `/perfil/publicaciones` but never on a public list.
 *
 * `under_review` / `approved` are the visitor-submission review states: a visitor's paper/
 * discusión enters `under_review`, a publisher reviews it (leaving corrections — see
 * `Correction.ts`) and sets `approved`, and only then may the author confirm into `published`.
 * Publisher-authored publications never pass through either — they keep the direct
 * draft/published flow.
 */
export type PublicationStatus = 'published' | 'draft' | 'archived' | 'pending' | 'under_review' | 'approved'

/**
 * The subset a client may actually SET. `pending` (en moderación) and `archived` are
 * server-assigned: the backend's Zod schema rejects them in a POST/PATCH body, so the composer
 * must not be able to construct one. `under_review`/`approved` ARE client-settable, but only by
 * the right actor in the right prior state — the backend's service layer enforces who may set
 * what (visitor → `under_review`/`published`-from-`approved`; publisher → `approved`-from-
 * `under_review`), same "explicit rejection, not silent coercion" style as the other two.
 */
export type WritablePublicationStatus = Extract<PublicationStatus, 'draft' | 'published' | 'under_review' | 'approved'>

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
  /** Defaults to `'published'` if the backend omits it. See `PublicationStatus`. */
  status: PublicationStatus
  viewer: PublicationViewerState | null
  /** Id of the published publication this row is a revision draft of, `null` in the normal case
   *  (`revision_of` on the wire). */
  revisionOf: number | null
  /** Id of THIS publication's own open revision draft, `null` when there is none or the viewer is
   *  anonymous (`revision_id` on the wire). */
  revisionId: number | null
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
  /** Defaults to `'published'` if the backend omits it. See `PublicationStatus`. */
  status: PublicationStatus
  viewer: PublicationViewerState | null
  /** Same as `Publication.revisionOf` — see there. */
  revisionOf: number | null
  /** Id of THIS publication's own open revision draft, `null` when there is none or the viewer is
   *  anonymous (`revision_id` on the wire). */
  revisionId: number | null
  /** Same asymmetry as `revisionId`: `false` unless the caller is looking at their own listing
   *  (`has_corrections` on the wire). `true` means a publisher left feedback while this was
   *  `under_review` — see `ReviewCorrectionsPanel.tsx`, the only place that renders it. */
  hasCorrections: boolean
}

export interface ListPublicationsParams {
  typeId?: number
  categoryId?: number
  createdBy?: string
  limit?: number
  offset?: number
  /**
   * Publisher-only, deliberate exception to the "reads never leak other users' drafts" rule:
   * `status: 'under_review'` asks the backend for every author's pending-review submissions
   * (the reviewer queue), not just the caller's own. Any other value is ignored server-side —
   * see `RevisionesPanel.tsx`, the only caller.
   */
  status?: WritablePublicationStatus
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
  /** Only the writable subset — see `WritablePublicationStatus`. */
  status?: WritablePublicationStatus
  /** Write-only, CREATE only — mints a separate revision draft of the published publication with
   *  this id instead of a standalone publication. See `Publication.revisionOf`. */
  revisionOf?: number
}
