import { SectionView } from '@features/content/views'
import { colors } from '../../../theme'

/**
 * Página de Contacto — Formulario con estimador de presupuesto.
 */
export default function ContactPage() {
  return (
    <div className="min-h-screen pt-[10vh]" style={{ backgroundColor: colors.lightGray }}>
      <SectionView sectionName="contact_form" />
    </div>
  )
}
