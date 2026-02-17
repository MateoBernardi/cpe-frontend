import { Link } from 'react-router-dom'
import { useAdminSectionViewModel } from '../../viewmodels'
import TextEditor from './TextEditor'
import MediaEditor from './MediaEditor'
import { LoadingSpinner, ErrorMessage } from '@shared/components'

interface SectionEditorProps {
  sectionId: number
}

/**
 * Editor de sección para el panel de admin.
 * Muestra contenido existente con opciones de editar/eliminar.
 * Permite agregar textos y subir media (drag & drop).
 * Incluye link a previsualización pública.
 */
export default function SectionEditor({ sectionId }: SectionEditorProps) {
  const {
    section,
    isLoading,
    error,
    draftTexts,
    setDraftTexts,
    submitNewContent,
    isSubmitting,
    submitError,
    uploadFile,
    isUploading,
    editText,
    removeText,
    removeMedia,
    refetch,
  } = useAdminSectionViewModel(sectionId)

  if (isLoading) return <LoadingSpinner className="py-12" />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />

  const sectionName = section?.name ?? ''

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 capitalize">
          Editar: {sectionName}
        </h2>
        <Link
          to="/preview"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          Previsualizar sitio →
        </Link>
      </div>

      {submitError && <ErrorMessage message={submitError} />}

      {/* ── Contenido existente ── */}
      {section && (section.texts.length > 0 || section.media.length > 0) && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Contenido existente</h3>

          {/* Textos existentes */}
          {section.texts.map((t) => (
            <div key={t.id} className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                    {t.role}
                  </span>
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                    t.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {t.status}
                  </span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-3">{t.body}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const newBody = prompt('Editar texto:', t.body)
                    if (newBody !== null && newBody !== t.body) editText(t.id, newBody)
                  }}
                  className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => { if (confirm('¿Eliminar este texto?')) removeText(t.id) }}
                  className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}

          {/* Media existente */}
          {section.media.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                {m.mimeType?.startsWith('image/') ? (
                  <img src={m.mediaUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                    {m.mimeType?.split('/')[1]?.toUpperCase() ?? 'FILE'}
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                    {m.role}
                  </span>
                  <span className="text-xs text-gray-400">{m.origin}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{m.mediaUrl}</p>
              </div>
              <button
                type="button"
                onClick={() => { if (confirm('¿Eliminar este media?')) removeMedia(m.id) }}
                className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Agregar contenido nuevo ── */}
      <div className="space-y-6 rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-6">
        <h3 className="text-sm font-semibold text-gray-700">Agregar contenido nuevo</h3>

        <TextEditor
          texts={draftTexts}
          onChange={setDraftTexts}
          sectionName={sectionName}
        />

        {draftTexts.length > 0 && (
          <button
            type="button"
            onClick={submitNewContent}
            disabled={isSubmitting}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando textos...' : `Guardar ${draftTexts.length} texto(s)`}
          </button>
        )}

        <hr className="border-gray-200" />

        <MediaEditor
          sectionName={sectionName}
          sectionId={sectionId}
          onUpload={uploadFile}
          isUploading={isUploading}
        />
      </div>
    </div>
  )
}
