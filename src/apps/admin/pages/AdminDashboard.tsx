import { Link } from 'react-router-dom'
import { useSectionsList } from '@features/content/viewmodels'
import { LoadingSpinner, ErrorMessage } from '@shared/components'

export default function AdminDashboard() {
  const { data: sections, isLoading, error } = useSectionsList()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-gray-600">
        Bienvenido al panel de administración de contenido. Seleccioná una sección para gestionar.
      </p>

      {isLoading && <LoadingSpinner className="py-12" />}
      {error && <ErrorMessage message={error instanceof Error ? error.message : 'Error cargando secciones'} />}

      {sections && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((s) => (
            <Link
              key={s.id}
              to={`/sections/${s.id}`}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <h3 className="text-lg font-semibold capitalize text-gray-900">{s.name}</h3>
              <p className="mt-1 text-sm text-gray-500">Editar sección</p>
            </Link>
          ))}
        </div>
      )}

      <Link
        to="/sections"
        className="inline-block text-sm font-medium text-blue-600 hover:underline"
      >
        Ver todas las secciones →
      </Link>
    </div>
  )
}
