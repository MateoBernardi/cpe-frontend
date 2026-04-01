import { useState } from 'react'
import { useContactsList, useDeleteContact } from '@features/contact/viewmodels'
import { LoadingSpinner, ErrorMessage } from '@shared/components'

export default function AdminContactsPage() {
  const { data: contacts, isLoading, error } = useContactsList()
  const deleteMutation = useDeleteContact()
  const [confirmId, setConfirmId] = useState<number | null>(null)

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => setConfirmId(null),
    })
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contactos</h1>
        <p className="mt-1 text-sm text-gray-500">
          Leads recibidos desde el formulario de contacto.
        </p>
      </div>

      {isLoading && <LoadingSpinner className="py-12" />}
      {error && (
        <ErrorMessage
          message={error instanceof Error ? error.message : 'Error cargando contactos'}
        />
      )}

      {contacts && contacts.length === 0 && (
        <p className="py-12 text-center text-sm text-gray-400">No hay contactos aún.</p>
      )}

      {contacts && contacts.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Nombre</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Localidad</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Dirección</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Personas</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Teléfono</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Mensaje</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Fecha</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contacts.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                    {c.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <a href={`mailto:${c.email}`} className="text-blue-600 hover:underline">
                      {c.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.town}</td>
                  <td className="px-4 py-3 text-gray-600">{c.address ?? '—'}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{c.number_of_people}</td>
                  <td className="px-4 py-3 text-gray-600">{c.phone_number ?? '—'}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-gray-600" title={c.message ?? ''}>
                    {c.message ?? '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-500">{fmtDate(c.created_at)}</td>
                  <td className="px-4 py-3 text-center">
                    {confirmId === c.id ? (
                      <span className="inline-flex gap-2">
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={deleteMutation.isPending}
                          className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="rounded bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300"
                        >
                          Cancelar
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirmId(c.id)}
                        className="rounded bg-red-50 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                      >
                        Descartar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
