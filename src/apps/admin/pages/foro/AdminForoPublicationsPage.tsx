import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  usePublications,
  usePublicationTypes,
  usePublicationMutations,
} from '@features/foro'
import { LoadingSpinner, ErrorMessage } from '@shared/components'

export default function AdminForoPublicationsPage() {
  const { data: publications, isLoading, error } = usePublications({ limit: 100 })
  const { data: types } = usePublicationTypes()
  const { remove } = usePublicationMutations()
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const typeNameById = useMemo(() => {
    const map = new Map<number, string>()
    for (const t of types ?? []) map.set(t.id, t.name)
    return map
  }, [types])

  const handleDelete = (id: number) => {
    remove.mutate(id, { onSuccess: () => setConfirmDeleteId(null) })
  }

  const fmtDate = (d: Date) =>
    d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Publicaciones del Foro</h1>
          <p className="mt-1 text-sm text-gray-500">
            Creá, editá y eliminá publicaciones, papers, podcasts y discusiones.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/foro/taxonomy"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Categorías y etiquetas
          </Link>
          <Link
            to="/foro/new"
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
          >
            Nueva publicación
          </Link>
        </div>
      </div>

      {isLoading && <LoadingSpinner className="py-12" />}
      {error && (
        <ErrorMessage
          message={error instanceof Error ? error.message : 'Error cargando publicaciones'}
        />
      )}

      {publications && publications.length === 0 && (
        <p className="py-12 text-center text-sm text-gray-400">
          Todavía no hay publicaciones. Creá la primera con "Nueva publicación".
        </p>
      )}

      {publications && publications.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Título</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Tipo</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Autor</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Fecha</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {publications.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="max-w-xs px-4 py-3 font-medium text-gray-900">
                    <span className="line-clamp-1">{p.title}</span>
                    {p.subtitle && (
                      <span className="block truncate text-xs font-normal text-gray-400">
                        {p.subtitle}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {p.typeId != null ? (typeNameById.get(p.typeId) ?? `#${p.typeId}`) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.createdBy}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                    {fmtDate(p.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {confirmDeleteId === p.id ? (
                      <span className="inline-flex gap-2">
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={remove.isPending}
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
                          to={`/foro/${p.id}/edit`}
                          className="rounded bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => setConfirmDeleteId(p.id)}
                          className="rounded bg-red-50 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                        >
                          Eliminar
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

      {remove.isError && (
        <ErrorMessage
          message={remove.error instanceof Error ? remove.error.message : 'Error al eliminar la publicación'}
        />
      )}
    </div>
  )
}
