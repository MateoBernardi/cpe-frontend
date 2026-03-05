/** Estados posibles de un archivo en R2 */
export type FileState = 'PENDING' | 'QUARANTINE' | 'VERIFIED' | 'REJECTED'

/** Archivo en la respuesta admin — incluido dentro de BlockDTO.file */
export interface AdminFileDTO {
  id: number
  title: string | null
  tamaño: number | null
  state: FileState
  role: string | null
  order: number | null
  pivot_id: number
}

/** POST /content/files/upload-url — solicitar presigned URL */
export interface RequestUploadUrlDTO {
  filename: string
  content_type: string
  title?: string
  max_size?: number
  section_id?: number
  role?: string
  order?: number
}

/** Respuesta de POST /content/files/upload-url */
export interface UploadUrlResponseDTO {
  file_id: number
  block_id?: number
  upload: {
    url: string
    fields: Record<string, string>
  }
}

/** POST /content/files/:fileId/confirm */
export interface ConfirmUploadDTO {
  tamaño?: number
}

export interface ConfirmUploadResponseDTO {
  id: number
  state: FileState
}

/** GET /content/files/:fileId/download-url */
export interface DownloadUrlResponseDTO {
  url: string
  expires_in: number
}

/** GET /content/files */
export interface FileListItemDTO {
  id: number
  title: string | null
  tamaño: number | null
  state: string
  created_at: string
}

export interface FileListResponseDTO {
  files: FileListItemDTO[]
}

/** PATCH /content/file-blocks/:blockId */
export interface PatchFileBlockDTO {
  role?: string
  order?: number
}

/** POST /content/media/draft — subir imagen como borrador */
export interface DraftMediaResponseDTO {
  media: {
    id: number
    url: string
    mime_type: string
    title: string | null
    origin: string | null
    block_id?: number
  }
}

/** POST /content/media/:mediaId/publish */
export interface PublishMediaResponseDTO {
  media: {
    media_id: number
    block_id: number
    status: 'PUBLISHED'
  }
}

/** POST /content/texts/:textId/publish */
export interface PublishTextResponseDTO {
  text: {
    text_id: number
    block_id: number
    status: 'PUBLISHED'
  }
}
