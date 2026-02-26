import type { PublicSectionDTO, AdminSectionDTO, SectionListItemDTO } from '../dtos'
import type { PublicBlockDTO, BlockDTO } from '../dtos'
import type { Section, AdminSection, SectionListItem } from '../models'
import type { TextContent, AdminTextContent } from '../models'
import type { MediaContent, AdminMediaContent } from '../models'
import type { FileContent } from '../models'
import ENV from '@shared/api/apiConfig'

/**
 * Si la URL es relativa (empieza con "/"), la prefija con API_BASE_URL
 * para que el navegador la resuelva contra el backend y no contra el
 * servidor de desarrollo del frontend.
 */
function resolveMediaUrl(url: string): string {
  if (url.startsWith('/')) return `${ENV.API_BASE_URL}${url}`
  return url
}

// ── Public mappers (blocks → texts/media) ──

function mapPublicTextBlock(block: PublicBlockDTO): TextContent {
  return {
    title: null,
    body: block.text?.body ?? '',
    role: block.role,
    order: block.order ?? 0,
  }
}

function mapPublicMediaBlock(block: PublicBlockDTO): MediaContent {
  return {
    url: resolveMediaUrl(block.media?.url ?? ''),
    mimeType: block.media?.mime_type ?? null,
    role: block.role,
    order: block.order ?? 0,
  }
}

export function mapPublicSectionDTO(dto: PublicSectionDTO): Section {
  const textBlocks = (dto.blocks ?? []).filter((b) => b.type === 'text')
  const mediaBlocks = (dto.blocks ?? []).filter((b) => b.type === 'media')

  return {
    id: dto.id,
    name: dto.name,
    texts: textBlocks.map(mapPublicTextBlock).sort((a, b) => a.order - b.order),
    media: mediaBlocks.map(mapPublicMediaBlock).sort((a, b) => a.order - b.order),
  }
}

// ── Admin mappers (blocks → texts/media/files) ──

function mapAdminTextBlock(block: BlockDTO): AdminTextContent {
  return {
    id: block.text!.id,
    title: block.text!.title,
    body: block.text!.body,
    status: block.status,
    role: block.role,
    order: block.order ?? 0,
    blockId: block.id,
  }
}

function mapAdminMediaBlock(block: BlockDTO): AdminMediaContent {
  return {
    id: block.media!.id,
    url: resolveMediaUrl(block.media!.url),
    mimeType: block.media!.mime_type,
    title: block.media!.title,
    origin: block.media!.origin,
    role: block.role,
    order: block.order ?? 0,
    blockId: block.id,
    status: block.status,
  }
}

function mapAdminFileBlock(block: BlockDTO): FileContent {
  return {
    id: block.file!.id,
    title: block.file!.title,
    size: block.file!.tamaño,
    state: (block.file!.state as 'PENDING' | 'UPLOADED') ?? 'PENDING',
    role: block.role,
    order: block.order ?? 0,
    blockId: block.id,
    status: block.status,
  }
}

export function mapAdminSectionDTO(dto: AdminSectionDTO): AdminSection {
  const blocks = dto.blocks ?? []
  const textBlocks = blocks.filter((b) => b.type === 'text' && b.text)
  const mediaBlocks = blocks.filter((b) => b.type === 'media' && b.media)
  const fileBlocks = blocks.filter((b) => b.type === 'file' && b.file)

  return {
    id: dto.id,
    name: dto.name,
    texts: textBlocks.map(mapAdminTextBlock).sort((a, b) => a.order - b.order),
    media: mediaBlocks.map(mapAdminMediaBlock).sort((a, b) => a.order - b.order),
    files: fileBlocks.map(mapAdminFileBlock).sort((a, b) => a.order - b.order),
  }
}

// ── List mapper ──

export function mapSectionListItem(dto: SectionListItemDTO): SectionListItem {
  return { id: dto.id, name: dto.name }
}
