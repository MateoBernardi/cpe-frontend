import { SectionView } from '@features/content/views'

const PUBLIC_SECTIONS = [
  'hero',
  'secondary_hero',
  'about',
  'news',
  'info_primary',
  'info_secondary',
  'contact_form',
] as const

/**
 * Página principal — renderiza todas las secciones del landing en orden.
 * Cada sección se carga independientemente del API público.
 */
export default function HomePage() {
  return (
    <div>
      {PUBLIC_SECTIONS.map((name) => (
        <section key={name} id={name}>
          <SectionView sectionName={name} />
        </section>
      ))}
    </div>
  )
}
