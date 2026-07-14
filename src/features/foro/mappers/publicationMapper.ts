import type { PublicationDTO, PublicationPreviewDTO, PublicationWriteDTO, PublicationPatchDTO } from '../dtos'
import type { Publication, PublicationPreview, PublicationInput, ExternalLink } from '../models'
import { mapInteractionCountsDTO } from './interactionMapper'

function mapExternalLinksMap(map: Record<string, string> | undefined): ExternalLink[] {
  if (!map) return []
  return Object.entries(map).map(([label, url]) => ({ label, url }))
}

export function mapPublicationDTO(dto: PublicationDTO): Publication {
  return {
    id: dto.id,
    title: dto.title,
    subtitle: dto.subtitle ?? null,
    imageUrl: dto.image_url ?? null,
    content: dto.content,
    typeId: dto.type_id ?? null,
    createdBy: dto.created_by,
    createdAt: new Date(dto.created_at),
    tags: dto.tags ?? [],
    categoryIds: dto.category_ids ?? [],
    interactions: mapInteractionCountsDTO(dto.interactions),
    externalLinks: mapExternalLinksMap(dto.external_links),
    images: (dto.images ?? []).map((img) => ({ id: img.id, url: img.url, altText: img.alt_text ?? null })),
  }
}

export function mapPublicationPreviewDTO(dto: PublicationPreviewDTO): PublicationPreview {
  const preview: PublicationPreview = {
    id: dto.id,
    title: dto.title,
    subtitle: dto.subtitle ?? null,
    imageUrl: dto.image_url ?? null,
    typeId: dto.type_id ?? null,
    createdBy: dto.created_by,
    createdAt: new Date(dto.created_at),
    interactions: mapInteractionCountsDTO(dto.interactions),
  }
  // Only surface `externalLinks` when the backend actually sent the map — kept
  // undefined otherwise so consumers can cleanly render nothing (never crash).
  if (dto.external_links) {
    preview.externalLinks = mapExternalLinksMap(dto.external_links)
  }
  return preview
}

/** Model → write DTO (full replace on collection keys, per contract). */
export function mapPublicationInputToWriteDTO(input: PublicationInput): PublicationWriteDTO {
  const dto: PublicationWriteDTO = {
    title: input.title,
    content: input.content,
  }
  if (input.subtitle !== undefined) dto.subtitle = input.subtitle
  if (input.frontImageUrl !== undefined) dto.front_image_url = input.frontImageUrl
  if (input.typeId !== undefined) dto.type_id = input.typeId
  if (input.tagIds !== undefined) dto.tag_ids = input.tagIds
  if (input.categoryIds !== undefined) dto.category_ids = input.categoryIds
  if (input.externalLinks !== undefined) {
    dto.external_links = input.externalLinks.map((l) => ({ label: l.label, url: l.url }))
  }
  if (input.imageIds !== undefined) dto.image_ids = input.imageIds
  return dto
}

export function mapPublicationInputToPatchDTO(input: Partial<PublicationInput>): PublicationPatchDTO {
  const dto: PublicationPatchDTO = {}
  if (input.title !== undefined) dto.title = input.title
  if (input.content !== undefined) dto.content = input.content
  if (input.subtitle !== undefined) dto.subtitle = input.subtitle
  if (input.frontImageUrl !== undefined) dto.front_image_url = input.frontImageUrl
  if (input.typeId !== undefined) dto.type_id = input.typeId
  if (input.tagIds !== undefined) dto.tag_ids = input.tagIds
  if (input.categoryIds !== undefined) dto.category_ids = input.categoryIds
  if (input.externalLinks !== undefined) {
    dto.external_links = input.externalLinks.map((l) => ({ label: l.label, url: l.url }))
  }
  if (input.imageIds !== undefined) dto.image_ids = input.imageIds
  return dto
}
