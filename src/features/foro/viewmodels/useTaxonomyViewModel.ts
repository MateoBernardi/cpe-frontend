import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { foroService } from '../services'
import { foroKeys } from './foroKeys'
import type { Category } from '../models'

const LONG_STALE_TIME = 1000 * 60 * 30

// No `select` mapper here: `PublicationType`/`Category` have no separate
// DTO — `foroService` already returns the model shape directly (see
// `dtos/index.ts`'s note on collapsed identity pairs).

/** GET /publication-types — public. Resolve `type_id` -> name/slug at runtime. */
export function usePublicationTypes() {
  return useQuery({
    queryKey: foroKeys.publicationTypes(),
    queryFn: ({ signal }) => foroService.listPublicationTypes(signal),
    staleTime: LONG_STALE_TIME,
  })
}

/** GET /categories — public. */
export function useCategories() {
  return useQuery({
    queryKey: foroKeys.categories(),
    queryFn: ({ signal }) => foroService.listCategories(signal),
    staleTime: LONG_STALE_TIME,
  })
}

/**
 * POST/DELETE /categories — role publisher|admin. Tags were dropped in favor
 * of a single taxonomy (categories), managed straight from the composer
 * instead of a standalone admin screen — this is why the CRUD lives next to
 * the read hook instead of in its own module. Both mutations are optimistic
 * over `foroKeys.categories()` with rollback; `error` is exposed at the top
 * level (in addition to each mutation's own `.error`) so the composer can
 * render one message with `getForoApiErrorMessage` regardless of which of
 * the two actions failed — before this, a failed create/delete silently
 * reverted the optimistic chip with no feedback.
 */
export function useCategoryMutations() {
  const qc = useQueryClient()
  const key = foroKeys.categories()

  const create = useMutation({
    mutationFn: (name: string) => foroService.createCategory({ name }),
    onMutate: async (name) => {
      await qc.cancelQueries({ queryKey: key })
      const previous = qc.getQueryData<Category[]>(key)
      // Slug is server-computed; this placeholder is only visible until
      // `onSettled`'s invalidation replaces it with the real row.
      const optimisticRow: Category = {
        id: -Date.now(),
        name,
        slug: name.trim().toLowerCase().replace(/\s+/g, '-'),
      }
      qc.setQueryData<Category[]>(key, (old) => [...(old ?? []), optimisticRow])
      return { previous }
    },
    onError: (_err, _name, ctx) => {
      if (ctx?.previous !== undefined) qc.setQueryData(key, ctx.previous)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  })

  /**
   * Deleting a category cascades over `categories_publications` on the
   * backend — the composer confirms with `window.confirm` before calling
   * this (same pattern as publication delete), so there's no separate
   * confirmation step here.
   */
  const remove = useMutation({
    mutationFn: (id: number) => foroService.deleteCategory(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: key })
      const previous = qc.getQueryData<Category[]>(key)
      qc.setQueryData<Category[]>(key, (old) => old?.filter((c) => c.id !== id))
      return { previous }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous !== undefined) qc.setQueryData(key, ctx.previous)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  })

  return { create, remove, error: create.error ?? remove.error ?? null }
}
