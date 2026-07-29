import { useQuery, useQueries, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { foroService } from '../services'
import { mapPublicationDTO, mapPublicationPreviewDTO, mapPublicationInputToWriteDTO, mapPublicationInputToPatchDTO } from '../mappers'
import type { ListPublicationsParams, PublicationInput, PublicationPreview, Category } from '../models'
import type { PublicationDTO, PublicationPreviewDTO, MyInteractionDTO } from '../dtos'
import { useForoAuth } from '../auth/foroAuthContext'
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

/**
 * Every publication mutation touches the same three cache regions: the
 * publications lists (any params variant), "mis interacciones" (a saved/
 * created/edited publication is embedded as `.publication` inside those
 * rows), and — when the id is known — the single publication's detail cache.
 * Before this helper, mutations only invalidated `[...foroKeys.all, 'publications']`,
 * which missed `myInteractions` (so "Guardados"/"Interacciones" could show a
 * stale title/status after an edit) and missed `publication(id)` on `create`
 * (no id to invalidate with until the backend assigns one in `onSuccess`).
 */
function invalidatePublicationScope(qc: QueryClient, id?: number) {
  void qc.invalidateQueries({ queryKey: foroKeys.publicationsPrefix() })
  void qc.invalidateQueries({ queryKey: foroKeys.myInteractionsPrefix() })
  if (id != null) void qc.invalidateQueries({ queryKey: foroKeys.publication(id) })
}

/**
 * Resolves `categoryIds` against whatever `foroKeys.categories()` happens to
 * have cached, for an immediate (if occasionally incomplete) optimistic
 * `categories: Category[]` — the input only carries ids, never full rows.
 * `undefined` means "field not touched by this mutation" (kept out of the
 * patch entirely); an empty cache/list just yields `[]`, corrected once
 * `onSettled` invalidates and refetches the real value.
 */
function resolveCategories(ids: number[] | undefined, cache: Category[] | undefined): Category[] | undefined {
  if (ids === undefined) return undefined
  if (!cache) return []
  const byId = new Map(cache.map((c) => [c.id, c]))
  return ids.map((id) => byId.get(id)).filter((c): c is Category => c !== undefined)
}

function externalLinksToMap(links: PublicationInput['externalLinks']): Record<string, string> | undefined {
  if (links === undefined) return undefined
  return Object.fromEntries(links.map((l) => [l.label, l.url]))
}

/** Builds the `Partial<PublicationDTO>` patch for every field the detail cache actually has. */
function buildDetailPatch(input: Partial<PublicationInput>, categoriesCache: Category[] | undefined): Partial<PublicationDTO> {
  const patch: Partial<PublicationDTO> = {}
  if (input.title !== undefined) patch.title = input.title
  if (input.subtitle !== undefined) patch.subtitle = input.subtitle
  if (input.frontImageUrl !== undefined) patch.image_url = input.frontImageUrl
  if (input.content !== undefined) patch.content = input.content
  if (input.typeId !== undefined) patch.type_id = input.typeId
  if (input.categoryIds !== undefined) patch.categories = resolveCategories(input.categoryIds, categoriesCache)
  const externalLinks = externalLinksToMap(input.externalLinks)
  if (externalLinks !== undefined) patch.external_links = externalLinks
  if (input.status !== undefined) patch.status = input.status
  return patch
}

/** Same as `buildDetailPatch`, but only the fields `PublicationPreviewDTO` actually carries
 *  (no `content`/`images` on a list row). */
function buildPreviewPatch(input: Partial<PublicationInput>, categoriesCache: Category[] | undefined): Partial<PublicationPreviewDTO> {
  const patch: Partial<PublicationPreviewDTO> = {}
  if (input.title !== undefined) patch.title = input.title
  if (input.subtitle !== undefined) patch.subtitle = input.subtitle
  if (input.frontImageUrl !== undefined) patch.image_url = input.frontImageUrl
  if (input.typeId !== undefined) patch.type_id = input.typeId
  if (input.categoryIds !== undefined) patch.categories = resolveCategories(input.categoryIds, categoriesCache)
  const externalLinks = externalLinksToMap(input.externalLinks)
  if (externalLinks !== undefined) patch.external_links = externalLinks
  if (input.status !== undefined) patch.status = input.status
  return patch
}

/** POST/PATCH/DELETE /publications — role publisher|admin (publisher space). */
export function usePublicationMutations() {
  const qc = useQueryClient()
  const { user } = useForoAuth()

  /**
   * Inserts an optimistic row (`id: -Date.now()`, same convention as the
   * comment/interaction optimistic rows) at the top of every cached list
   * that matches `foroKeys.publicationsPrefix()`, so a freshly published
   * item shows up instantly instead of waiting for `onSuccess`'s
   * invalidation + refetch. Rolled back on error; the real row (with its
   * server-assigned id) arrives via the invalidation either way.
   */
  const create = useMutation({
    mutationFn: (input: PublicationInput) => foroService.createPublication(mapPublicationInputToWriteDTO(input)),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: foroKeys.publicationsPrefix() })
      const previousLists = qc.getQueriesData<PublicationPreviewDTO[]>({ queryKey: foroKeys.publicationsPrefix() })
      const categoriesCache = qc.getQueryData<Category[]>(foroKeys.categories())

      const optimisticRow: PublicationPreviewDTO = {
        id: -Date.now(),
        title: input.title,
        subtitle: input.subtitle ?? null,
        image_url: input.frontImageUrl ?? null,
        type_id: input.typeId ?? null,
        created_by: user?.id ?? '',
        created_by_name: user?.name ?? null,
        created_at: new Date().toISOString(),
        categories: resolveCategories(input.categoryIds, categoriesCache) ?? [],
        interactions: { saves: 0, visits: 0, favorites: 0, comments: 0 },
        external_links: externalLinksToMap(input.externalLinks),
        status: input.status ?? 'published',
      }
      qc.setQueriesData<PublicationPreviewDTO[] | undefined>(
        { queryKey: foroKeys.publicationsPrefix() },
        (old) => (old ? [optimisticRow, ...old] : old),
      )

      return { previousLists }
    },
    onError: (_err, _input, ctx) => {
      ctx?.previousLists?.forEach(([key, data]) => qc.setQueryData(key, data))
    },
    onSuccess: (data) => invalidatePublicationScope(qc, data.id),
  })

  /**
   * Patches EVERY field present in `input` — not just `title`/`status` like
   * before — on both the detail cache and every matching list cache, with
   * the same `previousDetail`/`previousLists` rollback. `content`/`images`
   * only exist on the detail DTO so they're skipped on list rows;
   * `categories` is best-effort resolved from the categories cache (see
   * `resolveCategories`) since the input only carries ids.
   */
  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<PublicationInput> }) =>
      foroService.updatePublication(id, mapPublicationInputToPatchDTO(input)),
    onMutate: async ({ id, input }) => {
      await qc.cancelQueries({ queryKey: foroKeys.publication(id) })
      await qc.cancelQueries({ queryKey: foroKeys.publicationsPrefix() })

      const previousDetail = qc.getQueryData<PublicationDTO>(foroKeys.publication(id))
      const previousLists = qc.getQueriesData<PublicationPreviewDTO[]>({ queryKey: foroKeys.publicationsPrefix() })
      const categoriesCache = qc.getQueryData<Category[]>(foroKeys.categories())

      const detailPatch = buildDetailPatch(input, categoriesCache)
      const previewPatch = buildPreviewPatch(input, categoriesCache)

      if (Object.keys(detailPatch).length > 0) {
        qc.setQueryData<PublicationDTO | undefined>(foroKeys.publication(id), (old) => (old ? { ...old, ...detailPatch } : old))
      }
      if (Object.keys(previewPatch).length > 0) {
        qc.setQueriesData<PublicationPreviewDTO[] | undefined>(
          { queryKey: foroKeys.publicationsPrefix() },
          (old) => old?.map((p) => (p.id === id ? { ...p, ...previewPatch } : p)),
        )
      }

      return { previousDetail, previousLists }
    },
    onError: (_err, variables, ctx) => {
      if (ctx?.previousDetail !== undefined) qc.setQueryData(foroKeys.publication(variables.id), ctx.previousDetail)
      ctx?.previousLists?.forEach(([key, data]) => qc.setQueryData(key, data))
    },
    onSettled: (_data, _err, variables) => invalidatePublicationScope(qc, variables.id),
  })

  /**
   * Soft delete en el backend (`deleted_at`); sus imágenes quedan huérfanas y
   * las limpia `POST /images/purge-orphans` (sólo admin), no el cliente. The
   * optimistic step drops the row from every cached list + "mis
   * interacciones" instantly. The detail cache is `removeQueries`'d (not
   * invalidated) once the delete is confirmed, same as before this change —
   * so a slow refetch can't flash a since-deleted row back onto a still-open
   * detail page; there's no "undo" screen that would need it kept warm.
   */
  const remove = useMutation({
    mutationFn: (id: number) => foroService.deletePublication(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: foroKeys.publicationsPrefix() })
      await qc.cancelQueries({ queryKey: foroKeys.myInteractionsPrefix() })

      const previousLists = qc.getQueriesData<PublicationPreviewDTO[]>({ queryKey: foroKeys.publicationsPrefix() })
      const previousMyInteractions = qc.getQueriesData<MyInteractionDTO[]>({ queryKey: foroKeys.myInteractionsPrefix() })

      qc.setQueriesData<PublicationPreviewDTO[] | undefined>(
        { queryKey: foroKeys.publicationsPrefix() },
        (old) => old?.filter((p) => p.id !== id),
      )
      qc.setQueriesData<MyInteractionDTO[] | undefined>(
        { queryKey: foroKeys.myInteractionsPrefix() },
        (old) => old?.filter((mi) => mi.publication.id !== id),
      )

      return { previousLists, previousMyInteractions }
    },
    onError: (_err, _id, ctx) => {
      ctx?.previousLists?.forEach(([key, data]) => qc.setQueryData(key, data))
      ctx?.previousMyInteractions?.forEach(([key, data]) => qc.setQueryData(key, data))
    },
    onSettled: (_data, _err, id) => {
      invalidatePublicationScope(qc) // lists + my-interactions; detail handled explicitly below
      qc.removeQueries({ queryKey: foroKeys.publication(id) })
    },
  })

  return { create, update, remove, error: create.error ?? update.error ?? remove.error ?? null }
}
