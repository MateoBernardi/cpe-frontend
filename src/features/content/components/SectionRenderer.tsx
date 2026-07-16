import type { Section } from '../models'
import TextBlock from './TextBlock'
import MediaBlock from './MediaBlock'
import {
  HeroSection,
  SecondaryHeroSection,
  InfoSecondarySection,
  ContactFormSection,
  ServiceDetailSection,
  RecruitmentFormSection,
  CircuitSection,
  GenerationalTransferTeaser,
  ClinicaEmpresariosTeaser,
} from './sections'

interface SectionRendererProps {
  section: Section
}

/** Mapa de secciones con layout dedicado */
const SECTION_LAYOUTS: Record<string, React.ComponentType<{ section: Section }>> = {
  hero: HeroSection,
  secondary_hero: SecondaryHeroSection,
  info_secondary: InfoSecondarySection,
  contact_form: ContactFormSection,
  service_intervencion: ServiceDetailSection,
  service_seleccion: RecruitmentFormSection,
  service_acompanamiento: ServiceDetailSection,
  traspaso_generacional: ServiceDetailSection,
  service_clinica_empresarios: ServiceDetailSection,
  teaser_circuit: CircuitSection,
  teaser_clinica: ClinicaEmpresariosTeaser,
  teaser_traspaso: GenerationalTransferTeaser,
}

/**
 * Renderiza una sección usando su layout dedicado si existe,
 * o un layout genérico como fallback.
 */
export default function SectionRenderer({ section }: SectionRendererProps) {
  const Layout = SECTION_LAYOUTS[section.name]

  if (Layout) return <Layout section={section} />

  // Fallback genérico
  return (
    <div className="space-y-6 py-12">
      <h2 className="text-2xl font-bold capitalize text-gray-900">{section.name}</h2>

      {section.media.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {section.media.map((m, i) => (
            <MediaBlock key={`${m.url}-${i}`} media={m} />
          ))}
        </div>
      )}

      {section.texts.length > 0 && (
        <div className="space-y-4">
          {section.texts.map((t, i) => (
            <TextBlock key={`${t.body.slice(0, 20)}-${i}`} text={t} />
          ))}
        </div>
      )}
    </div>
  )
}
