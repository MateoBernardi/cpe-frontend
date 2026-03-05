import { useState, useEffect, useCallback } from 'react'
import { useScrollProgress } from '@shared/hooks'
import { useNavigate } from 'react-router-dom'
import type { Section } from '../../models'
import { textByRole } from './sectionHelpers'
import { colors, layout } from '../../../../theme'

/** Service slugs matching subsection routes */
const SERVICE_ROUTES = [
  '/servicios/intervencion-directa',
  '/servicios/seleccion-de-personal',
  '/servicios/acompanamiento',
]

const CIRCLE_LABELS = [
  'Intervención directa.',
  'Selección del personal.',
  'Acompañamiento a las personas.',
]

/** Circle colors from theme palette */
const CIRCLE_COLORS = colors.circuitCircles

/** Responsive spread multiplier */
function useSpreadFactor() {
  const getBreakpoint = useCallback(() => {
    if (typeof window === 'undefined') return 1
    const w = window.innerWidth
    if (w < 480) return 0.46
    if (w < 640) return 0.52
    if (w < 768) return 0.92
    if (w < 1024) return 0.96
    return 1
  }, [])

  const [factor, setFactor] = useState(getBreakpoint)

  useEffect(() => {
    const onResize = () => setFactor(getBreakpoint())
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [getBreakpoint])

  return factor
}

interface Props { section: Section }

export default function CircuitSection({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')

  const { ref, progress } = useScrollProgress<HTMLElement>()
  const navigate = useNavigate()
  const spreadFactor = useSpreadFactor()

  const t = Math.min(1, Math.max(0, (progress - 0.15) / 0.28))
  const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2

  const spread = ease * 205 * spreadFactor
  const positions = [
    { x: -spread * 0.56, y: -spread * 0.35 },
    { x: spread * 0.56,  y: -spread * 0.35 },
    { x: 0,              y: spread * 0.41 },
  ]

  return (
    <section
      ref={ref}
      className={`relative ${layout.sectionPadY} min-h-[auto]`}
      style={{ backgroundColor: colors.circuitBg }}
    >
      <div className={layout.container}>
        <div className="grid items-center gap-[3vh] sm:gap-[4vh] lg:grid-cols-2 lg:gap-[5vh]">
          {/* Heading */}
          <div className="text-center lg:text-left">
            <h2
              className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-primary"
              style={{
                color: colors.blueDark,
                opacity: Math.min(1, ease * 2),
                transform: `translateY(${(1 - Math.min(1, ease * 2)) * 40}px)`,
                transition: 'opacity 0.1s, transform 0.1s',
              }}
            >
              {heading?.body ?? 'Circuito integrado de acción.'}
            </h2>
          </div>

          {/* Venn diagram area */}
          <div
            className="relative mx-auto flex w-full items-center justify-center"
            style={{ height: 'clamp(340px, 55vw, 620px)', maxWidth: 'min(100%, 550px)' }}
          >
            {/* Center label – placed at the centroid of the three circles */}
            <div
              className="absolute z-20 px-2 py-1 text-center text-[9px] font-bold uppercase tracking-wider text-white drop-shadow-md sm:text-xs"
              style={{
                opacity: ease > 0.7 ? 1 : 0,
                transform: `translate(${(positions[0].x + positions[1].x + positions[2].x) / 3}px, ${(positions[0].y + positions[1].y + positions[2].y) / 3 - spread * 0.06}px)`,
                transition: 'opacity 0.5s',
              }}
            >
              Empresa<br />+ CPE
            </div>

            {CIRCLE_LABELS.map((label, i) => (
              <button
                key={i}
                type="button"
                onClick={() => navigate(SERVICE_ROUTES[i])}
                className="absolute flex items-center justify-center rounded-full cursor-pointer transition-colors duration-300 ring-2"
                style={{
                  backgroundColor: CIRCLE_COLORS[i].bg + 'b3',
                  width: 'clamp(120px, 22vw, 280px)',
                  height: 'clamp(120px, 22vw, 280px)',
                  zIndex: 10,
                  transform: `translate(${positions[i].x}px, ${positions[i].y}px) scale(${0.3 + ease * 0.7})`,
                  opacity: 0.15 + ease * 0.85,
                  transition: 'background-color 0.3s',
                  boxShadow: `0 0 0 2px ${CIRCLE_COLORS[i].ring}`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = CIRCLE_COLORS[i].hover + 'e6' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = CIRCLE_COLORS[i].bg + 'b3' }}
                aria-label={label}
              >
                <span className="px-2 text-center text-[10px] font-semibold leading-snug text-white drop-shadow-md sm:px-4 sm:text-sm lg:text-base">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
