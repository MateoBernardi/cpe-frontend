import { useMultipleSectionsViewModel } from '@features/content/viewmodels'
import { SectionRenderer } from '@features/content/components'
import { AboutHeroSection } from '@features/content/components/sections'
import ForoPreviewSection from '../components/ForoPreviewSection'

/**
 * Secciones de la landing page principal (en orden).
 * ContactForm se muestra en una ruta separada (/contact).
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
        // AboutHeroSection (fusionado con "about") — no renderiza nada por sí sola.
        if (name === 'info_primary') return null
        return (
          <section key={name} id={name}>
            {name === 'about'
              ? (sections.get('info_primary') && (
                  <AboutHeroSection about={section} infoPrimary={sections.get('info_primary')!} />
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
