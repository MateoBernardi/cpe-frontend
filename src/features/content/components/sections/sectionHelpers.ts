import type { TextContent, MediaContent } from '../../models'

/** Busca el primer texto con el rol indicado */
export function textByRole(texts: TextContent[], role: string): TextContent | undefined {
  return texts.find((t) => t.role === role)
}

/** Devuelve todos los textos con el rol indicado, ordenados */
export function textsByRole(texts: TextContent[], role: string): TextContent[] {
  return texts.filter((t) => t.role === role).sort((a, b) => a.order - b.order)
}

/** Busca el primer media con el rol indicado */
export function mediaByRole(media: MediaContent[], role: string): MediaContent | undefined {
  return media.find((m) => m.role === role)
}

/** Devuelve todos los media con el rol indicado, ordenados */
export function mediasByRole(media: MediaContent[], role: string): MediaContent[] {
  return media.filter((m) => m.role === role).sort((a, b) => a.order - b.order)
}
