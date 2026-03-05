import { SectionView } from '@features/content/views'
import { colors } from '../../../theme'

/**
 * Página de servicio: Clínica para Empresarios
 */
export default function ClinicaEmpresariosPage() {
  return (
    <div className="min-h-screen pt-[10vh]" style={{ backgroundColor: colors.lightGray }}>
      <SectionView sectionName="service_clinica_empresarios" />
    </div>
  )
}
