import { useEffect, useState } from 'react'
import type { Section } from '../models'
import { contentService } from '../services'
import { mapPublicSectionDTO } from '../mappers'

interface UseSectionViewModelResult {
  section: Section | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

/**
 * ViewModel para la app pública.
 * Usa GET /content/sections/public/:sectionName.
 */
export function useSectionViewModel(sectionName: string): UseSectionViewModelResult {
  const [section, setSection] = useState<Section | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSection = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await contentService.getPublicSection(sectionName)
      setSection(mapPublicSectionDTO(response.section))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchSection()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionName])

  return { section, isLoading, error, refetch: fetchSection }
}
