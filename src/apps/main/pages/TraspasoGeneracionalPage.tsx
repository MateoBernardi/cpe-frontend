import { useEffect } from 'react'
import { SectionView } from '@features/content/views'
import { colors } from '../../../theme'

/**
 * Página de servicio: Traspaso Generacional
 */
export default function TraspasoGeneracionalPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  return (
    <div className="min-h-screen pt-[15vh]" style={{ backgroundColor: colors.lightGray }}>
      <SectionView sectionName="traspaso_generacional" />
    </div>
  )
}
