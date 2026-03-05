import { useSectionViewModel } from '../viewmodels'
import { SectionRenderer } from '../components'
import { LoadingSpinner } from '@shared/components'

interface SectionViewProps {
  sectionName: string
}

/**
 * Vista pública de una sección.
 * Carga y renderiza el contenido publicado.
 *
 * Si el fetch falla, lanza el error durante el render para que
 * el ErrorBoundary superior lo capture y muestre la página de fallback.
 */
export default function SectionView({ sectionName }: SectionViewProps) {
  const { section, isLoading, error } = useSectionViewModel(sectionName)

  if (isLoading) return <LoadingSpinner className="py-12" />

  // Propagar el error al ErrorBoundary más cercano
  if (error) throw error

  if (!section) return null

  return <SectionRenderer section={section} />
}
