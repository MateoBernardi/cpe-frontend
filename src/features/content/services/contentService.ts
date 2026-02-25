import { apiRequest, apiUpload } from '@shared/api/apiRequest'
import ENV from '@shared/api/apiConfig'
import type {
  PublicSectionResponseDTO,
  AdminSectionResponseDTO,
  SectionListResponseDTO,
  AddSectionContentDTO,
  PatchTextDTO,
  PatchMediaDTO,
  PatchPivotDTO,
  UploadMediaResponseDTO,
  DraftMediaResponseDTO,
  PublishMediaResponseDTO,
} from '../dtos'

const BASE = ENV.CONTENT_PREFIX

export const contentService = {
  // ── Public ──

  /** GET /content/sections/public/:sectionName */
  getPublicSection(sectionName: string, signal?: AbortSignal) {
    return apiRequest<PublicSectionResponseDTO>({
      method: 'GET',
      endpoint: `${BASE}/sections/public/${encodeURIComponent(sectionName)}`,
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

  /** POST /content/sections/:sectionId/content — agregar textos/media */
  addContent(sectionId: number, data: AddSectionContentDTO, signal?: AbortSignal) {
    return apiRequest<AdminSectionResponseDTO, AddSectionContentDTO>({
      method: 'POST',
      endpoint: `${BASE}/sections/${sectionId}/content`,
      body: data,
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
  publishMedia(mediaId: number, signal?: AbortSignal) {
    return apiRequest<PublishMediaResponseDTO>({
      method: 'POST',
      endpoint: `${BASE}/media/${mediaId}/publish`,
      signal,
    })
  },

  // ── Admin: editar ──

  /** PATCH /content/texts/:textId */
  patchText(textId: number, data: PatchTextDTO) {
    return apiRequest<unknown, PatchTextDTO>({
      method: 'PATCH',
      endpoint: `${BASE}/texts/${textId}`,
      body: data,
    })
  },

  /** PATCH /content/media/:mediaId */
  patchMedia(mediaId: number, data: PatchMediaDTO) {
    return apiRequest<unknown, PatchMediaDTO>({
      method: 'PATCH',
      endpoint: `${BASE}/media/${mediaId}`,
      body: data,
    })
  },

  /** PATCH /content/text-sections/:pivotId */
  patchTextPivot(pivotId: number, data: PatchPivotDTO) {
    return apiRequest<unknown, PatchPivotDTO>({
      method: 'PATCH',
      endpoint: `${BASE}/text-sections/${pivotId}`,
      body: data,
    })
  },

  /** PATCH /content/media-texts/:pivotId */
  patchMediaPivot(pivotId: number, data: PatchPivotDTO) {
    return apiRequest<unknown, PatchPivotDTO>({
      method: 'PATCH',
      endpoint: `${BASE}/media-texts/${pivotId}`,
      body: data,
    })
  },

  // ── Admin: eliminar (soft delete) ──

  /** DELETE /content/texts/:textId */
  deleteText(textId: number) {
    return apiRequest<unknown>({ method: 'DELETE', endpoint: `${BASE}/texts/${textId}` })
  },

  /** DELETE /content/media/:mediaId */
  deleteMedia(mediaId: number) {
    return apiRequest<unknown>({ method: 'DELETE', endpoint: `${BASE}/media/${mediaId}` })
  },
}
