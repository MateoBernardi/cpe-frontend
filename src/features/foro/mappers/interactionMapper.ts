import type { InteractionDTO, InteractionCountsDTO } from '../dtos'
import type { Interaction, InteractionCounts } from '../models'

export function mapInteractionCountsDTO(dto: InteractionCountsDTO | undefined): InteractionCounts | null {
  if (!dto) return null
  return {
    saves: dto.saves ?? null,
    visits: dto.visits ?? null,
    favorites: dto.favorites ?? null,
    comments: dto.comments ?? null,
  }
}

/**
 * Recursive: the comment tree (`GET /publications/:id/comments`) nests
 * `replies` up to `MAX_COMMENT_DEPTH` (2) server-side, so this walks the
 * whole subtree. A flat row (POST/PATCH /interactions response) simply has
 * no `replies` and maps to `depth: 0`, `favoritesCount: 0`, etc.
 */
export function mapInteractionDTO(dto: InteractionDTO): Interaction {
  return {
    id: dto.id,
    publicationId: dto.publication_id,
    typeId: dto.type_id,
    parentId: dto.parent_id ?? null,
    depth: dto.depth ?? 0,
    userId: dto.user_id ?? null,
    createdBy: dto.created_by ?? null,
    authorName: dto.created_by_name ?? null,
    content: dto.content ?? null,
    images: (dto.images ?? []).map((img) => ({ id: img.id, url: img.url, altText: img.alt_text ?? null })),
    createdAt: new Date(dto.created_at),
    updatedAt: dto.updated_at ? new Date(dto.updated_at) : null,
    favoritesCount: dto.favorites_count ?? 0,
    repliesCount: dto.replies_count ?? 0,
    viewerFavorited: dto.viewer_favorited ?? false,
    replies: (dto.replies ?? []).map(mapInteractionDTO),
  }
}
