import type { Section } from '../models'
import TextBlock from './TextBlock'
import MediaBlock from './MediaBlock'
// Deep-imported one file at a time — NOT `from './sections'` (the barrel).
// `sections/index.ts` also re-exports `ForoPreviewSection`/
// `ServicesAccessSection`, which pull in `@features/foro` (and therefore
// `better-auth`, via `foroAuthClient.ts`'s eager `createAuthClient(...)`
// call at module scope). Rollup cannot tree-shake that call away just
// because its binding ends up unused, so importing through the barrel drags
// the whole better-auth client into every consumer of this file — including
// the admin app (`AdminPreviewPage` -> `SectionRenderer`). Deep imports
// avoid ever parsing those two modules from this file. See Part 7 of
// rustling-wobbling-bentley.md.
import HeroSection from './sections/HeroSection'
import SecondaryHeroSection from './sections/SecondaryHeroSection'
import AboutSection from './sections/AboutSection'
import InfoSecondarySection from './sections/InfoSecondarySection'
import ContactFormSection from './sections/ContactFormSection'
import ServiceDetailSection from './sections/ServiceDetailSection'
import RecruitmentFormSection from './sections/RecruitmentFormSection'

interface SectionRendererProps {
  section: Section
}

/** Mapa de secciones con layout dedicado */
const SECTION_LAYOUTS: Record<string, React.ComponentType<{ section: Section }>> = {
  hero: HeroSection,
  secondary_hero: SecondaryHeroSection,
  about: AboutSection,
  info_secondary: InfoSecondarySection,
  contact_form: ContactFormSection,
  service_intervencion: ServiceDetailSection,
  service_seleccion: RecruitmentFormSection,
  service_acompanamiento: ServiceDetailSection,
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
