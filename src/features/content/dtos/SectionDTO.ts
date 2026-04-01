import type { BlockDTO, PublicBlockDTO } from './BlockDTO'

/** GET /public/sections/:name */
export interface PublicSectionDTO {
  id: number
  name: string
  blocks: PublicBlockDTO[]
}

export interface PublicSectionResponseDTO {
  section: PublicSectionDTO
}

/** GET /content/sections/:id (admin) */
export interface AdminSectionDTO {
  id: number
  name: string
  blocks: BlockDTO[]
}

export interface AdminSectionResponseDTO {
  section: AdminSectionDTO
}

/** GET /content/sections (lista) */
export interface SectionListItemDTO {
  id: number
  name: string
}

export interface SectionListResponseDTO {
  sections: SectionListItemDTO[]
}
