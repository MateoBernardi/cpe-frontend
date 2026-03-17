import { useSectionViewModel } from '../viewmodels'
import { SectionRenderer } from '../components'
import { LoadingSpinner } from '@shared/components'
import { getApiErrorMessage } from '@shared/api'

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
  const {
    section,
    isLoading,
    error,
    isRetrying,
    canManualRetry,
    isRateLimited,
    isNotFound,
    refetch,
  } = useSectionViewModel(sectionName)

  if (isLoading) return <LoadingSpinner className="py-12" />

  if (isRetrying) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Reintentando por demasiadas solicitudes...
      </div>
    )
  }

  if (isNotFound) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
        <h3 className="text-base font-semibold text-slate-800">Sección no encontrada</h3>
        <p className="mt-1 text-sm text-slate-600">
          Esta sección no existe o fue despublicada.
        </p>
        <button
          type="button"
          onClick={refetch}
          className="mt-4 rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <p>{isRateLimited ? 'Demasiadas solicitudes.' : getApiErrorMessage(error)}</p>
        {canManualRetry && (
          <button
            type="button"
            onClick={refetch}
            className="mt-3 rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200"
          >
            Reintentar
          </button>
        )}
      </div>
    )
  }

  if (!section) return null

  return <SectionRenderer section={section} />
}
