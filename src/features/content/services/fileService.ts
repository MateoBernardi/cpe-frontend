import { apiRequest } from '@shared/api/apiRequest'
import ENV from '@shared/api/apiConfig'
import type {
  RequestUploadUrlDTO,
  UploadUrlResponseDTO,
  ConfirmUploadDTO,
  ConfirmUploadResponseDTO,
  DownloadUrlResponseDTO,
  FileListResponseDTO,
  PatchFileBlockDTO,
} from '../dtos'

const BASE = ENV.CONTENT_PREFIX
const PUBLIC = ENV.PUBLIC_PREFIX

/**
 * Servicio de archivos (R2).
 * El archivo nunca pasa por el backend: se sube directo a Cloudflare R2
 * usando un Presigned POST generado por el backend.
 */
export const fileService = {

  // ── Paso 1: solicitar URL de subida ──

  /** POST /content/files/upload-url — rate-limited (3/día/IP) */
  requestUploadUrl(data: RequestUploadUrlDTO, signal?: AbortSignal) {
    return apiRequest<UploadUrlResponseDTO, RequestUploadUrlDTO>({
      method: 'POST',
      endpoint: `${BASE}/files/upload-url`,
      body: data,
      signal,
    })
  },

  // ── Paso 2: subir directo a R2 ──

  /**
   * Sube el archivo directamente a Cloudflare R2 usando el presigned POST.
   * NO pasa por el backend.
   */
  async uploadToR2(
    uploadUrl: string,
    fields: Record<string, string>,
    contentType: string,
    file: File,
  ): Promise<void> {
    const formData = new FormData()

    // Primero todos los campos del presigned POST
    for (const [key, value] of Object.entries(fields)) {
      formData.append(key, value)
    }

    // Content-Type DEBE coincidir con el declarado al solicitar la URL
    formData.append('Content-Type', contentType)

    // El archivo va AL FINAL del FormData
    formData.append('file', file)

    const res = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      // NO poner Content-Type header, el browser lo pone con boundary
    })

    if (!res.ok) {
      throw new Error(`Upload a R2 falló: ${res.status} ${res.statusText}`)
    }
  },

  // ── Paso 3: confirmar subida ──

  /** POST /content/files/:fileId/confirm */
  confirmUpload(fileId: number, data?: ConfirmUploadDTO) {
    return apiRequest<ConfirmUploadResponseDTO, ConfirmUploadDTO | undefined>({
      method: 'POST',
      endpoint: `${BASE}/files/${fileId}/confirm`,
      body: data,
    })
  },

  // ── Ciclo completo: solicitar → subir → confirmar ──

  /**
   * Ejecuta los 3 pasos del ciclo de subida de archivo a R2.
   * Retorna el file_id y block_id (si se vincula a sección) confirmados.
   */
  async uploadFile(
    file: File,
    options?: {
      title?: string
      sectionId?: number
      role?: string
      order?: number
      maxSize?: number
    },
  ): Promise<{ fileId: number; blockId?: number }> {
    // Paso 1
    const { file_id, block_id, upload } = await fileService.requestUploadUrl({
      filename: file.name,
      content_type: file.type || 'application/octet-stream',
      title: options?.title,
      max_size: options?.maxSize,
      section_id: options?.sectionId,
      role: options?.role,
      order: options?.order,
    })

    // Paso 2
    await fileService.uploadToR2(
      upload.url,
      upload.fields,
      file.type || 'application/octet-stream',
      file,
    )

    // Paso 3
    await fileService.confirmUpload(file_id, { tamaño: file.size })

    return { fileId: file_id, blockId: block_id }
  },

  // ── Descargar ──

  /** GET /content/files/:fileId/download-url */
  getDownloadUrl(fileId: number, signal?: AbortSignal) {
    return apiRequest<DownloadUrlResponseDTO>({
      method: 'GET',
      endpoint: `${BASE}/files/${fileId}/download-url`,
      signal,
    })
  },

  // ── Listar ──

  /** GET /content/files */
  listFiles(signal?: AbortSignal) {
    return apiRequest<FileListResponseDTO>({
      method: 'GET',
      endpoint: `${BASE}/files`,
      signal,
    })
  },

  // ── Editar bloque de archivo ──

  /** PATCH /content/file-blocks/:blockId */
  patchFileBlock(blockId: number, data: PatchFileBlockDTO) {
    return apiRequest<unknown, PatchFileBlockDTO>({
      method: 'PATCH',
      endpoint: `${BASE}/file-blocks/${blockId}`,
      body: data,
    })
  },

  // ── Eliminar ──

  /** DELETE /content/files/:fileId */
  deleteFile(fileId: number) {
    return apiRequest<unknown>({
      method: 'DELETE',
      endpoint: `${BASE}/files/${fileId}`,
    })
  },

  // ── Público: subida de CV (solo PDF, máx 5 MB) ──

  /** POST /public/files/upload-url — solicitar URL de subida pública (solo PDF) */
  requestPublicUploadUrl(
    data: Pick<RequestUploadUrlDTO, 'filename' | 'content_type' | 'title'>,
    signal?: AbortSignal,
  ) {
    return apiRequest<UploadUrlResponseDTO, Pick<RequestUploadUrlDTO, 'filename' | 'content_type' | 'title'>>({
      method: 'POST',
      endpoint: `${PUBLIC}/files/upload-url`,
      body: data,
      signal,
    })
  },

  /** POST /public/files/:fileId/confirm — confirmar subida pública */
  confirmPublicUpload(fileId: number, data?: ConfirmUploadDTO) {
    return apiRequest<ConfirmUploadResponseDTO, ConfirmUploadDTO | undefined>({
      method: 'POST',
      endpoint: `${PUBLIC}/files/${fileId}/confirm`,
      body: data,
    })
  },

  /**
   * Ciclo completo público: solicitar URL → subir a R2 → confirmar.
   * Solo acepta PDF. El backend fuerza máx 5 MB automáticamente.
   */
  async uploadPublicFile(
    file: File,
    title?: string,
  ): Promise<{ fileId: number }> {
    // Paso 1
    const { file_id, upload } = await fileService.requestPublicUploadUrl({
      filename: file.name,
      content_type: 'application/pdf',
      title,
    })

    // Paso 2
    await fileService.uploadToR2(upload.url, upload.fields, 'application/pdf', file)

    // Paso 3
    await fileService.confirmPublicUpload(file_id, { tamaño: file.size })

    return { fileId: file_id }
  },
}
