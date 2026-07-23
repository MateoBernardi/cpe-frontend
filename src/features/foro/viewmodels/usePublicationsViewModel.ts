import { useInfiniteQuery, useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import { foroService } from '../services'
import { mapPublicationDTO, mapPublicationPreviewDTO, mapPublicationInputToWriteDTO, mapPublicationInputToPatchDTO } from '../mappers'
import type { ListPublicationsParams, PublicationInput, PublicationPreview } from '../models'
import { foroKeys } from './foroKeys'

const DEFAULT_PAGE_SIZE = 20

/** GET /publications — single page (no pagination state). */
export function usePublications(params?: ListPublicationsParams) {
  return useQuery({
    queryKey: foroKeys.publications(params),
    queryFn: ({ signal }) =>
      foroService.listPublications(
        {
          type_id: params?.typeId,
          category_id: params?.categoryId,
          limit: params?.limit,
          offset: params?.offset,
        },
        signal,
      ),
    select: (dtos) => dtos.map(mapPublicationPreviewDTO),
  })
}

/**
 * GET /publications with limit/offset-based infinite scroll.
 * Each page requests `pageSize` rows; stops once a page returns fewer than
 * `pageSize` items (no dedicated "total count" in the contract).
 */
export function useInfinitePublications(
  params?: Omit<ListPublicationsParams, 'limit' | 'offset'>,
  pageSize: number = DEFAULT_PAGE_SIZE,
  enabled: boolean = true,
) {
  return useInfiniteQuery({
    queryKey: foroKeys.publications({ ...params, limit: pageSize }),
    queryFn: ({ pageParam, signal }) =>
      foroService.listPublications(
        {
          type_id: params?.typeId,
          category_id: params?.categoryId,
          limit: pageSize,
          offset: pageParam,
        },
        signal,
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < pageSize ? undefined : allPages.length * pageSize,
    select: (data) => ({
      ...data,
      pages: data.pages.map((page) => page.map(mapPublicationPreviewDTO)),
    }),
    enabled,
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

export interface FeedByCategory {
  categoryId: number
  items: PublicationPreview[]
  isLoading: boolean
}

/**
 * Fetches one page of publications per category id in parallel (via
 * `useQueries`, so the number of hooks stays stable across renders even
 * though `categoryIds` itself may change as the caller toggles selections).
 * Mirrors `useFeedsByType` — consumers that need a strict AND-intersection
 * across the selected categories compute it client-side from the returned
 * per-category lists.
 */
export function usePublicationsByCategories(categoryIds: number[], limit?: number): FeedByCategory[] {
  const results = useQueries({
    queries: categoryIds.map((categoryId) => ({
      queryKey: foroKeys.publications({ categoryId, limit }),
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        foroService.listPublications({ category_id: categoryId, limit }, signal),
    })),
  })

  return categoryIds.map((categoryId, i) => ({
    categoryId,
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

  const remove = useMutation({
    mutationFn: (id: number) => foroService.deletePublication(id),
    onSuccess: invalidateLists,
  })

  return { create, update, remove }
}
