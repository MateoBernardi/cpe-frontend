/** Respuesta pública — GET /content/sections/public/:name */
export interface PublicTextDTO {
  title: string | null
  body: string
  role: string | null
  order: number | null
}

/** Respuesta admin — GET /content/sections/:id */
export interface AdminTextDTO {
  id: number
  title: string | null
  body: string
  status: string | null
  role: string | null
  order: number | null
  pivot_id: number
}
