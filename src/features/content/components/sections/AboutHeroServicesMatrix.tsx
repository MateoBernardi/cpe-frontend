import { useNavigate } from 'react-router-dom'
import { useInView } from '@shared/hooks'
import { SERVICE_LINKS } from '@shared/config/serviceLinks'
import { colors, layout } from '../../../../theme'

interface Props {
  /** Logos de los servicios (rol "icon" de info_primary), apareados por orden con SERVICE_LINKS. */
  iconUrls?: string[]
}

/**
 * Matriz de servicios que cierra el hero fusionado (AboutHeroSection).
 * Reutiliza los labels/rutas existentes de SERVICE_LINKS — sin copy nueva.
 * Los servicios son independientes (no una secuencia): 5 CTAs claros a ancho
 * completo de pantalla, columnas simétricas separadas por líneas verticales.
 * Cada celda entera es clickeable (logo + label + flecha, hover marcado).
 * La banda de cierre guía hacia la sección del circuito de acción — su label
 * fijo sigue el mock aprobado, mismo criterio que el eyebrow hardcodeado
 * "Metodología" de InfoSecondarySection.
 */
/**
 * Bordes divisores de cada celda según el layout responsivo de la grilla
 * (1 col → 2 cols en sm → 5 cols en lg): líneas verticales entre columnas y
 * horizontales entre filas, sin duplicar bordes en los inicios de fila.
 */
function cellBorders(i: number): string {
  const cls: string[] = []
  if (i > 0) cls.push('border-t')            // 1 col: divisor entre todas
  if (i === 1) cls.push('sm:border-t-0')     // 2 cols: la 2ª pasa a la fila 1
  if (i % 2 === 1) cls.push('sm:border-l')   // 2 cols: divisor vertical col 2
  if (i >= 2) cls.push('lg:border-t-0')      // 5 cols: una sola fila
  if (i > 0 && i % 2 === 0) cls.push('lg:border-l') // 5 cols: verticales restantes
  return cls.join(' ')
}

export default function AboutHeroServicesMatrix({ iconUrls = [] }: Props) {
  const navigate = useNavigate()
  const { ref, isInView } = useInView<HTMLDivElement>({ threshold: 0.15 })

  return (
    <div ref={ref} className="border-t" style={{ borderColor: `${colors.blueDark}1f` }}>
      {/* Matriz a ancho completo de pantalla — sin container: 5 columnas iguales
          (1 → 2 → 5 según viewport) separadas por líneas verticales/horizontales */}
      <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {SERVICE_LINKS.map((service, i) => {
          const icon = iconUrls[i]
          return (
            <button
              key={service.href}
              type="button"
              onClick={() => navigate(service.href)}
              className={`group flex flex-col items-center justify-center gap-4 px-6 py-[5vh] text-center transition-all duration-700 lg:gap-[1.4vh] lg:py-[2.5vh] ${
                isInView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              } ${cellBorders(i)}`}
              style={{
                borderColor: `${colors.blueDark}1f`,
                transitionDelay: `${i * 80}ms`,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${colors.tealMid}0d` }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              {icon && (
                <img
                  src={icon}
                  alt=""
                  loading="lazy"
                  className="h-12 w-12 object-contain transition-transform duration-300 group-hover:scale-110 lg:h-[min(3rem,6vh)] lg:w-[min(3rem,6vh)]"
                />
              )}
              <span
                className="font-secondary text-base font-semibold leading-snug underline-offset-4 group-hover:underline sm:text-lg lg:text-[min(1.125rem,2.3vh)]"
                style={{ color: colors.blueDark }}
              >
                {service.label}
              </span>
              <span
                aria-hidden
                className="font-mono text-sm transition-transform duration-300 group-hover:translate-x-1.5"
                style={{ color: colors.tealMid }}
              >
                →
              </span>
            </button>
          )
        })}
      </div>

      {/* Banda de cierre — guía hacia la sección de Metodología (que embebe el
          circuito de acción). Label fijo, no viene de la API. */}
      <div className="border-t" style={{ borderColor: `${colors.blueDark}1f` }}>
        <div className={`${layout.container} py-[5vh] text-center lg:py-[2.5vh]`}>
          <button
            type="button"
            onClick={() => navigate({ pathname: '/', hash: '#info_secondary' })}
            className="group inline-flex flex-col items-center gap-4 lg:gap-[1.2vh]"
          >
            <span
              aria-hidden
              className="flex h-11 w-11 items-center justify-center rounded-full border transition-transform duration-300 group-hover:translate-y-1 lg:h-[min(2.5rem,5vh)] lg:w-[min(2.5rem,5vh)]"
              style={{ borderColor: `${colors.tealMid}8c`, color: colors.tealMid }}
            >
              ↓
            </span>
            <span className="font-secondary text-2xl font-medium tracking-tight sm:text-3xl lg:text-[min(1.5rem,3.2vh)]" style={{ color: colors.blueDark }}>
              Conocé como trabajamos
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
