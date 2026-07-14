import type { PublicationTypeDTO, CategoryDTO, TagDTO } from '../dtos'
import type { PublicationType, Category, Tag } from '../models'

export function mapPublicationTypeDTO(dto: PublicationTypeDTO): PublicationType {
  return { id: dto.id, name: dto.name, slug: dto.slug }
}

export function mapCategoryDTO(dto: CategoryDTO): Category {
  return { id: dto.id, name: dto.name, slug: dto.slug }
}

export function mapTagDTO(dto: TagDTO): Tag {
  return { id: dto.id, name: dto.name }
}
