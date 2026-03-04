import { SectionView } from '@features/content/views'
import { colors } from '../../../theme'

/**
 * Página de servicio: Intervención Directa
 */
export default function IntervencionDirectaPage() {
  return (
    <div className="min-h-screen pt-[10vh]" style={{ backgroundColor: colors.lightGray }}>
      <SectionView sectionName="service_intervencion" />
    </div>
  )
}
