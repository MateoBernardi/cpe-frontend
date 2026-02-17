import { SectionEditor } from '../components/admin'

interface AdminSectionViewProps {
  sectionName: string
  tenantId?: number
}

/**
 * Vista de admin para editar una sección con previsualización.
 */
export default function AdminSectionView({ sectionName, tenantId }: AdminSectionViewProps) {
  return (
    <div>
      <SectionEditor sectionName={sectionName} tenantId={tenantId} />
    </div>
  )
}
