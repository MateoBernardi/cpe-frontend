/** Respuesta pública — GET /content/sections/public/:name */
export interface PublicMediaDTO {
  media_url: string
  mime_type: string | null
  role: string | null
  order: number | null
}

/** Respuesta admin — GET /content/sections/:id */
export interface AdminMediaDTO {
  id: number
  media_url: string
  mime_type: string | null
  title: string | null
  origin: string | null
  role: string | null
  order: number | null
  pivot_id: number
}

/** Respuesta del upload — POST /content/media/upload */
export interface UploadMediaResponseDTO {
  media: {
    id: number
    url: string
    mime_type: string
    title: string | null
    origin: string | null
    pivot_id?: number
  }
}
