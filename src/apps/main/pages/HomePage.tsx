import { SectionView } from '@features/content/views'
import CircuitSection from '@features/content/components/sections/CircuitSection'
import GenerationalTransferTeaser from '@features/content/components/sections/GenerationalTransferTeaser'

/**
 * Secciones de la landing page principal (en orden).
 * News y ContactForm se muestran en rutas separadas (/news, /contact).
 */
const PUBLIC_SECTIONS = [
  'hero',
  'about',
  'info_primary',
  'info_secondary',
  'secondary_hero',
] as const

/**
 * Página principal — renderiza las secciones del landing en orden.
 * Cada sección se carga independientemente del API público.
 */
export default function HomePage() {
  return (
    <div>
      {/* hero */}
      <section id="hero">
        <SectionView sectionName="hero" />
      </section>

      {/* about */}
      <section id="about">
        <SectionView sectionName="about" />
      </section>

      {/* circuito — no editable */}
      <section id="action_circuit">
        <CircuitSection />
      </section>

      {/* traspaso generacional — teaser no editable */}
      <section id="traspaso_generacional">
        <GenerationalTransferTeaser />
      </section>

      {/* remaining sections */}
      {PUBLIC_SECTIONS.filter((n) => n !== 'hero' && n !== 'about').map((name) => (
        <section key={name} id={name}>
          <SectionView sectionName={name} />
        </section>
      ))}
    </div>
  )
}
