import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  useCandidatesList,
  useDeleteCandidate,
  useInterestsList,
  useCreateInterest,
  usePatchInterest,
} from '@features/contact/viewmodels'
import { LoadingSpinner, ErrorMessage } from '@shared/components'

export default function AdminCandidatesPage() {
  // ── Candidatos ──
  const { data: candidates, isLoading, error } = useCandidatesList()
  const deleteMutation = useDeleteCandidate()
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  // ── Puestos ──
  const {
    data: interests,
    isLoading: isLoadingInterests,
    error: interestsError,
  } = useInterestsList()
  const createInterest = useCreateInterest()
  const patchInterest = usePatchInterest()
  const [newInterestName, setNewInterestName] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')

  const handleDeleteCandidate = (id: number) => {
    deleteMutation.mutate(id, { onSuccess: () => setConfirmDeleteId(null) })
  }

  const handleCreateInterest = () => {
    const name = newInterestName.trim()
    if (!name) return
    createInterest.mutate({ name }, { onSuccess: () => setNewInterestName('') })
  }

  const handleToggleActive = (id: number, currentActive: boolean) => {
    patchInterest.mutate({ id, data: { active: !currentActive } })
  }

  const handleSaveInterestName = (id: number) => {
    const name = editingName.trim()
    if (!name) return
    patchInterest.mutate({ id, data: { name } }, { onSuccess: () => setEditingId(null) })
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <div className="space-y-10">
      {/* ═══════════════════ Puestos de interés ═══════════════════ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Puestos de interés</h2>
          <p className="mt-1 text-sm text-gray-500">
            Gestioná los puestos disponibles para postulación.
          </p>
        </div>

        {/* Crear puesto */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newInterestName}
            onChange={(e) => setNewInterestName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateInterest()}
            placeholder="Nombre del puesto nuevo…"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500"
          />
          <button
            onClick={handleCreateInterest}
            disabled={createInterest.isPending || !newInterestName.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {createInterest.isPending ? 'Creando…' : 'Crear puesto'}
          </button>
        </div>

        {isLoadingInterests && <LoadingSpinner size="sm" className="py-4" />}
        {interestsError && (
          <ErrorMessage
            message={
              interestsError instanceof Error ? interestsError.message : 'Error cargando puestos'
            }
          />
        )}

        {interests && interests.length > 0 && (
          <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white shadow-sm">
            {interests.map((i) => (
              <div
                key={i.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {editingId === i.id ? (
                    <input
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveInterestName(i.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      className="flex-1 rounded border border-gray-300 px-3 py-1 text-sm outline-none focus:border-blue-500"
                    />
                  ) : (
                    <span
                      className="cursor-pointer truncate text-sm font-medium text-gray-900 hover:text-blue-600"
                      onClick={() => {
                        setEditingId(i.id)
                        setEditingName(i.name)
                      }}
                      title="Click para editar nombre"
                    >
                      {i.name}
                    </span>
                  )}

                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      i.active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {i.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <div className="flex shrink-0 gap-2">
                  {editingId === i.id && (
                    <>
                      <button
                        onClick={() => handleSaveInterestName(i.id)}
                        disabled={patchInterest.isPending}
                        className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300"
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleToggleActive(i.id, i.active)}
                    disabled={patchInterest.isPending}
                    className={`rounded px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                      i.active
                        ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    {i.active ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════ Candidatos ═══════════════════ */}
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Postulaciones</h1>
          <p className="mt-1 text-sm text-gray-500">
            Candidatos que enviaron su postulación.
          </p>
        </div>

        {isLoading && <LoadingSpinner className="py-12" />}
        {error && (
          <ErrorMessage
            message={error instanceof Error ? error.message : 'Error cargando candidatos'}
          />
        )}

        {candidates && candidates.length === 0 && (
          <p className="py-12 text-center text-sm text-gray-400">
            No hay postulaciones aún.
          </p>
        )}

        {candidates && candidates.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Nombre</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Puesto</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Fecha</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {candidates.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                      <Link
                        to={`/candidates/${c.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {c.name} {c.surname}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <a href={`mailto:${c.email}`} className="hover:underline">
                        {c.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.interest?.name ?? '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                      {fmtDate(c.created_at)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {confirmDeleteId === c.id ? (
                        <span className="inline-flex gap-2">
                          <button
                            onClick={() => handleDeleteCandidate(c.id)}
                            disabled={deleteMutation.isPending}
                            className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300"
                          >
                            Cancelar
                          </button>
                        </span>
                      ) : (
                        <span className="inline-flex gap-2">
                          <Link
                            to={`/candidates/${c.id}`}
                            className="rounded bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100"
                          >
                            Ver detalle
                          </Link>
                          <button
                            onClick={() => setConfirmDeleteId(c.id)}
                            className="rounded bg-red-50 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                          >
                            Descartar
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
