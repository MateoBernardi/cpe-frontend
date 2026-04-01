import { useState, useMemo, useEffect } from 'react'
import { useGalleryViewModel, useSectionsList } from '@features/content/viewmodels'
import type { GalleryMedia } from '@features/content/viewmodels'
import { getSectionDisplayName, getSectionRoles, ROLE_DISPLAY_NAMES } from '@features/content/config/sectionRoles'
import { LoadingSpinner, ErrorMessage } from '@shared/components'

// ── Assign modal state ──

interface AssignTarget {
  media: GalleryMedia
}

// ── Delete confirmation dialog ──

function DeleteErrorDialog({
  error,
  onRemoveAssociation,
  isRemoving,
  onClose,
}: {
  error: { mediaId: number; message: string; associations: GalleryMedia['associations'] }
  onRemoveAssociation: (blockId: number) => void
  isRemoving: boolean
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
            <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">No se puede eliminar</h3>
            <p className="mt-1 text-sm text-gray-600">{error.message}</p>
          </div>
        </div>

        {error.associations.length > 0 && (
          <div className="mb-4 space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Asociaciones activas
            </p>
            <div className="max-h-48 space-y-1.5 overflow-y-auto">
              {error.associations.map((a) => (
                <div
                  key={a.blockId}
                  className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
                >
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">
                      {getSectionDisplayName(a.sectionName)}
                    </span>
                    {a.role && (
                      <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                        {a.role}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveAssociation(a.blockId)}
                    disabled={isRemoving}
                    className="rounded-md px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                  >
                    Eliminar asociación
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Assign to Section Dialog ──

function AssignDialog({
  media,
  sections,
  onAssign,
  isAssigning,
  assignError,
  onClose,
}: {
  media: GalleryMedia
  sections: { id: number; name: string }[]
  onAssign: (sectionId: number, mediaId: number, role: string, order: number) => void
  isAssigning: boolean
  assignError?: string | null
  onClose: () => void
}) {
  const [sectionId, setSectionId] = useState<number>(sections[0]?.id ?? 0)
  const [role, setRole] = useState('')
  const [order, setOrder] = useState(1)
  const [rolesOpen, setRolesOpen] = useState(true)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (submitted && !isAssigning && !assignError) {
      onClose()
    }
  }, [submitted, isAssigning, assignError, onClose])

  // Obtener la sección seleccionada para derivar sus media roles
  const selectedSection = sections.find((s) => s.id === sectionId)
  const mediaRoles = selectedSection ? getSectionRoles(selectedSection.name).mediaRoles : []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sectionId || !role) return
    onAssign(sectionId, media.id, role, order)
    setSubmitted(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <img
            src={media.url}
            alt=""
            className="h-16 w-16 rounded-lg object-cover ring-1 ring-gray-200"
          />
          <div>
            <h3 className="text-base font-semibold text-gray-900">Asignar a sección</h3>
            <p className="text-sm text-gray-500">{media.title ?? 'Sin título'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Sección</label>
            <select
              value={sectionId}
              onChange={(e) => { setSectionId(Number(e.target.value)); setRole(''); setRolesOpen(true) }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {getSectionDisplayName(s.name)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setRolesOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              <span>
                Rol{role ? ': ' : ''}
                {role && (
                  <span className="font-semibold text-teal-700">
                    {ROLE_DISPLAY_NAMES[role] ?? role}
                  </span>
                )}
                {!role && <span className="ml-1 text-gray-400">— seleccioná uno</span>}
              </span>
              <svg
                className={`h-4 w-4 text-gray-500 transition-transform ${rolesOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {rolesOpen && (
              <div className="mt-2 rounded-lg border border-gray-200 bg-white">
                {mediaRoles.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 p-3">
                    {mediaRoles.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => { setRole(r); setRolesOpen(false) }}
                        className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          role === r
                            ? 'bg-teal-600 text-white ring-2 ring-teal-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-teal-50 hover:text-teal-700'
                        }`}
                      >
                        {ROLE_DISPLAY_NAMES[r] ?? r}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="p-3 text-center text-xs text-gray-400">
                    Esta sección no tiene roles de media configurados
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Orden</label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              min={1}
              className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isAssigning || !role}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
            >
              {isAssigning ? 'Asignando…' : 'Asignar'}
            </button>
          </div>
          {assignError && submitted && (
            <p className="pt-2 text-sm text-red-600">{assignError}</p>
          )}
        </form>
      </div>
    </div>
  )
}

// ── Gallery Page ──

export default function AdminGalleryPage() {
  const {
    gallery,
    isLoading,
    error,
    deleteMedia,
    isDeleting,
    deleteError,
    clearDeleteError,
    assignMedia,
    isAssigning,
    assignError,
    removeAssociation,
    isRemovingAssociation,
  } = useGalleryViewModel()

  const { data: sectionsList } = useSectionsList()

  const [assignTarget, setAssignTarget] = useState<AssignTarget | null>(null)
  const [search, setSearch] = useState('')

  const filteredGallery = useMemo(() => {
    if (!search.trim()) return gallery
    const q = search.toLowerCase()
    return gallery.filter(
      (m) =>
        m.title?.toLowerCase().includes(q) ||
        m.mimeType?.toLowerCase().includes(q) ||
        m.associations.some((a) => a.sectionName.includes(q) || a.role?.includes(q)),
    )
  }, [gallery, search])

  if (isLoading) return <LoadingSpinner className="py-12" />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Galería de imágenes</h1>
          <p className="mt-1 text-sm text-gray-500">
            {gallery.length} imagen{gallery.length !== 1 ? 'es' : ''} en total
          </p>
        </div>
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, tipo, sección…"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:w-72"
          />
        </div>
      </div>

      {/* ── Grid ── */}
      {filteredGallery.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 py-16 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">
            {search ? 'No se encontraron imágenes' : 'La galería está vacía'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredGallery.map((media) => (
            <GalleryCard
              key={media.id}
              media={media}
              onDelete={deleteMedia}
              isDeleting={isDeleting}
              onAssign={() => setAssignTarget({ media })}
            />
          ))}
        </div>
      )}

      {/* ── Dialogs ── */}
      {deleteError && (
        <DeleteErrorDialog
          error={deleteError}
          onRemoveAssociation={removeAssociation}
          isRemoving={isRemovingAssociation}
          onClose={clearDeleteError}
        />
      )}

      {assignTarget && sectionsList && (
        <AssignDialog
          media={assignTarget.media}
          sections={sectionsList}
          onAssign={assignMedia}
          isAssigning={isAssigning}
          assignError={assignError}
          onClose={() => setAssignTarget(null)}
        />
      )}
    </div>
  )
}

// ── Gallery Card ──

function GalleryCard({
  media,
  onDelete,
  isDeleting,
  onAssign,
}: {
  media: GalleryMedia
  onDelete: (id: number) => void
  isDeleting: boolean
  onAssign: () => void
}) {
  const isImage = media.mimeType?.startsWith('image/')

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
      {/* Thumbnail */}
      <div className="aspect-square bg-gray-100">
        {isImage ? (
          <img
            src={media.url}
            alt={media.title ?? ''}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="truncate text-sm font-medium text-gray-900">
          {media.title ?? 'Sin título'}
        </p>
        <p className="mt-0.5 text-xs text-gray-500">
          {media.mimeType ?? 'Desconocido'}
        </p>

        {/* Associations */}
        {(media.associations?.length ?? 0) > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {media.associations.map((a) => (
              <span
                key={a.blockId}
                className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-700"
              >
                {getSectionDisplayName(a.sectionName)}
                {a.role && <span className="ml-1 text-teal-500">• {a.role}</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Hover actions */}
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={onAssign}
          className="rounded-lg bg-white/90 p-1.5 text-teal-600 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition-colors hover:bg-teal-50"
          title="Asignar a sección"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => { if (confirm('¿Eliminar esta imagen?')) onDelete(media.id) }}
          disabled={isDeleting}
          className="rounded-lg bg-white/90 p-1.5 text-red-500 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition-colors hover:bg-red-50 disabled:opacity-50"
          title="Eliminar imagen"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  )
}
