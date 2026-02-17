import type { PublicSectionDTO, AdminSectionDTO, SectionListItemDTO } from '../dtos'
import type { PublicTextDTO, AdminTextDTO } from '../dtos'
import type { PublicMediaDTO, AdminMediaDTO } from '../dtos'
import type { Section, AdminSection, SectionListItem } from '../models'
import type { TextContent, AdminTextContent } from '../models'
import type { MediaContent, AdminMediaContent } from '../models'

// ── Public mappers ──

function mapPublicText(dto: PublicTextDTO): TextContent {
  return {
    title: dto.title,
    body: dto.body,
    role: dto.role,
    order: dto.order ?? 0,
  }
}

function mapPublicMedia(dto: PublicMediaDTO): MediaContent {
  return {
    mediaUrl: dto.media_url,
    mimeType: dto.mime_type,
    role: dto.role,
    order: dto.order ?? 0,
  }
}

export function mapPublicSectionDTO(dto: PublicSectionDTO): Section {
  return {
    id: dto.id,
    name: dto.name,
    texts: dto.texts.map(mapPublicText).sort((a, b) => a.order - b.order),
    media: dto.media.map(mapPublicMedia).sort((a, b) => a.order - b.order),
  }
}

// ── Admin mappers ──

function mapAdminText(dto: AdminTextDTO): AdminTextContent {
  return {
    id: dto.id,
    title: dto.title,
    body: dto.body,
    status: dto.status,
    role: dto.role,
    order: dto.order ?? 0,
    pivotId: dto.pivot_id,
  }
}

function mapAdminMedia(dto: AdminMediaDTO): AdminMediaContent {
  return {
    id: dto.id,
    mediaUrl: dto.media_url,
    mimeType: dto.mime_type,
    title: dto.title,
    origin: dto.origin,
    role: dto.role,
    order: dto.order ?? 0,
    pivotId: dto.pivot_id,
  }
}

export function mapAdminSectionDTO(dto: AdminSectionDTO): AdminSection {
  return {
    id: dto.id,
    name: dto.name,
    texts: dto.texts.map(mapAdminText).sort((a, b) => a.order - b.order),
    media: dto.media.map(mapAdminMedia).sort((a, b) => a.order - b.order),
  }
}

// ── List mapper ──

export function mapSectionListItem(dto: SectionListItemDTO): SectionListItem {
  return { id: dto.id, name: dto.name }
}
