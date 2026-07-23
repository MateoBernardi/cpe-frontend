import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { foroService } from '../services'
import { mapPublicationTypeDTO, mapCategoryDTO, mapTagDTO } from '../mappers'
import type { CategoryWriteDTO, TagWriteDTO } from '../dtos'
import { foroKeys } from './foroKeys'

const LONG_STALE_TIME = 1000 * 60 * 30

/** GET /publication-types — public. Resolve `type_id` -> name/slug at runtime. */
export function usePublicationTypes() {
  return useQuery({
    queryKey: foroKeys.publicationTypes(),
    queryFn: ({ signal }) => foroService.listPublicationTypes(signal),
    select: (dtos) => dtos.map(mapPublicationTypeDTO),
    staleTime: LONG_STALE_TIME,
  })
}

/** GET /categories — public. */
export function useCategories() {
  return useQuery({
    queryKey: foroKeys.categories(),
    queryFn: ({ signal }) => foroService.listCategories(signal),
    select: (dtos) => dtos.map(mapCategoryDTO),
    staleTime: LONG_STALE_TIME,
  })
}

/** GET /tags — public. */
export function useTags() {
  return useQuery({
    queryKey: foroKeys.tags(),
    queryFn: ({ signal }) => foroService.listTags(signal),
    select: (dtos) => dtos.map(mapTagDTO),
    staleTime: LONG_STALE_TIME,
  })
}

/** POST/PATCH/DELETE /categories — role publisher|admin. */
export function useCategoryMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: foroKeys.categories() })

  const create = useMutation({
    mutationFn: (data: CategoryWriteDTO) => foroService.createCategory(data),
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CategoryWriteDTO> }) => foroService.updateCategory(id, data),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (id: number) => foroService.deleteCategory(id),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}

/** POST/PATCH/DELETE /tags — role publisher|admin. */
export function useTagMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: foroKeys.tags() })

  const create = useMutation({
    mutationFn: (data: TagWriteDTO) => foroService.createTag(data),
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TagWriteDTO> }) => foroService.updateTag(id, data),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (id: number) => foroService.deleteTag(id),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}
