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
export function resolveMediaUrl(url: string): string {
  if (url.startsWith('/')) return `${ENV.API_BASE_URL}${url}`
  return url
}

function normalizeOrder(order: number | null | undefined, fallbackOrder: number): number {
  if (typeof order !== 'number' || !Number.isFinite(order) || order <= 0) {
    return fallbackOrder
  }
  return order
}

// ── Public mappers (blocks → texts/media) ──

function mapPublicTextBlock(block: PublicBlockDTO, fallbackOrder: number): TextContent {
  return {
    body: block.text?.body ?? '',
    role: block.role,
    order: normalizeOrder(block.order, fallbackOrder),
  }
}

function mapPublicMediaBlock(block: PublicBlockDTO, fallbackOrder: number): MediaContent {
  return {
    url: resolveMediaUrl(block.media?.url ?? ''),
    mimeType: block.media?.mime_type ?? null,
    role: block.role,
    order: normalizeOrder(block.order, fallbackOrder),
  }
}

export function mapPublicSectionDTO(dto: PublicSectionDTO): Section {
  const textBlocks = (dto.blocks ?? []).filter((b) => b.type === 'text')
  const mediaBlocks = (dto.blocks ?? []).filter((b) => b.type === 'media')
  const fileBlocks = (dto.blocks ?? []).filter((b) => b.type === 'file' && b.file)

  return {
    id: dto.id,
    name: dto.name,
    texts: textBlocks.map((block, idx) => mapPublicTextBlock(block, idx + 1)).sort((a, b) => a.order - b.order),
    media: mediaBlocks.map((block, idx) => mapPublicMediaBlock(block, idx + 1)).sort((a, b) => a.order - b.order),
    files: fileBlocks.map((b, idx) => ({
      id: b.file!.id,
      title: b.file!.title,
      role: b.role ?? 'attachment',
      order: normalizeOrder(b.order, idx + 1),
    })).sort((a, b) => a.order - b.order),
  }
}

// ── Admin mappers (blocks → texts/media/files) ──

function mapAdminTextBlock(block: BlockDTO, fallbackOrder: number): AdminTextContent {
  return {
    id: block.text!.id,
    body: block.text!.body,
    status: block.status,
    role: block.role,
    order: normalizeOrder(block.order, fallbackOrder),
    blockId: block.id,
  }
}

function mapAdminMediaBlock(block: BlockDTO, fallbackOrder: number): AdminMediaContent {
  return {
    id: block.media!.id,
    url: resolveMediaUrl(block.media!.url),
    mimeType: block.media!.mime_type,
    title: block.media!.title,
    origin: block.media!.origin,
    role: block.role,
    order: normalizeOrder(block.order, fallbackOrder),
    blockId: block.id,
    status: block.status,
  }
}

function mapAdminFileBlock(block: BlockDTO, fallbackOrder: number): FileContent {
  return {
    id: block.file!.id,
    title: block.file!.title,
    size: block.file!.tamaño,
    state: (block.file!.state as 'PENDING' | 'UPLOADED') ?? 'PENDING',
    role: block.role,
    order: normalizeOrder(block.order, fallbackOrder),
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
    texts: textBlocks.map((block, idx) => mapAdminTextBlock(block, idx + 1)).sort((a, b) => a.order - b.order),
    media: mediaBlocks.map((block, idx) => mapAdminMediaBlock(block, idx + 1)).sort((a, b) => a.order - b.order),
    files: fileBlocks.map((block, idx) => mapAdminFileBlock(block, idx + 1)).sort((a, b) => a.order - b.order),
  }
}

// ── List mapper ──

export function mapSectionListItem(dto: SectionListItemDTO): SectionListItem {
  return { id: dto.id, name: dto.name }
}
