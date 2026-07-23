import { useMultipleSectionsViewModel } from '@features/content/viewmodels'
import { SectionRenderer } from '@features/content/components'
import { AboutHeroSection } from '@features/content/components/sections'
import ForoPreviewSection from '../../../features/content/components/sections/ForoPreviewSection'

/**
 * Secciones de la landing page principal (en orden).
 * ContactForm se muestra en una ruta separada (/contact).
 * Los teasers de servicios viejos (teaser_clinica, teaser_traspaso) y la
 * sección propia del circuito (teaser_circuit) quedan ocultos: los 5 servicios
 * viven en la matriz del hero fusionado y el circuito ahora está embebido en
 * la sección de Metodología (info_secondary).
 */
const PUBLIC_SECTIONS = [
  'hero',
  'about',
  'info_primary',
  'info_secondary',
  'secondary_hero',
] as const

/**
 * Página principal — carga todas las secciones en paralelo y renderiza cuando todas están listas.
 * Evita mostrar LoadingSpinner en secciones individuales — solo hay loading inicial en MainLayout.
 */
export default function HomePage() {
  const { sections, isRetrying, error, canManualRetry, refetch } = useMultipleSectionsViewModel(PUBLIC_SECTIONS)

  return (
    <div>
      {isRetrying && (
        <div className="mx-auto mt-4 w-full max-w-4xl rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Reintentando carga de secciones por demasiadas solicitudes...
        </div>
      )}

      {error && (
        <div className="mx-auto mt-4 w-full max-w-4xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p>No se pudieron cargar algunas secciones públicas.</p>
          {canManualRetry && (
            <button
              type="button"
              onClick={refetch}
              className="mt-2 rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200"
            >
              Reintentar
            </button>
          )}
        </div>
      )}

      {PUBLIC_SECTIONS.map((name) => {
        const section = sections.get(name)
        // Si la sección aún no está cargada, no renderizar nada (el MainLayout muestra el loading inicial)
        if (!section) return null
        // "info_primary" ya no tiene layout propio: sus datos se consumen desde
        // AboutHeroSection (fusionado con "hero"/"about") — no renderiza nada por sí sola.
        if (name === 'info_primary') return null
        // "hero" ya no se renderiza como HeroSection propio: su copy (headline,
        // subheading, CTAs, trust) se consume desde AboutHeroSection, que pasa a
        // ser el hero above-the-fold de la home.
        if (name === 'hero') return null
        return (
          // El bloque "about" es el hero fusionado: lleva id="hero" (nav Inicio/logo)
          // y expone id="about" anidado dentro de AboutHeroSection (nav Nosotros).
          <section key={name} id={name === 'about' ? 'hero' : name}>
            {name === 'about'
              ? (sections.get('hero') && sections.get('info_primary') && (
                  <AboutHeroSection
                    hero={sections.get('hero')!}
                    about={section}
                    infoPrimary={sections.get('info_primary')!}
                  />
                ))
              : <SectionRenderer section={section} />}
            {/* Preview del Foro — se muestra entre "info_secondary" y el cierre ("secondary_hero") */}
            {name === 'info_secondary' && (
              <div id="foro">
                <ForoPreviewSection />
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
