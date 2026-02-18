import { SectionView } from '@features/content/views'

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
      {PUBLIC_SECTIONS.map((name) => (
        <section key={name} id={name}>
          <SectionView sectionName={name} />
        </section>
      ))}
    </div>
  )
}
