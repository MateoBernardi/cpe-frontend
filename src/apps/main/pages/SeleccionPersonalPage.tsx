import { useEffect } from 'react'
import { SectionView } from '@features/content/views'
import { colors } from '../../../theme'

/**
 * Página de servicio: Selección de Personal
 * El formulario de postulación vive dentro de RecruitmentFormSection (renderizado por SectionView).
 */
export default function SeleccionPersonalPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  return (
    <div className="min-h-screen pt-[15vh]" style={{ backgroundColor: colors.lightGray }}>
      <SectionView sectionName="service_seleccion" />
    </div>
  )
}
