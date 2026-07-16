/**
 * useSlotEditing — hook reutilizable que encapsula la máquina de estados de
 * edición inline (qué slot se está editando, valor en curso, target del
 * gallery picker) y arma el `SlotContext` que consumen los layouts del canvas.
 *
 * Extraído de `SectionCanvasEditor` para que el editor combinado
 * (`AboutHeroEditor`) pueda construir un `ctx` por sección sin duplicar esta
 * lógica.
 */

import { useState, useCallback } from 'react'
import type { AdminTextContent } from '../../models'
import { matchTextToSlot, type TextSlotConfig, type MediaSlotConfig } from '../../config/sectionCanvasConfig'
import type { GalleryMedia } from '../../viewmodels'
import type { SectionCanvasEditorProps, SlotContext } from './canvas'

/** Handlers necesarios para armar el `ctx` — mismo shape que `SectionCanvasEditorProps` sin `sectionName`. */
export type SlotEditingHandlers = Omit<SectionCanvasEditorProps, 'sectionName'>

export interface UseSlotEditingResult {
  ctx: SlotContext
  galleryTarget: { slot: MediaSlotConfig; preserveOrder?: number } | null
  setGalleryTarget: React.Dispatch<React.SetStateAction<{ slot: MediaSlotConfig; preserveOrder?: number } | null>>
  handleGallerySelect: (media: GalleryMedia) => void
}

export function useSlotEditing({
  section,
  sectionId,
  onCreateText,
  onPatchText,
  onUploadMedia,
  onDeleteText,
  onDeleteMedia,
  onSwapTextOrder,
  onSwapMediaOrder,
  onPublishMedia,
  isPublishingMedia,
  onPublishText,
  isPublishingText,
  onUploadR2File,
  isUploadingR2,
  onDownloadFile,
  onRemoveFile,
  onAssignFromGallery,
}: SlotEditingHandlers): UseSlotEditingResult {
  // ── Estado de edición inline ──
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editingTextId, setEditingTextId] = useState<number | null>(null)

  // ── Estado del gallery picker ──
  const [galleryTarget, setGalleryTarget] = useState<{
    slot: MediaSlotConfig
    preserveOrder?: number
  } | null>(null)

  const getNextOrderForRole = useCallback((role: string, kind: 'text' | 'media') => {
    if (!section) return 1
    const source = kind === 'text' ? section.texts : section.media
    const maxOrder = source
      .filter((item) => item.role === role)
      .reduce((max, item) => (Number.isFinite(item.order) && item.order > max ? item.order : max), 0)
    return maxOrder + 1
  }, [section])

  const startEdit = useCallback((slotId: string, existingText?: AdminTextContent) => {
    setEditingSlotId(slotId)
    setEditValue(existingText?.body ?? '')
    setEditingTextId(existingText?.id ?? null)
  }, [])

  const cancelEdit = useCallback(() => {
    setEditingSlotId(null)
    setEditValue('')
    setEditingTextId(null)
  }, [])

  const saveEdit = useCallback((slotConfig: TextSlotConfig) => {
    if (!editValue.trim()) {
      cancelEdit()
      return
    }

    const existingById = editingTextId !== null
      ? section?.texts.find((t) => t.id === editingTextId)
      : undefined
    const existingBySlot = section
      ? matchTextToSlot(section.texts, slotConfig)
      : undefined
    const existingText = existingById ?? existingBySlot

    if (existingText) {
      if (existingText.status === 'DRAFTED' && onPatchText) {
        // Texto DRAFTED → actualizar body in-place
        onPatchText(existingText.id, editValue.trim())
      } else {
        // Texto PUBLISHED → crear nuevo DRAFTED de reemplazo
        const order = Number.isFinite(existingText.order)
          ? existingText.order
          : (slotConfig.slotIndex + 1)
        onCreateText(editValue.trim(), slotConfig.role, order)
      }
    } else {
      const order = slotConfig.multiple
        ? getNextOrderForRole(slotConfig.role, 'text')
        : (slotConfig.slotIndex + 1)
      onCreateText(editValue.trim(), slotConfig.role, order)
    }

    cancelEdit()
  }, [editValue, editingTextId, onCreateText, section, cancelEdit, getNextOrderForRole, onPatchText])

  const getDefaultMediaOrderForSlot = useCallback((slotConfig: MediaSlotConfig) => {
    if (!slotConfig.multiple) return slotConfig.slotIndex + 1
    return getNextOrderForRole(slotConfig.role, 'media')
  }, [getNextOrderForRole])

  const uploadToSlot = useCallback((slotConfig: MediaSlotConfig, file: File, orderOverride?: number) => {
    const order = orderOverride ?? getDefaultMediaOrderForSlot(slotConfig)
    onUploadMedia(file, sectionId, slotConfig.role, order)
  }, [sectionId, onUploadMedia, getDefaultMediaOrderForSlot])

  const pickFromGallery = useCallback((slotConfig: MediaSlotConfig, options?: { preserveOrder?: number }) => {
    setGalleryTarget({ slot: slotConfig, preserveOrder: options?.preserveOrder })
  }, [])

  const handleGallerySelect = useCallback((media: GalleryMedia) => {
    if (!galleryTarget || !onAssignFromGallery) return
    const order = galleryTarget.preserveOrder ?? getDefaultMediaOrderForSlot(galleryTarget.slot)
    onAssignFromGallery(media.id, sectionId, galleryTarget.slot.role, order)
    setGalleryTarget(null)
  }, [galleryTarget, sectionId, onAssignFromGallery, getDefaultMediaOrderForSlot])

  const ctx: SlotContext = {
    section,
    editingSlotId,
    editValue,
    startEdit,
    saveEdit,
    cancelEdit,
    setEditValue,
    editingTextId,
    uploadToSlot,
    deleteText: onDeleteText,
    deleteMedia: onDeleteMedia,
    swapTextOrder: onSwapTextOrder,
    swapMediaOrder: onSwapMediaOrder,
    publishMedia: onPublishMedia,
    isPublishingMedia,
    publishText: onPublishText,
    isPublishingText,
    uploadR2File: onUploadR2File,
    isUploadingR2,
    downloadFile: onDownloadFile,
    removeFile: onRemoveFile,
    sectionId,
    pickFromGallery: onAssignFromGallery ? pickFromGallery : undefined,
  }

  return { ctx, galleryTarget, setGalleryTarget, handleGallerySelect }
}
