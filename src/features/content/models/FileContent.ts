import type { BlockStatus } from '../dtos/BlockDTO'

/** Archivo subido a R2 (asociado a una sección via section_blocks) */
export interface FileContent {
  id: number
  title: string | null
  size: number | null
  state: 'PENDING' | 'UPLOADED'
  role: string | null
  order: number
  blockId: number
  status: BlockStatus
}
