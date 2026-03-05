import type { TextContent, AdminTextContent } from './TextContent'
import type { MediaContent, AdminMediaContent } from './MediaContent'
import type { FileContent } from './FileContent'

/**
 * Modelo público — los textos/media se derivan de blocks[] en el mapper.
 * Los componentes de sección siguen accediendo a .texts y .media sin cambios.
 */
export interface Section {
  id: number
  name: string
  texts: TextContent[]
  media: MediaContent[]
  files: { id: number; title: string | null; role: string | null; order: number }[]
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
