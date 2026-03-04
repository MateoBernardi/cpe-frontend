import { SectionView } from '@features/content/views'
import { colors } from '../../../theme'

/**
 * Página de servicio: Traspaso Generacional
 */
export default function TraspasoGeneracionalPage() {
  return (
    <div className="min-h-screen pt-[10vh]" style={{ backgroundColor: colors.lightGray }}>
      <SectionView sectionName="traspaso_generacional" />
    </div>
  )
}
