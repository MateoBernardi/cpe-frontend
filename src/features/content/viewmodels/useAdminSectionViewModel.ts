import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { Section } from '../models'
import type { CreateSectionDTO, CreateTextInput, CreateMediaInput } from '../dtos'
import { contentService } from '../services'
import { mapSectionDTOToSection } from '../mappers'

/** Query keys para content */
export const contentKeys = {
  all: ['content'] as const,
  sections: () => [...contentKeys.all, 'sections'] as const,
  section: (name: string) => [...contentKeys.sections(), name] as const,
}

interface UseAdminSectionViewModelResult {
  /** Sección cargada desde el servidor */
  section: Section | null
  isLoading: boolean
  error: string | null

  /** Borrador local de textos editables */
  draftTexts: CreateTextInput[]
  setDraftTexts: React.Dispatch<React.SetStateAction<CreateTextInput[]>>

  /** Borrador local de media editables */
  draftMedia: CreateMediaInput[]
  setDraftMedia: React.Dispatch<React.SetStateAction<CreateMediaInput[]>>

  /** Envía los cambios al servidor */
  submit: () => void
  isSubmitting: boolean
  submitError: string | null

  /** Refrescar datos */
  refetch: () => void
}

/**
 * ViewModel de admin con TanStack Query.
 * Permite editar borradores localmente y enviar cuando el usuario presione "Guardar".
 */
export function useAdminSectionViewModel(
  sectionName: string,
  tenantId: number = 1,
): UseAdminSectionViewModelResult {
  const queryClient = useQueryClient()

  // ------- Query: cargar sección -------
  const {
    data: section,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: contentKeys.section(sectionName),
    queryFn: ({ signal }) => contentService.getSection(sectionName, signal),
    select: (data) => mapSectionDTOToSection(data.section),
    retry: 1,
  })

  // ------- Borradores locales (edición sin enviar) -------
  const [draftTexts, setDraftTexts] = useState<CreateTextInput[]>([])
  const [draftMedia, setDraftMedia] = useState<CreateMediaInput[]>([])

  // ------- Mutación: crear/actualizar sección -------
  const mutation = useMutation({
    mutationFn: (data: CreateSectionDTO) => contentService.createSection(data),
    onSuccess: () => {
      // Invalidar cache para refrescar vista
      void queryClient.invalidateQueries({ queryKey: contentKeys.section(sectionName) })
      // Limpiar borradores
      setDraftTexts([])
      setDraftMedia([])
    },
  })

  const submit = () => {
    if (draftTexts.length === 0 && draftMedia.length === 0) return

    mutation.mutate({
      tenant_id: tenantId,
      section_name: sectionName,
      texts: draftTexts.length > 0 ? draftTexts : undefined,
      media: draftMedia.length > 0 ? draftMedia : undefined,
    })
  }

  return {
    section: section ?? null,
    isLoading,
    error: queryError ? (queryError instanceof Error ? queryError.message : 'Error desconocido') : null,
    draftTexts,
    setDraftTexts,
    draftMedia,
    setDraftMedia,
    submit,
    isSubmitting: mutation.isPending,
    submitError: mutation.error
      ? mutation.error instanceof Error
        ? mutation.error.message
        : 'Error al guardar'
      : null,
    refetch: () => void refetch(),
  }
}
