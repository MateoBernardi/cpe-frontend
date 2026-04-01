import { useQuery } from '@tanstack/react-query'
import type { Section } from '../models'
import { contentService } from '../services'
import { mapPublicSectionDTO } from '../mappers'
import { ApiError } from '@shared/api'
import { useDebouncedValue } from '@shared/hooks'
import { contentKeys } from './useAdminSectionViewModel'

interface UseSectionViewModelResult {
  section: Section | null
  isLoading: boolean
  /** The raw error object (if any) — can be ApiError, TypeError, etc. */
  error: Error | null
  isRetrying: boolean
  canManualRetry: boolean
  isRateLimited: boolean
  isNotFound: boolean
  refetch: () => void
}

/**
 * ViewModel para la app pública.
 * Usa GET /public/sections/:sectionName.
 */
export function useSectionViewModel(sectionName: string): UseSectionViewModelResult {
  const debouncedSectionName = useDebouncedValue(sectionName, 250)

  const query = useQuery({
    queryKey: contentKeys.publicSection(debouncedSectionName),
    queryFn: () => contentService.getPublicSection(debouncedSectionName),
    select: (response) => mapPublicSectionDTO(response.section),
    enabled: Boolean(debouncedSectionName),
  })

  const error = query.error instanceof Error ? query.error : null
  const isRateLimited = query.error instanceof ApiError && query.error.status === 429
  const isNotFound = query.error instanceof ApiError && query.error.status === 404
  const isRetrying = query.isFetching && query.failureCount > 0 && !query.isError
  const canManualRetry = query.isError

  return {
    section: query.data ?? null,
    isLoading: query.isLoading,
    error,
    isRetrying,
    canManualRetry,
    isRateLimited,
    isNotFound,
    refetch: () => void query.refetch(),
  }
}
