import type { InteractionDTO, InteractionCountsDTO } from '../dtos'
import type { Interaction, InteractionCounts } from '../models'

export function mapInteractionCountsDTO(dto: InteractionCountsDTO | undefined): InteractionCounts | null {
  if (!dto) return null
  return {
    saves: dto.saves ?? null,
    visits: dto.visits ?? null,
    likes: dto.likes ?? null,
    comments: dto.comments ?? null,
  }
}

export function mapInteractionDTO(dto: InteractionDTO): Interaction {
  return {
    id: dto.id,
    publicationId: dto.publication_id,
    typeId: dto.type_id,
    userId: dto.user_id ?? null,
    createdBy: dto.created_by ?? null,
    content: dto.content ?? null,
    imageIds: dto.image_ids ?? null,
    createdAt: new Date(dto.created_at),
    updatedAt: dto.updated_at ? new Date(dto.updated_at) : null,
  }
}
