import { SectionView } from '@features/content/views'
import { colors } from '../../../theme'

/**
 * Página de servicio: Selección de Personal (con formulario de CV)
 */
export default function SeleccionPersonalPage() {
  return (
    <div className="min-h-screen pt-[10vh]" style={{ backgroundColor: colors.lightGray }}>
      <SectionView sectionName="service_seleccion" />
    </div>
  )
}
