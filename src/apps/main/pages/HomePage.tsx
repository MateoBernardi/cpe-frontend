import { useMultipleSectionsViewModel } from '@features/content/viewmodels'
import { SectionRenderer } from '@features/content/components'

/**
 * Secciones de la landing page principal (en orden).
 * News y ContactForm se muestran en rutas separadas (/news, /contact).
 */
const PUBLIC_SECTIONS = [
  'hero',
  'about',
  'teaser_circuit',
  'teaser_clinica',
  'teaser_traspaso',
  'info_primary',
  'info_secondary',
  'secondary_hero',
] as const

/**
 * Página principal — carga todas las secciones en paralelo y renderiza cuando todas están listas.
 * Evita mostrar LoadingSpinner en secciones individuales — solo hay loading inicial en MainLayout.
 */
export default function HomePage() {
  const { sections } = useMultipleSectionsViewModel(PUBLIC_SECTIONS)

  return (
    <div>
      {PUBLIC_SECTIONS.map((name) => {
        const section = sections.get(name)
        // Si la sección aún no está cargada, no renderizar nada (el MainLayout muestra el loading inicial)
        if (!section) return null
        return (
          <section key={name} id={name}>
            <SectionRenderer section={section} />
          </section>
        )
      })}
    </div>
  )
}
