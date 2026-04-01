import type { BlockStatus } from '../dtos/BlockDTO'

export interface TextContent {
  body: string
  role: string | null
  order: number
}

/** Modelo admin con IDs para edición */
export interface AdminTextContent extends TextContent {
  id: number
  status: BlockStatus
  blockId: number
}
