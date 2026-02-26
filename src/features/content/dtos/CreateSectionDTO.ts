import type { BlockDTO } from './BlockDTO'
import type { AssignMediaInput } from './GalleryDTO'

/** POST /content/sections/:sectionId/content */
export interface CreateTextInput {
  body: string
  role?: string
  order?: number
}

export interface CreateMediaInput {
  url: string
  mime_type: string
  title?: string
  role?: string
  order?: number
}

export interface AddSectionContentDTO {
  texts?: CreateTextInput[]
  media?: CreateMediaInput[]
  /** Asignar medias existentes (por media_id) a esta sección */
  assign_media?: AssignMediaInput[]
}

/** Respuesta de POST /content/sections/:sectionId/content */
export interface AddSectionContentResponseDTO {
  blocks: BlockDTO[]
}

/** PATCH /content/texts/:id */
export interface PatchTextDTO {
  body?: string
}

/** PATCH /content/media/:id */
export interface PatchMediaDTO {
  title?: string
  url?: string
  mime_type?: string
  origin?: 'ADMIN' | 'WEB_FORM'
}

/** PATCH /content/blocks/:blockId — editar rol/orden de un bloque */
export interface PatchBlockDTO {
  role?: string
  order?: number
}
