import { useEffect } from 'react'
import { SectionView } from '@features/content/views'
import { colors } from '../../../theme'

/**
 * Página de servicio: Acompañamiento a las personas
 */
export default function AcompanamientoPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  return (
    <div className="min-h-screen pt-[15vh]" style={{ backgroundColor: colors.lightGray }}>
      <SectionView sectionName="service_acompanamiento" />
    </div>
  )
}
