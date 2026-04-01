/** Respuesta pública — GET /content/sections/public/:name */
export interface PublicTextDTO {
  body: string
  role: string | null
  order: number | null
}

/** Respuesta admin — GET /content/sections/:id */
export interface AdminTextDTO {
  id: number
  body: string
  role: string | null
  order: number | null
  pivot_id: number
}
