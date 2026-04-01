/** GET /content/gallery — galería de imágenes del tenant */

export interface GalleryAssociationDTO {
  block_id: number
  section_id: number
  section_name: string
  role: string | null
}

export interface GalleryMediaDTO {
  id: number
  url: string
  mime_type: string | null
  title: string | null
  origin: string | null
  created_at: string
  associations: GalleryAssociationDTO[]
}

export interface GalleryResponseDTO {
  media: GalleryMediaDTO[]
}

/** Payload para asignar media existente a una sección */
export interface AssignMediaInput {
  media_id: number
  role?: string
  order?: number
}
