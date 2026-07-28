import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import { foroService } from '../services'
import { mapPublicationDTO, mapPublicationPreviewDTO, mapPublicationInputToWriteDTO, mapPublicationInputToPatchDTO } from '../mappers'
import type { ListPublicationsParams, PublicationInput, PublicationPreview } from '../models'
import { foroKeys } from './foroKeys'

/** GET /publications — single page (no pagination state). */
export function usePublications(params?: ListPublicationsParams) {
  return useQuery({
    queryKey: foroKeys.publications(params),
    queryFn: ({ signal }) =>
      foroService.listPublications(
        {
          type_id: params?.typeId,
          category_id: params?.categoryId,
          created_by: params?.createdBy,
          limit: params?.limit,
          offset: params?.offset,
        },
        signal,
      ),
    select: (dtos) => dtos.map(mapPublicationPreviewDTO),
  })
}

export interface FeedByType {
  typeId: number
  items: PublicationPreview[]
  isLoading: boolean
}

/**
 * Fetches one short page of publications per publication-type id in parallel
 * (via `useQueries`, so the number of hooks stays stable even though the
 * type list itself comes from an async query). Useful for "one strip per
 * type" home feeds (both the Foro app's home page and the main app's Foro
 * preview section).
 */
export function useFeedsByType(typeIds: number[], limit: number = 4): FeedByType[] {
  const results = useQueries({
    queries: typeIds.map((typeId) => ({
      queryKey: foroKeys.publications({ typeId, limit }),
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        foroService.listPublications({ type_id: typeId, limit }, signal),
    })),
  })

  return typeIds.map((typeId, i) => ({
    typeId,
    items: (results[i]?.data ?? []).map(mapPublicationPreviewDTO),
    isLoading: results[i]?.isLoading ?? false,
  }))
}

/** GET /publications/:id — public. */
export function usePublication(id: number | undefined) {
  return useQuery({
    queryKey: foroKeys.publication(id ?? 0),
    queryFn: ({ signal }) => foroService.getPublication(id as number, signal),
    select: mapPublicationDTO,
    enabled: typeof id === 'number' && id > 0,
  })
}

/** POST/PATCH/DELETE /publications — role publisher|admin (publisher space). */
export function usePublicationMutations() {
  const qc = useQueryClient()
  const invalidateLists = () => qc.invalidateQueries({ queryKey: [...foroKeys.all, 'publications'] })

  const create = useMutation({
    mutationFn: (input: PublicationInput) => foroService.createPublication(mapPublicationInputToWriteDTO(input)),
    onSuccess: invalidateLists,
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<PublicationInput> }) =>
      foroService.updatePublication(id, mapPublicationInputToPatchDTO(input)),
    onSuccess: (_data, variables) => {
      invalidateLists()
      void qc.invalidateQueries({ queryKey: foroKeys.publication(variables.id) })
    },
  })

  /**
   * Soft delete en el backend (`deleted_at`), así que basta con sacar la
   * publicación de las listas cacheadas; sus imágenes quedan huérfanas y las
   * limpia `POST /images/purge-orphans` (sólo admin), no el cliente.
   */
  const remove = useMutation({
    mutationFn: (id: number) => foroService.deletePublication(id),
    onSuccess: (_data, id) => {
      invalidateLists()
      qc.removeQueries({ queryKey: foroKeys.publication(id) })
    },
  })

  return { create, update, remove }
}
