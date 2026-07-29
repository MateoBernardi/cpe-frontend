import type { PublicationPreview } from './Publication'
import type { ForoImage } from './ForoImage'

export interface InteractionCounts {
  saves: number | null
  visits: number | null
  favorites: number | null
  comments: number | null
}

/**
 * A single interaction node — a comment (typeId === comentario) or a
 * favorito, on a publication or (via `parentId`) on another comment.
 *
 * Two shapes flow through this one type:
 * - Flat row: the response of a POST/PATCH /interactions call — only the
 *   base fields are meaningful; `replies` is `[]` and the counters are `0`.
 * - Tree node: GET /publications/:id/comments (`useComments`) returns the
 *   full comment tree, so `depth`/`favoritesCount`/`repliesCount`/
 *   `viewerFavorited`/`replies` are all populated. Nesting is capped at
 *   `MAX_COMMENT_DEPTH` (2) server-side — deeper replies get flattened onto
 *   the deepest allowed ancestor, they never arrive pre-nested past that.
 */
export interface Interaction {
  id: number
  publicationId: number
  typeId: number
  /** `null` at the root; otherwise the id of the comment this is a reply to (or a favorito on). */
  parentId: number | null
  /** Nesting level, 0-indexed. `0` on a flat row that isn't actually nested. */
  depth: number
  userId: string | null
  createdBy: string | null
  /** Resolved display name of the commenter/actor (`created_by_name`). `null` for a deleted
   *  user — `CommentList`'s "Miembro del foro" fallback covers that case. */
  authorName: string | null
  content: string | null
  images: ForoImage[]
  createdAt: Date
  updatedAt: Date | null
  favoritesCount: number
  repliesCount: number
  /** Whether the CURRENT viewer already favorited this node — `false` for anonymous viewers. */
  viewerFavorited: boolean
  replies: Interaction[]
}

/** GET /interactions/me — one of the current user's interactions, with the publication it targets. */
export interface MyInteraction {
  id: number
  typeId: number
  content: string | null
  createdAt: Date
  publication: PublicationPreview
}

export interface ListMyInteractionsParams {
  /** Multiple types in one request (e.g. comentario + favorito for the "Interacciones" panel). */
  typeIds: number[]
  limit?: number
  offset?: number
}
