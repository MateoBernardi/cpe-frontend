import type { PublicationDTO, PublicationPreviewDTO, PublicationWriteDTO, PublicationPatchDTO, MyInteractionDTO } from '../dtos'
import type { Publication, PublicationPreview, PublicationInput, ExternalLink, MyInteraction } from '../models'
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
    status: dto.status ?? 'published',
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
    status: dto.status ?? 'published',
  }
  // Only surface `externalLinks` when the backend actually sent the map — kept
  // undefined otherwise so consumers can cleanly render nothing (never crash).
  if (dto.external_links) {
    preview.externalLinks = mapExternalLinksMap(dto.external_links)
  }
  return preview
}

/**
 * GET /interactions/me — lives here (not in interactionMapper.ts) so it can
 * reuse this file's own mapPublicationPreviewDTO without creating a circular
 * value import between publicationMapper.ts and interactionMapper.ts.
 */
export function mapMyInteractionDTO(dto: MyInteractionDTO): MyInteraction {
  return {
    id: dto.id,
    typeId: dto.type_id,
    content: dto.content,
    createdAt: new Date(dto.created_at),
    publication: mapPublicationPreviewDTO(dto.publication),
  }
}

/**
 * Model → write DTO (full replace on collection keys, per contract).
 * `subtitle` / `frontImageUrl` / `typeId` are `?: string | number | null` on
 * the model (so the composer can represent "cleared"), but on CREATE there is
 * nothing to clear — `null` and `undefined` both simply mean "not set", so
 * both are omitted from the POST body.
 */
export function mapPublicationInputToWriteDTO(input: PublicationInput): PublicationWriteDTO {
  const dto: PublicationWriteDTO = {
    title: input.title,
    content: input.content,
  }
  if (input.subtitle != null) dto.subtitle = input.subtitle
  if (input.frontImageUrl != null) dto.front_image_url = input.frontImageUrl
  if (input.typeId != null) dto.type_id = input.typeId
  if (input.tagIds !== undefined) dto.tag_ids = input.tagIds
  if (input.categoryIds !== undefined) dto.category_ids = input.categoryIds
  if (input.externalLinks !== undefined) {
    dto.external_links = input.externalLinks.map((l) => ({ label: l.label, url: l.url }))
  }
  if (input.imageIds !== undefined) dto.image_ids = input.imageIds
  if (input.status !== undefined) dto.status = input.status
  return dto
}

/**
 * Model → PATCH DTO. `subtitle` / `frontImageUrl` / `typeId` are clearable:
 * an explicit `null` on the input (the composer emptying a previously-set
 * field) must reach the PATCH body as an explicit `null` so the backend
 * clears it — omitting the key instead would leave the old value in place.
 * `undefined` still means "untouched" and is omitted, matching every other
 * field here.
 */
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
  if (input.status !== undefined) dto.status = input.status
  return dto
}
