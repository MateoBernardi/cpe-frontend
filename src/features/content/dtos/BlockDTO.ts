/** Tipos de bloque del CMS basado en Exclusive Arc */
export type BlockType = 'text' | 'media' | 'file'
export type BlockStatus = 'DRAFTED' | 'PUBLISHED'

// ── Contenidos embebidos en el bloque (admin) ──

export interface BlockTextContent {
  id: number
  body: string
  title: string | null
}

export interface BlockMediaContent {
  id: number
  url: string
  mime_type: string | null
  title: string | null
  origin: string | null
}

export interface BlockFileContent {
  id: number
  title: string | null
  tamaño: number | null
  state: string | null
}

// ── Bloque admin — GET /content/sections/:id ──

export interface BlockDTO {
  id: number
  type: BlockType
  role: string | null
  order: number | null
  status: BlockStatus
  text?: BlockTextContent
  media?: BlockMediaContent
  file?: BlockFileContent
}

// ── Bloque público — GET /public/sections/:name ──

export interface PublicBlockDTO {
  type: BlockType
  role: string | null
  order: number | null
  text?: { body: string }
  media?: { url: string; mime_type: string | null }
  file?: { title: string | null }
}
