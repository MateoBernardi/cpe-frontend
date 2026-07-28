import { useQuery } from '@tanstack/react-query'
import { foroService } from '../services'
import { foroKeys } from './foroKeys'

const LONG_STALE_TIME = 1000 * 60 * 30

// No `select` mapper here: `PublicationType`/`Category`/`Tag` have no
// separate DTO — `foroService` already returns the model shape directly
// (see `dtos/index.ts`'s note on collapsed identity pairs).

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

/** GET /tags — public. */
export function useTags() {
  return useQuery({
    queryKey: foroKeys.tags(),
    queryFn: ({ signal }) => foroService.listTags(signal),
    staleTime: LONG_STALE_TIME,
  })
}
