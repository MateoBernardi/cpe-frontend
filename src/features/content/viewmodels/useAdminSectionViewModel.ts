import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { AdminSection } from '../models'
import type { AddSectionContentDTO, CreateTextInput, CreateMediaInput } from '../dtos'
import { contentService } from '../services'
import { mapAdminSectionDTO, mapSectionListItem } from '../mappers'

// ── Query keys ──

export const contentKeys = {
  all: ['content'] as const,
  sectionsList: () => [...contentKeys.all, 'sections-list'] as const,
  section: (id: number) => [...contentKeys.all, 'section', id] as const,
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

  draftMedia: CreateMediaInput[]
  setDraftMedia: React.Dispatch<React.SetStateAction<CreateMediaInput[]>>

  /** POST nuevos textos/media */
  submitNewContent: () => void
  isSubmitting: boolean
  submitError: string | null

  /** Upload de archivo (drag & drop / click) */
  uploadFile: (file: File, sectionId: number, role: string, order: number) => void
  isUploading: boolean

  /** PATCH texto existente */
  editText: (textId: number, body: string, title?: string) => void

  /** DELETE soft */
  removeText: (textId: number) => void
  removeMedia: (mediaId: number) => void

  refetch: () => void
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
  const [draftMedia, setDraftMedia] = useState<CreateMediaInput[]>([])

  const invalidate = () => void qc.invalidateQueries({ queryKey: contentKeys.section(sectionId) })

  // ── Mutación: agregar contenido ──
  const addMut = useMutation({
    mutationFn: (data: AddSectionContentDTO) => contentService.addContent(sectionId, data),
    onSuccess: () => { invalidate(); setDraftTexts([]); setDraftMedia([]) },
  })

  const submitNewContent = () => {
    if (draftTexts.length === 0 && draftMedia.length === 0) return
    addMut.mutate({
      texts: draftTexts.length > 0 ? draftTexts : undefined,
      media: draftMedia.length > 0 ? draftMedia : undefined,
    })
  }

  // ── Upload de archivo ──
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
    fd.append('origin', 'ADMIN')
    uploadMut.mutate(fd)
  }

  // ── Editar texto ──
  const editTextMut = useMutation({
    mutationFn: ({ id, body, title }: { id: number; body: string; title?: string }) =>
      contentService.patchText(id, { body, title }),
    onSuccess: invalidate,
  })
  const editText = (textId: number, body: string, title?: string) =>
    editTextMut.mutate({ id: textId, body, title })

  // ── Eliminar ──
  const delTextMut = useMutation({ mutationFn: contentService.deleteText, onSuccess: invalidate })
  const delMediaMut = useMutation({ mutationFn: contentService.deleteMedia, onSuccess: invalidate })

  return {
    section: section ?? null,
    isLoading,
    error: qErr instanceof Error ? qErr.message : qErr ? 'Error desconocido' : null,
    draftTexts, setDraftTexts,
    draftMedia, setDraftMedia,
    submitNewContent,
    isSubmitting: addMut.isPending,
    submitError: addMut.error instanceof Error ? addMut.error.message : addMut.error ? 'Error al guardar' : null,
    uploadFile,
    isUploading: uploadMut.isPending,
    editText,
    removeText: (id) => delTextMut.mutate(id),
    removeMedia: (id) => delMediaMut.mutate(id),
    refetch: () => void refetch(),
  }
}
