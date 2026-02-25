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

// ── Query keys ──

export const contentKeys = {
  all: ['content'] as const,
  sectionsList: () => [...contentKeys.all, 'sections-list'] as const,
  section: (id: number) => [...contentKeys.all, 'section', id] as const,
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

  /** POST nuevos textos como DRAFT */
  submitNewContent: () => void
  isSubmitting: boolean
  submitError: string | null

  /** Upload de imagen (drag & drop / click) — sube como DRAFT */
  uploadFile: (file: File, sectionId: number, role: string, order: number) => void
  isUploading: boolean

  /** Publicar una imagen DRAFT → Cloudflare CDN */
  publishMedia: (mediaId: number) => void
  isPublishingMedia: boolean

  /** Edición local de texto (solo caché, no envía al backend) */
  editText: (textId: number, body: string) => void

  /** DELETE soft */
  removeText: (textId: number) => void
  removeMedia: (mediaId: number) => void

  /** Crear un texto individual desde un slot del canvas (auto-role, auto-order) */
  createSlotText: (body: string, role: string, order: number) => void
  isCreatingSlot: boolean

  /** Intercambiar orden de dos textos por pivotId */
  swapTextOrder: (pivotIdA: number, orderA: number, pivotIdB: number, orderB: number) => void
  /** Intercambiar orden de dos medios por pivotId */
  swapMediaOrder: (pivotIdA: number, orderA: number, pivotIdB: number, orderB: number) => void

  /** Upload de archivo a R2 (Presigned POST) */
  uploadR2File: (file: File, sectionId: number, role: string, order: number) => void
  isUploadingR2: boolean

  /** Descargar archivo de R2 (abre URL firmada) */
  downloadFile: (fileId: number) => void

  /** Eliminar archivo de R2 */
  removeFile: (fileId: number) => void

  refetch: () => void

  /** Cantidad de textos/media/files existentes (para calcular orden) */
  existingTextCount: number
  existingMediaCount: number
  existingFileCount: number
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

  // ── Mutación: agregar contenido (siempre como DRAFT) ──
  const addMut = useMutation({
    mutationFn: (data: AddSectionContentDTO) => contentService.addContent(sectionId, data),
    onSuccess: () => { invalidate(); setDraftTexts([]) },
  })

  const submitNewContent = () => {
    if (draftTexts.length === 0) return
    addMut.mutate({
      texts: draftTexts.map((t) => ({ ...t, status: 'DRAFT' as const })),
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

  // ── Publicar imagen DRAFT → Cloudflare CDN ──
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
            texts: old.section.texts.map((t) =>
              t.id === textId ? { ...t, body } : t,
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
        texts: [{ body: data.body, role: data.role, order: data.order, status: 'DRAFT' as const }],
      }),
    onSuccess: invalidate,
  })

  const createSlotText = (body: string, role: string, order: number) => {
    createSlotMut.mutate({ body, role, order })
  }

  // ── Eliminar ──
  const delTextMut = useMutation({ mutationFn: contentService.deleteText, onSuccess: invalidate })
  const delMediaMut = useMutation({ mutationFn: contentService.deleteMedia, onSuccess: invalidate })

  // ── Intercambiar orden ──
  const swapTextMut = useMutation({
    mutationFn: async ({ pivotIdA, orderA, pivotIdB, orderB }: { pivotIdA: number; orderA: number; pivotIdB: number; orderB: number }) => {
      await Promise.all([
        contentService.patchTextPivot(pivotIdA, { order: orderB }),
        contentService.patchTextPivot(pivotIdB, { order: orderA }),
      ])
    },
    onSuccess: invalidate,
  })

  const swapMediaMut = useMutation({
    mutationFn: async ({ pivotIdA, orderA, pivotIdB, orderB }: { pivotIdA: number; orderA: number; pivotIdB: number; orderB: number }) => {
      await Promise.all([
        contentService.patchMediaPivot(pivotIdA, { order: orderB }),
        contentService.patchMediaPivot(pivotIdB, { order: orderA }),
      ])
    },
    onSuccess: invalidate,
  })

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
    removeText: (id) => delTextMut.mutate(id),
    removeMedia: (id) => delMediaMut.mutate(id),
    swapTextOrder: (pivotIdA, orderA, pivotIdB, orderB) =>
      swapTextMut.mutate({ pivotIdA, orderA, pivotIdB, orderB }),
    swapMediaOrder: (pivotIdA, orderA, pivotIdB, orderB) =>
      swapMediaMut.mutate({ pivotIdA, orderA, pivotIdB, orderB }),
    uploadR2File: (file: File, sId: number, role: string, order: number) =>
      uploadR2Mut.mutate({ file, sId, role, order }),
    isUploadingR2: uploadR2Mut.isPending,
    downloadFile,
    removeFile: (id) => delFileMut.mutate(id),
    refetch: () => void refetch(),
    existingTextCount: section?.texts.length ?? 0,
    existingMediaCount: section?.media.length ?? 0,
    existingFileCount: section?.files.length ?? 0,
  }
}

// ── Hook: publicar todos los cambios pendientes ──

export function usePublishChanges() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (sections: AdminSection[]) => {
      const pending = qc.getQueryData<PendingEdits>(contentKeys.pendingEdits()) ?? { textEdits: {} }

      // 1. Enviar todas las ediciones pendientes de texto
      const editPromises = Object.entries(pending.textEdits).map(([id, body]) =>
        contentService.patchText(Number(id), { body }),
      )
      await Promise.all(editPromises)

      // 2. Publicar todos los textos en DRAFT
      const draftTexts = sections.flatMap((s) =>
        s.texts.filter((t) => t.status === 'DRAFT'),
      )
      const publishPromises = draftTexts.map((t) =>
        contentService.patchText(t.id, { status: 'PUBLISHED' }),
      )
      await Promise.all(publishPromises)
    },
    onSuccess: () => {
      // Limpiar ediciones pendientes
      qc.setQueryData<PendingEdits>(contentKeys.pendingEdits(), { textEdits: {} })
      // Re-validar todas las queries de contenido
      void qc.invalidateQueries({ queryKey: contentKeys.all })
    },
  })
}

// ── Hook: descartar todos los borradores y ediciones pendientes ──

export function useDiscardDrafts() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (sections: AdminSection[]) => {
      // 1. Eliminar textos DRAFT del backend
      const draftTexts = sections.flatMap((s) =>
        s.texts.filter((t) => t.status === 'DRAFT'),
      )
      const deletePromises = draftTexts.map((t) => contentService.deleteText(t.id))
      await Promise.all(deletePromises)
    },
    onSuccess: () => {
      // Limpiar ediciones pendientes de la caché
      qc.setQueryData<PendingEdits>(contentKeys.pendingEdits(), { textEdits: {} })
      // Re-validar todas las queries para refrescar desde el backend
      void qc.invalidateQueries({ queryKey: contentKeys.all })
    },
  })
}
