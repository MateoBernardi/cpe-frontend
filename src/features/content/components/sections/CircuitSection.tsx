import { useScrollProgress } from '@shared/hooks'
import { useNavigate } from 'react-router-dom'
import type { Section } from '../../models'
import { textByRole } from './sectionHelpers'
import { colors, layout } from '../../../../theme'

const SERVICE_ROUTES = [
  '/servicios/intervencion-directa',
  '/servicios/seleccion-de-personal',
  '/servicios/acompanamiento',
]

interface Props { section: Section }

export default function CircuitSection({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')
  const subtitle = textByRole(section.texts, 'subtitle')
  const { ref, progress } = useScrollProgress<HTMLElement>()
  const navigate = useNavigate()

  const t = Math.min(1, Math.max(0, (progress - 0.15) / 0.28))
  const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2

  const handleNavigate = (e: React.MouseEvent, route: string) => {
    e.preventDefault()
    navigate({ pathname: route, hash: '' })
  }

  return (
    <section
      ref={ref}
      className={`relative ${layout.sectionPadY}`}
      style={{ backgroundColor: colors.circuitBg }}
    >
      <div className={layout.container}>
        <div className="grid items-center gap-[3vh] sm:gap-[4vh] lg:grid-cols-2 lg:gap-[4vh]">

          {/* Heading */}
          <div className="flex flex-col items-center gap-[2vh] text-center lg:items-start lg:text-left">
            <h2
              className="w-full max-w-lg text-center text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl md:text-4xl lg:mx-0 lg:text-left lg:text-5xl xl:text-6xl font-primary"
              style={{
                color: colors.blueDark,
                opacity: Math.min(1, ease * 2),
                transform: `translateY(${(1 - Math.min(1, ease * 2)) * 40}px)`,
                transition: 'opacity 0.1s, transform 0.1s',
              }}
            >
              {heading?.body ?? 'Circuito integrado de acción.'}
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

          {/* Diagram */}
          <div
            className="relative mx-auto w-full aspect-square max-w-[280px] sm:max-w-[330px] md:max-w-[380px] lg:max-w-[420px]"
            style={{
              opacity: 0.1 + ease * 0.9,
              transform: `scale(${0.88 + ease * 0.12})`,
              transition: 'opacity 0.1s, transform 0.1s',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 800 800"
              className="block h-full w-full"
            >
              {/* ── Circles ── */}
              <circle
                cx="400" cy="290" r="185"
                fill="#088385"
                onClick={(e) => handleNavigate(e, SERVICE_ROUTES[0])}
                style={{ cursor: 'pointer' }}
                className="transition-[filter] duration-200 hover:brightness-110"
              />
              <circle
                cx="280" cy="480" r="185"
                fill="#104C5E"
                onClick={(e) => handleNavigate(e, SERVICE_ROUTES[1])}
                style={{ cursor: 'pointer' }}
                className="transition-[filter] duration-200 hover:brightness-110"
              />
              <circle
                cx="520" cy="480" r="185"
                fill="#15B4AE"
                onClick={(e) => handleNavigate(e, SERVICE_ROUTES[2])}
                style={{ cursor: 'pointer' }}
                className="transition-[filter] duration-200 hover:brightness-110"
              />

              {/* ── Center white circle ── */}
              <circle cx="400" cy="413" r="105" fill="#FFFFFF" />

              {/* ── Center label ── */}
              <text x="400" y="385" fontFamily="var(--font-primary, Arial, sans-serif)" fontWeight="bold" fontSize="26" fill="#088385" textAnchor="middle" style={{ pointerEvents: 'none' }}>EMPRESA</text>
              <text x="400" y="420" fontFamily="var(--font-primary, Arial, sans-serif)" fontWeight="bold" fontSize="26" fill="#088385" textAnchor="middle" style={{ pointerEvents: 'none' }}>+</text>
              <text x="400" y="455" fontFamily="var(--font-primary, Arial, sans-serif)" fontWeight="bold" fontSize="26" fill="#088385" textAnchor="middle" style={{ pointerEvents: 'none' }}>CPE</text>

              {/* ── Section labels ── */}
              <text x="400" y="195" fontFamily="var(--font-primary, Arial, sans-serif)" fontWeight="bold" fontSize="26" fill="#FFFFFF" textAnchor="middle" style={{ pointerEvents: 'none' }}>Intervención</text>
              <text x="400" y="225" fontFamily="var(--font-primary, Arial, sans-serif)" fontWeight="bold" fontSize="26" fill="#FFFFFF" textAnchor="middle" style={{ pointerEvents: 'none' }}>Directa</text>

              <text x="245" y="545" fontFamily="var(--font-primary, Arial, sans-serif)" fontWeight="bold" fontSize="26" fill="#FFFFFF" textAnchor="middle" style={{ pointerEvents: 'none' }}>Selección de</text>
              <text x="245" y="575" fontFamily="var(--font-primary, Arial, sans-serif)" fontWeight="bold" fontSize="26" fill="#FFFFFF" textAnchor="middle" style={{ pointerEvents: 'none' }}>Personal</text>

              <text x="555" y="545" fontFamily="var(--font-primary, Arial, sans-serif)" fontWeight="bold" fontSize="26" fill="#FFFFFF" textAnchor="middle" style={{ pointerEvents: 'none' }}>Acompañamiento</text>
              <text x="555" y="575" fontFamily="var(--font-primary, Arial, sans-serif)" fontWeight="bold" fontSize="26" fill="#FFFFFF" textAnchor="middle" style={{ pointerEvents: 'none' }}>a las personas</text>
            </svg>

            {/* Hint */}
            <p
              className="mt-1 text-center text-[11px] text-white/50"
              style={{ opacity: ease > 0.85 ? 1 : 0, transition: 'opacity 0.4s' }}
            >
              Clickeá para conocer cada servicio
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}