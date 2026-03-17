import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import type { Section } from '../models'
import { contentService } from '../services'
import { mapPublicSectionDTO } from '../mappers'

interface UseMultipleSectionsViewModelResult {
  sections: Map<string, Section>
  isLoading: boolean
  error: Error | null
  isRetrying: boolean
  canManualRetry: boolean
  refetch: () => void
}

/**
 * ViewModel para cargar múltiples secciones en paralelo.
 * Espera a que TODAS las secciones estén listas antes de retornar.
 * Ideal para páginas con múltiples secciones como HomePage.
 */
export function useMultipleSectionsViewModel(
  sectionNames: readonly string[]
): UseMultipleSectionsViewModelResult {
  const queries = useQueries({
    queries: sectionNames.map((sectionName) => ({
      queryKey: ['public', 'section', sectionName],
      queryFn: () => contentService.getPublicSection(sectionName),
      select: (response: Awaited<ReturnType<typeof contentService.getPublicSection>>) =>
        mapPublicSectionDTO(response.section),
      enabled: Boolean(sectionName),
    })),
  })

  const sections = useMemo(() => {
    const map = new Map<string, Section>()
    sectionNames.forEach((name, index) => {
      const section = queries[index]?.data
      if (section) map.set(name, section)
    })
    return map
  }, [sectionNames, queries])

  const isLoading = queries.some((q) => q.isLoading)
  const firstError = queries.find((q) => q.isError)?.error
  const error = firstError instanceof Error ? firstError : null
  const isRetrying = queries.some((q) => q.isFetching && q.failureCount > 0 && !q.isError)
  const canManualRetry = queries.some((q) => q.isError)

  const refetch = () => {
    for (const q of queries) {
      void q.refetch()
    }
  }

  return { sections, isLoading, error, isRetrying, canManualRetry, refetch }
}
