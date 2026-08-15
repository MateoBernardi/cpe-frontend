import type { CorrectionDTO, CreateCorrectionDTO } from '../dtos'
import type { Correction, CreateCorrectionInput } from '../models'

export function mapCorrectionDTO(dto: CorrectionDTO): Correction {
  return {
    id: dto.id,
    publicationId: dto.publication_id,
    reviewerId: dto.reviewer_id,
    reviewerName: dto.reviewer_name ?? null,
    paragraphIndex: dto.paragraph_index,
    body: dto.body,
    createdAt: new Date(dto.created_at),
  }
}

export function mapCreateCorrectionInputToDTO(input: CreateCorrectionInput): CreateCorrectionDTO {
  return {
    publication_id: input.publicationId,
    paragraph_index: input.paragraphIndex,
    body: input.body,
  }
}
