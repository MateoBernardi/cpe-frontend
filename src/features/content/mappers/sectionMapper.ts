import type { SectionDTO } from '../dtos'
import type { Section, TextContent, MediaContent } from '../models'
import type { TextDTO, MediaDTO } from '../dtos'

function mapTextDTO(dto: TextDTO): TextContent {
  return {
    title: dto.title,
    body: dto.body,
    role: dto.role,
    order: dto.order ?? 0,
  }
}

function mapMediaDTO(dto: MediaDTO): MediaContent {
  return {
    mediaUrl: dto.media_url,
    mimeType: dto.mime_type,
    role: dto.role,
    order: dto.order ?? 0,
  }
}

export function mapSectionDTOToSection(dto: SectionDTO): Section {
  return {
    id: dto.id,
    name: dto.name,
    texts: dto.texts.map(mapTextDTO).sort((a, b) => a.order - b.order),
    media: dto.media.map(mapMediaDTO).sort((a, b) => a.order - b.order),
  }
}
