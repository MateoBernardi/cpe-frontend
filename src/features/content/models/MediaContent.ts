import type { BlockStatus } from '../dtos/BlockDTO'

export interface MediaContent {
  url: string
  mimeType: string | null
  role: string | null
  order: number
}

/** Modelo admin con IDs para edición */
export interface AdminMediaContent extends MediaContent {
  id: number
  title: string | null
  origin: string | null
  blockId: number
  status: BlockStatus
}
