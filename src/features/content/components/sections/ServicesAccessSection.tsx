import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useMultipleSectionsViewModel } from '@features/content/viewmodels'
import { textByRole, textsByRole } from './sectionHelpers'
import { colors, layout } from '../../../../theme'

/** Relleno del badge circular — teal claro a baja opacidad, misma convención que `foroHairline` en theme.ts. */
const BADGE_BG = `${colors.tealBright}1f`

interface ServiceDefault {
  /** Nombre de sección CMS de donde se lee el copy en vivo. */
  section: string
  to: string
  fallbackTitle: string
  fallbackDescription: string
  icon: ReactNode
}

const TargetIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true" className="h-6 w-6">
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="0.75" fill="currentColor" stroke="none" />
    <path strokeLinecap="round" d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3" />
  </svg>
)

const PeopleIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true" className="h-6 w-6">
    <circle cx="8.5" cy="8" r="2.75" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.25 19c0-3 2.35-5.25 5.25-5.25S13.75 16 13.75 19" />
    <circle cx="17" cy="8.75" r="2.15" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.9 13.6c2.5.35 4.15 2.2 4.15 5.15" />
  </svg>
)

const SearchPersonIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true" className="h-6 w-6">
    <circle cx="10" cy="7.75" r="3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19c0-3.1 2.46-5.4 5.5-5.4.72 0 1.4.13 2 .38" />
    <circle cx="16.25" cy="16.25" r="3" />
    <path strokeLinecap="round" d="m18.55 18.55 2.2 2.2" />
  </svg>
)

/**
 * Los tres servicios y su copy por defecto (usado si el CMS no responde, o
 * campo por campo si a una sección le falta un rol). El array es también la
 * fuente del orden de renderizado.
 */
const SERVICE_DEFAULTS: readonly ServiceDefault[] = [
  {
    section: 'service_intervencion',
    to: '/servicios/intervencion-directa',
    fallbackTitle: 'Intervención Directa',
    fallbackDescription:
      'Ordenar el funcionamiento de la organización a partir del análisis de su estructura, relaciones y objetivos.',
    icon: TargetIcon,
  },
  {
    section: 'service_acompanamiento',
    to: '/servicios/acompanamiento',
    fallbackTitle: 'Acompañamiento a las personas',
    fallbackDescription: 'Sostener, acompañar y orientar a los actores clave dentro de la organización.',
    icon: PeopleIcon,
  },
  {
    section: 'service_seleccion',
    to: '/servicios/seleccion-de-personal',
    fallbackTitle: 'Selección de Personal',
    fallbackDescription:
      'Integrar a personas que respondan al perfil del puesto y a la cultura de la organización.',
    icon: SearchPersonIcon,
  },
] as const

const SECTION_NAMES = SERVICE_DEFAULTS.map((s) => s.section)

/**
 * Grilla de acceso directo a los tres servicios — se renderiza debajo de
 * "Quiénes somos" (sección `about`) en HomePage, no forma parte de
 * PUBLIC_SECTIONS. No bloquea la carga inicial: nunca muestra spinner y, si
 * una sección CMS falta o no trae un rol, cae al copy por defecto de
 * SERVICE_DEFAULTS campo a campo, así siempre se ven las tres cards.
 *
 * `service_seleccion` trae dos textos con rol `heading` (orders 0 y 9,
 * "Selección de personal" / "Selección de Personal"). Para no parpadear
 * entre ambos se toma siempre el de mayor `order` (el último tras ordenar
 * con `textsByRole`) — determinístico, y de paso es el que coincide con la
 * capitalización correcta usada en el fallback.
 */
export default function ServicesAccessSection() {
  const { sections } = useMultipleSectionsViewModel(SECTION_NAMES)

  const services = SERVICE_DEFAULTS.map((def) => {
    const section = sections.get(def.section)
    const headings = section ? textsByRole(section.texts, 'heading') : []
    const heading = headings[headings.length - 1]?.body
    const subtitle = section ? textByRole(section.texts, 'subtitle')?.body : undefined
    return {
      ...def,
      title: heading || def.fallbackTitle,
      description: subtitle || def.fallbackDescription,
    }
  })

  return (
    <section className={layout.sectionPadYCompact} style={{ backgroundColor: colors.lightGray }}>
      <div className={layout.container}>
        {/* Tres servicios en fila (desktop) o apilados (mobile) — sin paso
            intermedio de 2 columnas, que dejaría una tarjeta huérfana. */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {services.map((service) => (
            <Link
              key={service.section}
              to={service.to}
              className="group relative flex flex-col items-start gap-4 p-6 text-left transition-all duration-300 ease-out hover:-translate-y-1 hover:rounded-2xl hover:bg-white hover:shadow-xl focus-visible:-translate-y-1 focus-visible:rounded-2xl focus-visible:bg-white focus-visible:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 sm:p-8"
              style={{ color: colors.tealDeep }}
            >
              <span
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: BADGE_BG, color: colors.tealDeep }}
              >
                {service.icon}
              </span>
              <h3 className="font-primary text-lg font-bold sm:text-xl" style={{ color: colors.blueDark }}>
                {service.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: colors.blueMid }}>
                {service.description}
              </p>
              <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold">
                Conocé más
                <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
