import type { TextDTO } from './TextDTO'
import type { MediaDTO } from './MediaDTO'

export interface SectionDTO {
  id: number
  name: string
  texts: TextDTO[]
  media: MediaDTO[]
}

export interface SectionResponseDTO {
  section: SectionDTO
}
