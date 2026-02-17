import { SectionView } from '@features/content/views'

/**
 * Página principal - renderiza las secciones en orden.
 */
export default function HomePage() {
  const sections = ['hero', 'about', 'footer']

  return (
    <div className="space-y-12">
      {sections.map((name) => (
        <section key={name} id={name}>
          <SectionView sectionName={name} />
        </section>
      ))}
    </div>
  )
}
