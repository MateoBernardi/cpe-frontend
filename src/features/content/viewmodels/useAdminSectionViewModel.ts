import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useCallback } from 'react'
import type { AdminSection } from '../models'
import type {
  AddSectionContentDTO,
  CreateTextInput,
  AdminSectionResponseDTO,
} from '../dtos'
import { contentService, fileService } from '../services'
import { mapAdminSectionDTO, mapSectionListItem } from '../mappers'
import { galleryKeys } from './useGalleryViewModel'

// ── Query keys ──

export const contentKeys = {
  all: ['content'] as const,
  sectionsList: () => [...contentKeys.all, 'sections-list'] as const,
  section: (id: number) => [...contentKeys.all, 'section', id] as const,
  preview: (id: number) => [...contentKeys.all, 'preview', id] as const,
  pendingEdits: () => [...contentKeys.all, 'pending-edits'] as const,
}

/** Ediciones locales que aún no se enviaron al backend */
export interface PendingEdits {
  textEdits: Record<number, string> // textId → newBody
}

// ── Hook: listar secciones ──

export function useSectionsList() {
  return useQuery({
    queryKey: contentKeys.sectionsList(),
    queryFn: ({ signal }) => contentService.listSections(signal),
    select: (data) => data.sections.map(mapSectionListItem),
  })
}

// ── Hook: ViewModel de sección admin ──

interface UseAdminSectionVMResult {
  section: AdminSection | null
  isLoading: boolean
  error: string | null

  draftTexts: CreateTextInput[]
  setDraftTexts: React.Dispatch<React.SetStateAction<CreateTextInput[]>>

  /** POST nuevos textos como DRAFTED */
  submitNewContent: () => void
  isSubmitting: boolean
  submitError: string | null

  /** Upload de imagen (drag & drop / click) — sube como DRAFTED */
  uploadFile: (file: File, sectionId: number, role: string, order: number) => void
  isUploading: boolean

  /** Publicar una imagen DRAFTED → Cloudflare CDN */
  publishMedia: (mediaId: number) => void
  isPublishingMedia: boolean

  /** Edición local de texto (solo caché, no envía al backend) */
  editText: (textId: number, body: string) => void

  /** Soft delete de bloque */
  removeBlock: (blockId: number) => void

  /** DELETE soft del contenido directamente (texto o media) */
  removeText: (textId: number) => void
  removeMedia: (mediaId: number) => void

  /** Crear un texto individual desde un slot del canvas (auto-role, auto-order) */
  createSlotText: (body: string, role: string, order: number) => void
  isCreatingSlot: boolean

  /** Intercambiar orden de dos bloques por blockId */
  swapTextOrder: (blockIdA: number, orderA: number, blockIdB: number, orderB: number) => void
  /** Intercambiar orden de dos bloques de media por blockId */
  swapMediaOrder: (blockIdA: number, orderA: number, blockIdB: number, orderB: number) => void

  /** Upload de archivo a R2 (Presigned POST) */
  uploadR2File: (file: File, sectionId: number, role: string, order: number) => void
  isUploadingR2: boolean

  /** Descargar archivo de R2 (abre URL firmada) */
  downloadFile: (fileId: number) => void

  /** Eliminar archivo de R2 */
  removeFile: (fileId: number) => void

  /** Asignar media existente (galería) a la sección */
  assignFromGallery: (mediaId: number, sectionId: number, role: string, order: number) => void
  isAssigningFromGallery: boolean

  refetch: () => void

  /** Cantidad de textos/media/files existentes (para calcular orden) */
  existingTextCount: number
  existingMediaCount: number
  existingFileCount: number

  /** Cantidad de bloques DRAFTED pendientes de publicación */
  draftedBlockCount: number
}

export function useAdminSectionViewModel(sectionId: number): UseAdminSectionVMResult {
  const qc = useQueryClient()

  // ── Query: cargar sección ──
  const { data: section, isLoading, error: qErr, refetch } = useQuery({
    queryKey: contentKeys.section(sectionId),
    queryFn: ({ signal }) => contentService.getAdminSection(sectionId, signal),
    select: (d) => mapAdminSectionDTO(d.section),
    retry: 1,
    enabled: sectionId > 0,
  })

  // ── Borradores locales ──
  const [draftTexts, setDraftTexts] = useState<CreateTextInput[]>([])

  const invalidate = () => void qc.invalidateQueries({ queryKey: contentKeys.section(sectionId) })

  // ── Mutación: agregar contenido (siempre como DRAFTED) ──
  const addMut = useMutation({
    mutationFn: (data: AddSectionContentDTO) => contentService.addContent(sectionId, data),
    onSuccess: () => { invalidate(); setDraftTexts([]) },
  })

  const submitNewContent = () => {
    if (draftTexts.length === 0) return
    addMut.mutate({
      texts: draftTexts,
    })
  }

  // ── Upload de imagen directo a Cloudflare (PUBLISHED) ──
  const uploadMut = useMutation({
    mutationFn: (fd: FormData) => contentService.uploadMedia(fd),
    onSuccess: invalidate,
  })

  const uploadFile = (file: File, _sectionId: number, role: string, order: number) => {
    const fd = new FormData()
    fd.append('image', file)
    fd.append('section_id', _sectionId.toString())
    fd.append('role', role)
    fd.append('order', order.toString())
    fd.append('title', `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
    uploadMut.mutate(fd)
  }

  // ── Publicar imagen DRAFTED → Cloudflare CDN ──
  const publishMediaMut = useMutation({
    mutationFn: (mediaId: number) => contentService.publishMedia(mediaId),
    onSuccess: invalidate,
  })

  // ── Upload de archivo a R2 (3 pasos: presigned → upload → confirm) ──
  const uploadR2Mut = useMutation({
    mutationFn: ({ file, sId, role, order }: { file: File; sId: number; role: string; order: number }) =>
      fileService.uploadFile(file, {
        title: file.name,
        sectionId: sId,
        role,
        order,
      }),
    onSuccess: invalidate,
  })

  // ── Descargar archivo de R2 ──
  const downloadFile = async (fileId: number) => {
    try {
      const { url } = await fileService.getDownloadUrl(fileId)
      window.open(url, '_blank')
    } catch (err) {
      console.error('Error al obtener URL de descarga:', err)
    }
  }

  // ── Eliminar archivo de R2 ──
  const delFileMut = useMutation({ mutationFn: fileService.deleteFile, onSuccess: invalidate })

  // ── Asignar media existente desde galería ──
  const assignGalleryMut = useMutation({
    mutationFn: ({ mediaId, sId, role, order }: { mediaId: number; sId: number; role: string; order: number }) =>
      contentService.assignMediaToSection(sId, [{ media_id: mediaId, role, order }]),
    onSuccess: () => {
      invalidate()
      void qc.invalidateQueries({ queryKey: galleryKeys.all })
    },
  })

  // ── Editar texto localmente (solo caché) ──
  const editText = useCallback((textId: number, body: string) => {
    // 1. Actualizar la caché de la sección de forma optimista
    qc.setQueryData<AdminSectionResponseDTO>(
      contentKeys.section(sectionId),
      (old) => {
        if (!old) return old
        return {
          ...old,
          section: {
            ...old.section,
            blocks: old.section.blocks.map((b) =>
              b.type === 'text' && b.text?.id === textId
                ? { ...b, text: { ...b.text!, body } }
                : b,
            ),
          },
        }
      },
    )
    // 2. Guardar la edición pendiente
    const current = qc.getQueryData<PendingEdits>(contentKeys.pendingEdits()) ?? { textEdits: {} }
    qc.setQueryData<PendingEdits>(contentKeys.pendingEdits(), {
      ...current,
      textEdits: { ...current.textEdits, [textId]: body },
    })
  }, [qc, sectionId])

  // ── Crear texto individual desde slot del canvas ──
  const createSlotMut = useMutation({
    mutationFn: (data: { body: string; role: string; order: number }) =>
      contentService.addContent(sectionId, {
        texts: [{ body: data.body, role: data.role, order: data.order }],
      }),
    onSuccess: invalidate,
  })

  const createSlotText = (body: string, role: string, order: number) => {
    createSlotMut.mutate({ body, role, order })
  }

  // ── Eliminar bloque (soft delete a nivel de section_blocks) ──
  const delBlockMut = useMutation({ mutationFn: contentService.deleteBlock, onSuccess: invalidate })

  // ── Eliminar contenido directamente (si se necesita) ──
  const delTextMut = useMutation({ mutationFn: contentService.deleteText, onSuccess: invalidate })
  const delMediaMut = useMutation({ mutationFn: contentService.deleteMedia, onSuccess: invalidate })

  // ── Intercambiar orden (usa PATCH /blocks/:blockId) ──
  const swapBlockMut = useMutation({
    mutationFn: async ({ blockIdA, orderA, blockIdB, orderB }: { blockIdA: number; orderA: number; blockIdB: number; orderB: number }) => {
      await Promise.all([
        contentService.patchBlock(blockIdA, { order: orderB }),
        contentService.patchBlock(blockIdB, { order: orderA }),
      ])
    },
    onSuccess: invalidate,
  })

  // ── Calcular bloques DRAFTED pendientes ──
  const draftedBlockCount =
    (section?.texts.filter((t) => t.status === 'DRAFTED').length ?? 0) +
    (section?.media.filter((m) => m.status === 'DRAFTED').length ?? 0) +
    (section?.files.filter((f) => f.status === 'DRAFTED').length ?? 0)

  return {
    section: section ?? null,
    isLoading,
    error: qErr instanceof Error ? qErr.message : qErr ? 'Error desconocido' : null,
    draftTexts,
    setDraftTexts,
    submitNewContent,
    isSubmitting: addMut.isPending,
    submitError: addMut.error instanceof Error ? addMut.error.message : addMut.error ? 'Error al guardar' : null,
    uploadFile,
    isUploading: uploadMut.isPending,
    publishMedia: (mediaId: number) => publishMediaMut.mutate(mediaId),
    isPublishingMedia: publishMediaMut.isPending,
    editText,
    createSlotText,
    isCreatingSlot: createSlotMut.isPending,
    removeBlock: (blockId) => delBlockMut.mutate(blockId),
    removeText: (id) => delTextMut.mutate(id),
    removeMedia: (id) => delMediaMut.mutate(id),
    swapTextOrder: (blockIdA, orderA, blockIdB, orderB) =>
      swapBlockMut.mutate({ blockIdA, orderA, blockIdB, orderB }),
    swapMediaOrder: (blockIdA, orderA, blockIdB, orderB) =>
      swapBlockMut.mutate({ blockIdA, orderA, blockIdB, orderB }),
    uploadR2File: (file: File, sId: number, role: string, order: number) =>
      uploadR2Mut.mutate({ file, sId, role, order }),
    isUploadingR2: uploadR2Mut.isPending,
    downloadFile,
    removeFile: (id) => delFileMut.mutate(id),
    assignFromGallery: (mediaId, sId, role, order) =>
      assignGalleryMut.mutate({ mediaId, sId, role, order }),
    isAssigningFromGallery: assignGalleryMut.isPending,
    refetch: () => void refetch(),
    existingTextCount: section?.texts.length ?? 0,
    existingMediaCount: section?.media.length ?? 0,
    existingFileCount: section?.files.length ?? 0,
    draftedBlockCount,
  }
}

// ── Hook: publicar una sección (DRAFTED → PUBLISHED) ──

export function usePublishSection() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (sectionId: number) => {
      // 1. Enviar ediciones pendientes de texto primero
      const pending = qc.getQueryData<PendingEdits>(contentKeys.pendingEdits()) ?? { textEdits: {} }
      const editPromises = Object.entries(pending.textEdits).map(([id, body]) =>
        contentService.patchText(Number(id), { body }),
      )
      await Promise.all(editPromises)

      // 2. Publicar sección (DRAFTED → PUBLISHED en una transacción)
      await contentService.publishSection(sectionId)
    },
    onSuccess: () => {
      qc.setQueryData<PendingEdits>(contentKeys.pendingEdits(), { textEdits: {} })
      void qc.invalidateQueries({ queryKey: contentKeys.all })
    },
  })
}

// ── Hook: publicar múltiples secciones a la vez ──

export function usePublishChanges() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (sectionIds: number[]) => {
      // 1. Enviar todas las ediciones pendientes de texto
      const pending = qc.getQueryData<PendingEdits>(contentKeys.pendingEdits()) ?? { textEdits: {} }
      const editPromises = Object.entries(pending.textEdits).map(([id, body]) =>
        contentService.patchText(Number(id), { body }),
      )
      await Promise.all(editPromises)

      // 2. Publicar cada sección
      const publishPromises = sectionIds.map((id) =>
        contentService.publishSection(id),
      )
      await Promise.all(publishPromises)
    },
    onSuccess: () => {
      qc.setQueryData<PendingEdits>(contentKeys.pendingEdits(), { textEdits: {} })
      void qc.invalidateQueries({ queryKey: contentKeys.all })
    },
  })
}

// ── Hook: descartar todos los borradores y ediciones pendientes ──

export function useDiscardDrafts() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (sections: AdminSection[]) => {
      // Eliminar bloques DRAFTED del backend (soft delete)
      const draftBlocks = sections.flatMap((s) => [
        ...s.texts.filter((t) => t.status === 'DRAFTED').map((t) => t.blockId),
        ...s.media.filter((m) => m.status === 'DRAFTED').map((m) => m.blockId),
        ...s.files.filter((f) => f.status === 'DRAFTED').map((f) => f.blockId),
      ])
      const deletePromises = draftBlocks.map((blockId) => contentService.deleteBlock(blockId))
      await Promise.all(deletePromises)
    },
    onSuccess: () => {
      qc.setQueryData<PendingEdits>(contentKeys.pendingEdits(), { textEdits: {} })
      void qc.invalidateQueries({ queryKey: contentKeys.all })
    },
  })
}
