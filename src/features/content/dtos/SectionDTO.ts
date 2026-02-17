import type { PublicTextDTO, AdminTextDTO } from './TextDTO'
import type { PublicMediaDTO, AdminMediaDTO } from './MediaDTO'

/** GET /content/sections/public/:name */
export interface PublicSectionDTO {
  id: number
  name: string
  texts: PublicTextDTO[]
  media: PublicMediaDTO[]
}

export interface PublicSectionResponseDTO {
  section: PublicSectionDTO
}

/** GET /content/sections/:id (admin) */
export interface AdminSectionDTO {
  id: number
  name: string
  texts: AdminTextDTO[]
  media: AdminMediaDTO[]
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
