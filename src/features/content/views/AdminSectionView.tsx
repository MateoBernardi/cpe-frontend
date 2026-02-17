import { SectionEditor } from '../components/admin'

interface AdminSectionViewProps {
  sectionId: number
}

/**
 * Vista de admin para editar una sección.
 */
export default function AdminSectionView({ sectionId }: AdminSectionViewProps) {
  return (
    <div>
      <SectionEditor sectionId={sectionId} />
    </div>
  )
}
