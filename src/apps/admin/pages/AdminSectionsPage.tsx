import { Link } from 'react-router-dom'

const sections = ['hero', 'about', 'services', 'testimonials', 'contact', 'footer']

export default function AdminSectionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Secciones</h1>
      <p className="text-gray-600">
        Listado de secciones de contenido disponibles para editar.
      </p>

      <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
        {sections.map((name) => (
          <Link
            key={name}
            to={`/sections/${name}`}
            className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50"
          >
            <span className="font-medium capitalize text-gray-900">{name}</span>
            <span className="text-sm text-gray-400">Editar →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
