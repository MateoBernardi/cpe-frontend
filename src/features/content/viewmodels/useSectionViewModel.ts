import { useEffect, useState } from 'react'
import type { Section } from '../models'
import { contentService } from '../services'
import { mapPublicSectionDTO } from '../mappers'

interface UseSectionViewModelResult {
  section: Section | null
  isLoading: boolean
  /** The raw error object (if any) — can be ApiError, TypeError, etc. */
  error: Error | null
  refetch: () => void
}

/**
 * ViewModel para la app pública.
 * Usa GET /public/sections/:sectionName.
 */
export function useSectionViewModel(sectionName: string): UseSectionViewModelResult {
  const [section, setSection] = useState<Section | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSection = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await contentService.getPublicSection(sectionName)
      setSection(mapPublicSectionDTO(response.section))
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error desconocido'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchSection()
  }, [sectionName])

  return { section, isLoading, error, refetch: fetchSection }
}
