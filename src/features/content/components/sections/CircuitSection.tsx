import { useScrollProgress } from '@shared/hooks'
import { useNavigate } from 'react-router-dom'
import type { Section } from '../../models'
import { textByRole } from './sectionHelpers'
import { SERVICE_LINKS } from '@shared/config/serviceLinks'
import { colors, layout } from '../../../../theme'

/** Labels visibles de los hotspots del circuito — mismas rutas/labels que SERVICE_LINKS. */
const intervencionDirecta = SERVICE_LINKS.find((s) => s.href === '/servicios/intervencion-directa')!
const seleccionDePersonal = SERVICE_LINKS.find((s) => s.href === '/servicios/seleccion-de-personal')!
const acompanamiento = SERVICE_LINKS.find((s) => s.href === '/servicios/acompanamiento')!

interface Props { section: Section }

export default function CircuitSection({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')
  const subtitle = textByRole(section.texts, 'subtitle')
  const { ref, progress } = useScrollProgress<HTMLElement>()
  const navigate = useNavigate()

  const t = Math.min(1, Math.max(0, (progress - 0.15) / 0.28))
  const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2

  const handleNavigate = (route: string) => () => navigate({ pathname: route, hash: '' })
  return (
    <section
      ref={ref}
      className={`relative ${layout.sectionPadY}`}
      style={{ backgroundColor: colors.circuitBg }}
    >
      <div className={layout.container}>
        <div className="grid gap-[3vh] sm:gap-[4vh] lg:grid-cols-2 lg:items-start lg:gap-[4vh]">

          {/* Heading */}
          <div className="flex flex-col items-center gap-[2vh] text-center lg:items-start lg:text-left">
            <h2
              className="w-full max-w-lg text-center text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl md:text-4xl lg:mx-0 lg:text-left lg:text-5xl xl:text-6xl font-secondary"
              style={{
                color: colors.blueDark,
                opacity: Math.min(1, ease * 2),
                transform: `translateY(${(1 - Math.min(1, ease * 2)) * 40}px)`,
                transition: 'opacity 0.1s, transform 0.1s',
              }}
            >
              {heading?.body ?? 'Circuito integrado de accion.'}
            </h2>

            {subtitle && (
              <p
                className="w-full max-w-lg text-base leading-relaxed text-center sm:text-lg lg:text-justify"
                style={{
                  color: colors.blueMid,
                  opacity: Math.min(1, ease * 2),
                  transform: `translateY(${(1 - Math.min(1, ease * 2)) * 22}px)`,
                  transition: 'opacity 0.1s, transform 0.1s',
                }}
              >
                {subtitle.body}
              </p>
            )}
          </div>

          {/* Diagram + Hint */}
          <div className="flex flex-col items-center">
            <div
              className="relative mx-auto w-full aspect-[810/1012] max-w-[320px] overflow-hidden sm:max-w-[400px] md:max-w-[460px] lg:max-w-[520px] xl:max-w-[600px]"
              style={{
                opacity: 0.1 + ease * 0.9,
                transform: `scale(${0.88 + ease * 0.12})`,
                transition: 'opacity 0.1s, transform 0.1s',
                backgroundColor: colors.circuitBg,
              }}
            >
              <img
                src="/CPE%20%20POST.svg"
                alt="Circuito integrado de accion"
                className="block h-full w-full select-none object-contain mix-blend-multiply"
                loading="lazy"
                draggable={false}
              />

              {/* Intervención Directa (Cuadrado superior) */}
              <button
                type="button"
                aria-label={intervencionDirecta.label}
                onClick={handleNavigate(intervencionDirecta.href)}
                className="group absolute left-1/2 top-[20%] flex h-[25%] w-[55%] -translate-x-1/2 items-start justify-center bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <span
                  className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-opacity duration-300 group-hover:opacity-70 sm:text-xs"
                  style={{ color: colors.blueDark }}
                >
                  {intervencionDirecta.label}
                </span>
              </button>

              {/* Selección de Personal (Cuadrado inferior izquierdo) */}
              <button
                type="button"
                aria-label={seleccionDePersonal.label}
                onClick={handleNavigate(seleccionDePersonal.href)}
                className="group absolute left-[15%] top-[40%] flex h-[40%] w-[30%] items-end justify-center bg-transparent pb-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.14em] transition-opacity duration-300 group-hover:opacity-70 sm:text-xs"
                  style={{ color: colors.blueDark }}
                >
                  {seleccionDePersonal.label}
                </span>
              </button>

              {/* Acompañamiento a las personas (Cuadrado inferior derecho) */}
              <button
                type="button"
                aria-label={acompanamiento.label}
                onClick={handleNavigate(acompanamiento.href)}
                className="group absolute right-[5%] top-[50%] flex h-[30%] w-[50%] items-end justify-center bg-transparent pb-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.14em] transition-opacity duration-300 group-hover:opacity-70 sm:text-xs"
                  style={{ color: colors.blueDark }}
                >
                  {acompanamiento.label}
                </span>
              </button>
            </div>

            {/* Hint */}
            <div
              className="mt-2 text-center text-sm text-gray-500"
              style={{
                opacity: Math.max(0, (progress - 0.43) / 0.1),
                transition: 'opacity 0.1s',
              }}
            >
              Clickeá cada sección del circuito para conocer nuestros servicios.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}