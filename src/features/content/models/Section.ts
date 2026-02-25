import type { TextContent, AdminTextContent } from './TextContent'
import type { MediaContent, AdminMediaContent } from './MediaContent'
import type { FileContent } from './FileContent'

export interface Section {
  id: number
  name: string
  texts: TextContent[]
  media: MediaContent[]
}

/** Modelo admin con datos completos para edición */
export interface AdminSection {
  id: number
  name: string
  texts: AdminTextContent[]
  media: AdminMediaContent[]
  files: FileContent[]
}

export interface SectionListItem {
  id: number
  name: string
}
