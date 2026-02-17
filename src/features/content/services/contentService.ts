import { apiRequest } from '@shared/api/apiRequest'
import ENV from '@shared/api/apiConfig'
import type { SectionResponseDTO, CreateSectionDTO } from '../dtos'

const CONTENT_BASE = ENV.CONTENT_PREFIX

export const contentService = {
  /**
   * GET /content/sections/:sectionName
   * Obtiene una sección completa con textos y media activos/publicados.
   */
  getSection(sectionName: string, signal?: AbortSignal): Promise<SectionResponseDTO> {
    return apiRequest<SectionResponseDTO>({
      method: 'GET',
      endpoint: `${CONTENT_BASE}/sections/${encodeURIComponent(sectionName)}`,
      signal,
    })
  },

  /**
   * POST /content/sections
   * Crea contenido nuevo de texto/media y lo vincula a una sección.
   */
  createSection(data: CreateSectionDTO, signal?: AbortSignal): Promise<SectionResponseDTO> {
    return apiRequest<SectionResponseDTO, CreateSectionDTO>({
      method: 'POST',
      endpoint: `${CONTENT_BASE}/sections`,
      body: data,
      signal,
    })
  },
}
