import { useAdminSectionViewModel } from '../../viewmodels'
import SectionRenderer from '../SectionRenderer'
import TextEditor from './TextEditor'
import MediaEditor from './MediaEditor'
import { LoadingSpinner, ErrorMessage } from '@shared/components'

interface SectionEditorProps {
  sectionName: string
  tenantId?: number
}

/**
 * Editor de sección para el panel de admin.
 * Permite editar borradores localmente y ver previsualización en tiempo real.
 * Los cambios se envían sólo cuando el usuario presiona "Guardar".
 */
export default function SectionEditor({ sectionName, tenantId = 1 }: SectionEditorProps) {
  const {
    section,
    isLoading,
    error,
    draftTexts,
    setDraftTexts,
    draftMedia,
    setDraftMedia,
    submit,
    isSubmitting,
    submitError,
    refetch,
  } = useAdminSectionViewModel(sectionName, tenantId)

  if (isLoading) return <LoadingSpinner className="py-12" />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Panel de edición */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 capitalize">
            Editar: {sectionName}
          </h2>
          <button
            onClick={submit}
            disabled={isSubmitting || (draftTexts.length === 0 && draftMedia.length === 0)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>

        {submitError && <ErrorMessage message={submitError} />}

        <TextEditor texts={draftTexts} onChange={setDraftTexts} />
        <MediaEditor media={draftMedia} onChange={setDraftMedia} />
      </div>

      {/* Panel de previsualización */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Previsualización</h2>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          {section ? (
            <SectionRenderer section={section} />
          ) : (
            <p className="text-center text-sm text-gray-400">
              Sección vacía. Agrega contenido para previsualizar.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
