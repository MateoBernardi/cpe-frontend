import { SectionView } from '@features/content/views'
import { colors } from '../../../theme'

/**
 * Página de servicio: Selección de Personal
 * El formulario de postulación vive dentro de RecruitmentFormSection (renderizado por SectionView).
 */
export default function SeleccionPersonalPage() {
  return (
    <div className="min-h-screen pt-[10vh]" style={{ backgroundColor: colors.lightGray }}>
      <SectionView sectionName="service_seleccion" />
    </div>
  )
}
