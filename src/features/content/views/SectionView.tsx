import { useSectionViewModel } from '../viewmodels'
import { SectionRenderer } from '../components'
import { LoadingSpinner, ErrorMessage } from '@shared/components'

interface SectionViewProps {
  sectionName: string
}

/**
 * Vista pública de una sección.
 * Carga y renderiza el contenido publicado.
 */
export default function SectionView({ sectionName }: SectionViewProps) {
  const { section, isLoading, error, refetch } = useSectionViewModel(sectionName)

  if (isLoading) return <LoadingSpinner className="py-12" />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />
  if (!section) return null

  return <SectionRenderer section={section} />
}
