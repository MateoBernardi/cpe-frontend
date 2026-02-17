import { useParams, Link } from 'react-router-dom'
import { AdminSectionView } from '@features/content/views'

export default function AdminSectionEditPage() {
  const { sectionName } = useParams<{ sectionName: string }>()

  if (!sectionName) {
    return (
      <div className="text-center">
        <p className="text-gray-500">Sección no especificada.</p>
        <Link to="/sections" className="text-sm text-blue-600 hover:underline">
          Volver a secciones
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Link to="/sections" className="text-sm text-blue-600 hover:underline">
        ← Volver a secciones
      </Link>
      <AdminSectionView sectionName={sectionName} />
    </div>
  )
}
