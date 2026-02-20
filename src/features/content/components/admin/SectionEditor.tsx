import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminSectionViewModel } from '../../viewmodels'
import { getSectionDisplayName, getRoleDisplayName } from '../../config/sectionRoles'
import TextEditor from './TextEditor'
import MediaEditor from './MediaEditor'
import { LoadingSpinner, ErrorMessage } from '@shared/components'

interface SectionEditorProps {
  sectionId: number
}

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
    existingTextCount,
    existingMediaCount,
  } = useAdminSectionViewModel(sectionId)

  // ── Edición inline de textos existentes ──
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingBody, setEditingBody] = useState('')

  const startEditing = (textId: number, body: string) => {
    setEditingId(textId)
    setEditingBody(body)
  }

  const confirmEdit = () => {
    if (editingId !== null) {
      editText(editingId, editingBody)
      setEditingId(null)
      setEditingBody('')
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingBody('')
  }

  if (isLoading) return <LoadingSpinner className="py-12" />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />

  const sectionName = section?.name ?? ''
  const displayName = getSectionDisplayName(sectionName)

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-gray-900">
          Editar: {displayName}
        </h2>
        <Link
          to="/preview"
          className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          Previsualizar sitio →
        </Link>
      </div>

      {submitError && <ErrorMessage message={submitError} />}

      {/* ═══════════════════════════════════════════════
          SECCIÓN: TEXTO EXISTENTE
         ═══════════════════════════════════════════════ */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 bg-blue-50 px-4 py-3 sm:px-6">
          <h3 className="text-sm font-semibold text-blue-900">
            📝 Texto existente
          </h3>
        </div>
        <div className="divide-y divide-gray-100 p-4 sm:p-6">
          {section && section.texts.length > 0 ? (
            section.texts.map((t) => (
              <div key={t.id} className="py-4 first:pt-0 last:pb-0">
                {editingId === t.id ? (
                  /* ── Modo edición inline ── */
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-mono text-gray-600">
                        Orden: {t.order}
                      </span>
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        {getRoleDisplayName(t.role ?? '')}
                      </span>
                    </div>
                    <textarea
                      value={editingBody}
                      onChange={(e) => setEditingBody(e.target.value)}
                      rows={4}
                      className="w-full rounded-md border border-blue-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={confirmEdit}
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                      >
                        Guardar edición
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Modo lectura ── */
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-mono text-gray-600">
                          Orden: {t.order}
                        </span>
                        <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                          {getRoleDisplayName(t.role ?? '')}
                        </span>
                        <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                          t.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {t.status === 'PUBLISHED' ? 'Publicado' : 'Borrador'}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-gray-700">{t.body}</p>
                    </div>
                    <div className="flex flex-shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => startEditing(t.id, t.body)}
                        className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => { if (confirm('¿Eliminar este texto?')) removeText(t.id) }}
                        className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="py-4 text-center text-sm text-gray-400">No hay textos en esta sección</p>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          SECCIÓN: CREAR TEXTO
         ═══════════════════════════════════════════════ */}
      <div className="rounded-lg border border-dashed border-blue-300 bg-blue-50/30">
        <div className="border-b border-blue-200 bg-blue-50 px-4 py-3 sm:px-6">
          <h3 className="text-sm font-semibold text-blue-900">
            ✏️ Crear texto
          </h3>
        </div>
        <div className="p-4 sm:p-6">
          <TextEditor
            texts={draftTexts}
            onChange={setDraftTexts}
            sectionName={sectionName}
            existingCount={existingTextCount}
          />

          {draftTexts.length > 0 && (
            <div className="mt-4">
              <button
                type="button"
                onClick={submitNewContent}
                disabled={isSubmitting}
                className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 sm:w-auto"
              >
                {isSubmitting ? 'Guardando...' : `Guardar ${draftTexts.length} texto(s) como borrador`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          SECCIÓN: MEDIA EXISTENTE
         ═══════════════════════════════════════════════ */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 bg-purple-50 px-4 py-3 sm:px-6">
          <h3 className="text-sm font-semibold text-purple-900">
            🖼️ Media existente
          </h3>
        </div>
        <div className="divide-y divide-gray-100 p-4 sm:p-6">
          {section && section.media.length > 0 ? (
            section.media.map((m) => (
              <div key={m.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {m.mimeType?.startsWith('image/') ? (
                    <img src={m.mediaUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                      {m.mimeType?.split('/')[1]?.toUpperCase() ?? 'FILE'}
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-mono text-gray-600">
                      Orden: {m.order}
                    </span>
                    <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                      {getRoleDisplayName(m.role ?? '')}
                    </span>
                    <span className="text-xs text-gray-400">{m.origin}</span>
                  </div>
                  <p className="break-all text-xs text-gray-500">{m.mediaUrl}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { if (confirm('¿Eliminar este media?')) removeMedia(m.id) }}
                  className="flex-shrink-0 rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                >
                  Eliminar
                </button>
              </div>
            ))
          ) : (
            <p className="py-4 text-center text-sm text-gray-400">No hay media en esta sección</p>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          SECCIÓN: SUBIR MEDIA
         ═══════════════════════════════════════════════ */}
      <div className="rounded-lg border border-dashed border-purple-300 bg-purple-50/30">
        <div className="border-b border-purple-200 bg-purple-50 px-4 py-3 sm:px-6">
          <h3 className="text-sm font-semibold text-purple-900">
            📤 Subir media
          </h3>
        </div>
        <div className="p-4 sm:p-6">
          <MediaEditor
            sectionName={sectionName}
            sectionId={sectionId}
            onUpload={uploadFile}
            isUploading={isUploading}
            existingCount={existingMediaCount}
          />
        </div>
      </div>
    </div>
  )
}
