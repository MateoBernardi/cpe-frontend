import { Link } from 'react-router-dom'
import { useSectionsList } from '@features/content/viewmodels'
import { getSectionDisplayName } from '@features/content/config/sectionRoles'
import { LoadingSpinner, ErrorMessage } from '@shared/components'

export default function AdminSectionsPage() {
  const { data: sections, isLoading, error } = useSectionsList()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Secciones</h1>
      <p className="text-gray-600">
        Listado de secciones de contenido disponibles para editar.
      </p>

      {isLoading && <LoadingSpinner className="py-12" />}
      {error && <ErrorMessage message={error instanceof Error ? error.message : 'Error cargando secciones'} />}

      {sections && (
        <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {sections.map((s) => (
            <Link
              key={s.id}
              to={`/sections/${s.id}`}
              className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50"
            >
              <span className="font-medium text-gray-900">{getSectionDisplayName(s.name)}</span>
              <span className="text-sm text-gray-400">Editar →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
