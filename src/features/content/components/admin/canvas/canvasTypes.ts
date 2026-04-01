/**
 * Tipos compartidos para el editor de canvas visual.
 * Extraído de SectionCanvasEditor para mantener la separación de interfaces.
 */

import type { AdminSection, AdminTextContent } from '../../../models'
import type { TextSlotConfig, MediaSlotConfig } from '../../../config/sectionCanvasConfig'

// ── Props del editor principal ──

export interface SectionCanvasEditorProps {
  section: AdminSection | null
  sectionName: string
  sectionId: number
  onCreateText: (body: string, role: string, order: number) => void
  onPatchText?: (textId: number, body: string) => void
  onUploadMedia: (file: File, sectionId: number, role: string, order: number) => void
  onDeleteText: (blockId: number, textId: number) => void
  onDeleteMedia: (blockId: number) => void
  onSwapTextOrder: (a: import('../../../models').AdminTextContent, b: import('../../../models').AdminTextContent) => void
  onSwapMediaOrder: (a: import('../../../models').AdminMediaContent, b: import('../../../models').AdminMediaContent) => void
  isUploading: boolean
  // ── Nuevas operaciones de media (draft/publish) ──
  onPublishMedia?: (mediaId: number, blockId: number) => void
  isPublishingMedia?: boolean
  // ── Publicar texto individual ──
  onPublishText?: (textId: number, blockId: number) => void
  isPublishingText?: boolean
  // ── Operaciones de archivo (R2) ──
  onUploadR2File?: (file: File, sectionId: number, role: string, order: number) => void
  isUploadingR2?: boolean
  onDownloadFile?: (fileId: number) => void
  onRemoveFile?: (fileId: number) => void
  // ── Galería ──
  onAssignFromGallery?: (mediaId: number, sectionId: number, role: string, order: number) => void
}

// ── Props de slots individuales ──

export interface TextSlotProps {
  config: TextSlotConfig
  text?: AdminTextContent
  isEditing: boolean
  editValue: string
  onStartEdit: () => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onChangeValue: (v: string) => void
  onDelete?: () => void
  onPublish?: () => void
  isPublishing?: boolean
  className?: string
}

export interface MediaSlotProps {
  config: MediaSlotConfig
  mediaItems: import('../../../models').AdminMediaContent[]
  onUpload: (file: File, options?: { preserveOrder?: number }) => void
  onDelete: (id: number) => void
  onPublish?: (mediaId: number, blockId: number) => void
  isPublishing?: boolean
  onPickFromGallery?: (options?: { preserveOrder?: number }) => void
  showAddButtonWithExistingItems?: boolean
  className?: string
}

// ── Contexto compartido entre layouts ──

export interface SlotContext {
  section: AdminSection | null
  editingSlotId: string | null
  editValue: string
  startEdit: (slotId: string, existingText?: AdminTextContent) => void
  saveEdit: (config: TextSlotConfig) => void
  cancelEdit: () => void
  setEditValue: (v: string) => void
  editingTextId: number | null
  uploadToSlot: (config: MediaSlotConfig, file: File, orderOverride?: number) => void
  deleteText: (blockId: number, textId: number) => void
  deleteMedia: (blockId: number) => void
  swapTextOrder: (a: import('../../../models').AdminTextContent, b: import('../../../models').AdminTextContent) => void
  swapMediaOrder: (a: import('../../../models').AdminMediaContent, b: import('../../../models').AdminMediaContent) => void
  // ── Nuevas: media draft/publish ──
  publishMedia?: (mediaId: number, blockId: number) => void
  isPublishingMedia?: boolean
  // ── Nuevas: publicar texto individual ──
  publishText?: (textId: number, blockId: number) => void
  isPublishingText?: boolean
  // ── Nuevas: archivos R2 ──
  uploadR2File?: (file: File, sectionId: number, role: string, order: number) => void
  isUploadingR2?: boolean
  downloadFile?: (fileId: number) => void
  removeFile?: (fileId: number) => void
  sectionId: number
  // ── Galería ──
  pickFromGallery?: (config: MediaSlotConfig, options?: { preserveOrder?: number }) => void
}

// ── Props de layouts de sección ──

export interface LayoutProps {
  ctx: SlotContext
  textSlots: TextSlotConfig[]
  mediaSlots: MediaSlotConfig[]
}
