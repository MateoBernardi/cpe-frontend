import { SectionView } from '@features/content/views'
import { colors } from '../../../theme'

/**
 * Página de servicio: Acompañamiento de las Personas
 */
export default function AcompanamientoPage() {
  return (
    <div className="min-h-screen pt-[10vh]" style={{ backgroundColor: colors.lightGray }}>
      <SectionView sectionName="service_acompanamiento" />
    </div>
  )
}
