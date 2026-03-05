import { apiRequest, apiUpload } from '@shared/api/apiRequest'
import ENV from '@shared/api/apiConfig'
import type {
  PublicSectionResponseDTO,
  AdminSectionResponseDTO,
  SectionListResponseDTO,
  AddSectionContentDTO,
  AddSectionContentResponseDTO,
  PatchMediaDTO,
  PatchBlockDTO,
  UploadMediaResponseDTO,
  DraftMediaResponseDTO,
  PublishMediaResponseDTO,
  PublishTextResponseDTO,
  GalleryResponseDTO,
  AssignMediaInput,
} from '../dtos'

const BASE = ENV.CONTENT_PREFIX
const PUBLIC = ENV.PUBLIC_PREFIX

export const contentService = {
  // ── Public ──

  /** GET /public/sections/:sectionName */
  getPublicSection(sectionName: string, signal?: AbortSignal) {
    return apiRequest<PublicSectionResponseDTO>({
      method: 'GET',
      endpoint: `${PUBLIC}/sections/${encodeURIComponent(sectionName)}`,
      signal,
    })
  },

  // ── Admin: secciones ──

  /** GET /content/sections — lista de secciones */
  listSections(signal?: AbortSignal) {
    return apiRequest<SectionListResponseDTO>({
      method: 'GET',
      endpoint: `${BASE}/sections`,
      signal,
    })
  },

  /** GET /content/sections/:sectionId — contenido completo (admin) */
  getAdminSection(sectionId: number, signal?: AbortSignal) {
    return apiRequest<AdminSectionResponseDTO>({
      method: 'GET',
      endpoint: `${BASE}/sections/${sectionId}`,
      signal,
    })
  },

  /** GET /content/sections/:sectionId/preview — vista previa (DRAFTED prioritario) */
  getPreviewSection(sectionId: number, signal?: AbortSignal) {
    return apiRequest<AdminSectionResponseDTO>({
      method: 'GET',
      endpoint: `${BASE}/sections/${sectionId}/preview`,
      signal,
    })
  },

  /** POST /content/sections/:sectionId/content — agregar textos/media (crea bloques DRAFTED) */
  addContent(sectionId: number, data: AddSectionContentDTO, signal?: AbortSignal) {
    return apiRequest<AddSectionContentResponseDTO, AddSectionContentDTO>({
      method: 'POST',
      endpoint: `${BASE}/sections/${sectionId}/content`,
      body: data,
      signal,
    })
  },

  /** POST /content/sections/:sectionId/publish — publicar sección (DRAFTED → PUBLISHED) */
  publishSection(sectionId: number, signal?: AbortSignal) {
    return apiRequest<{ message: string }>({
      method: 'POST',
      endpoint: `${BASE}/sections/${sectionId}/publish`,
      signal,
    })
  },

  // ── Admin: upload ──

  /** POST /content/media/upload — multipart (Cloudflare Images, directo a PUBLISHED) */
  uploadMedia(formData: FormData, signal?: AbortSignal) {
    return apiUpload<UploadMediaResponseDTO>(
      `${BASE}/media/upload`,
      formData,
      signal,
    )
  },

  /** POST /content/media/draft — subir imagen como borrador (local, para preview) */
  uploadMediaDraft(formData: FormData, signal?: AbortSignal) {
    return apiUpload<DraftMediaResponseDTO>(
      `${BASE}/media/draft`,
      formData,
      signal,
    )
  },

  /** POST /content/media/:mediaId/publish — publicar imagen (local → Cloudflare CDN) */
  publishMedia(mediaId: number, blockId: number, signal?: AbortSignal) {
    return apiRequest<PublishMediaResponseDTO, { block_id: number }>({
      method: 'POST',
      endpoint: `${BASE}/media/${mediaId}/publish`,
      body: { block_id: blockId },
      signal,
    })
  },

  /** POST /content/texts/:textId/publish — publicar texto individual */
  publishText(textId: number, blockId: number, signal?: AbortSignal) {
    return apiRequest<PublishTextResponseDTO, { block_id: number }>({
      method: 'POST',
      endpoint: `${BASE}/texts/${textId}/publish`,
      body: { block_id: blockId },
      signal,
    })
  },

  // ── Admin: editar contenido ──

  /** PATCH /content/media/:mediaId */
  patchMedia(mediaId: number, data: PatchMediaDTO) {
    return apiRequest<unknown, PatchMediaDTO>({
      method: 'PATCH',
      endpoint: `${BASE}/media/${mediaId}`,
      body: data,
    })
  },

  // ── Admin: editar bloque (rol, orden) ──

  /** PATCH /content/blocks/:blockId */
  patchBlock(blockId: number, data: PatchBlockDTO) {
    return apiRequest<unknown, PatchBlockDTO>({
      method: 'PATCH',
      endpoint: `${BASE}/blocks/${blockId}`,
      body: data,
    })
  },

  // ── Admin: eliminar (soft delete) ──

  /** DELETE /content/blocks/:blockId — soft delete de bloque */
  deleteBlock(blockId: number) {
    return apiRequest<unknown>({ method: 'DELETE', endpoint: `${BASE}/blocks/${blockId}` })
  },

  /** DELETE /content/texts/:textId */
  deleteText(textId: number) {
    return apiRequest<unknown>({ method: 'DELETE', endpoint: `${BASE}/texts/${textId}` })
  },

  /** DELETE /content/media/:mediaId */
  deleteMedia(mediaId: number) {
    return apiRequest<unknown>({ method: 'DELETE', endpoint: `${BASE}/media/${mediaId}` })
  },

  // ── Galería ──

  /** GET /content/gallery — todas las imágenes activas del tenant */
  getGallery(signal?: AbortSignal) {
    return apiRequest<GalleryResponseDTO>({
      method: 'GET',
      endpoint: `${BASE}/gallery`,
      signal,
    })
  },

  /** Asignar media existente a una sección */
  assignMediaToSection(
    sectionId: number,
    items: AssignMediaInput[],
    signal?: AbortSignal,
  ) {
    return apiRequest<AddSectionContentResponseDTO, AddSectionContentDTO>({
      method: 'POST',
      endpoint: `${BASE}/sections/${sectionId}/content`,
      body: { media: items },
      signal,
    })
  },
}
