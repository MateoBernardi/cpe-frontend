import { useEffect, useState, useCallback } from 'react'
import type { Section } from '../models'
import { contentService } from '../services'
import { mapPublicSectionDTO } from '../mappers'

interface UseMultipleSectionsViewModelResult {
  sections: Map<string, Section>
  isLoading: boolean
  error: Error | null
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
  const [sections, setSections] = useState<Map<string, Section>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSections = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setSections(new Map())

    try {
      // Cargar todas las secciones en paralelo
      const promises = sectionNames.map((sectionName) =>
        contentService
          .getPublicSection(sectionName)
          .then((response) => ({
            name: sectionName,
            section: mapPublicSectionDTO(response.section),
          }))
      )

      const results = await Promise.all(promises)

      // Construir mapa de secciones
      const sectionsMap = new Map<string, Section>()
      for (const { name, section } of results) {
        sectionsMap.set(name, section)
      }

      setSections(sectionsMap)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error desconocido al cargar secciones'))
    } finally {
      setIsLoading(false)
    }
  }, [sectionNames])

  useEffect(() => {
    void fetchSections()
  }, [fetchSections])

  return { sections, isLoading, error, refetch: fetchSections }
}
