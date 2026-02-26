import { useState, useEffect, useCallback } from 'react'
import { useScrollProgress } from '@shared/hooks'
import { useNavigate } from 'react-router-dom'

/** Service slugs matching subsection routes */
const SERVICE_ROUTES = [
  '/servicios/intervencion-directa',
  '/servicios/seleccion-de-personal',
  '/servicios/acompanamiento',
]

const CIRCLE_LABELS = [
  'Intervención directa.',
  'Acompañamiento a las personas.',
  'Selección del personal.',
]

/** Circle colors matching brand palette */
const CIRCLE_COLORS = [
  { bg: 'bg-slate-400/70', ring: 'ring-slate-300', hover: 'hover:bg-slate-400/90' },
  { bg: 'bg-teal-600/70', ring: 'ring-teal-500', hover: 'hover:bg-teal-600/90' },
  { bg: 'bg-teal-300/70', ring: 'ring-teal-200', hover: 'hover:bg-teal-300/90' },
]

/** Responsive spread multiplier: returns a value [0-1] representing screen width bucket */
function useSpreadFactor() {
  const getBreakpoint = useCallback(() => {
    if (typeof window === 'undefined') return 1
    const w = window.innerWidth
    if (w < 480) return 0.4    // very small mobile
    if (w < 640) return 0.48   // mobile
    if (w < 768) return 0.92   // sm/md
    if (w < 1024) return 0.96  // md/lg
    return 1                   // lg+
  }, [])

  const [factor, setFactor] = useState(getBreakpoint)

  useEffect(() => {
    const onResize = () => setFactor(getBreakpoint())
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [getBreakpoint])

  return factor
}

/**
 * Sección "Circuito integrado de acción" — diagrama de Venn
 * con 3 círculos que se expanden desde el centro al hacer scroll.
 * Contenido hardcodeado (no editable desde admin).
 */
export default function CircuitSection() {
  const { ref, progress } = useScrollProgress<HTMLElement>()
  const navigate = useNavigate()
  const spreadFactor = useSpreadFactor()

  // Map scroll progress (0-1) → expansion factor (0-1) with easing
  // Starts expanding when section is well into viewport (~20%)
  const t = Math.min(1, Math.max(0, (progress - 0.15) / 0.28))
  const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2 // easeInOutQuad

  // Circle positions: relative to center, spread outward — fully responsive
  const spread = ease * 220 * spreadFactor
  const positions = [
    { x: -spread * 0.58, y: -spread * 0.36 },
    { x: spread * 0.58,  y: -spread * 0.36 },
    { x: 0,              y: spread * 0.58 },
  ]

  return (
    <section
      ref={ref}
      className="relative bg-gray-100 py-12 sm:py-20 md:py-28 min-h-[auto] lg:min-h-screen"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Heading */}
          <div className="text-center lg:text-left">
            <h2
              className="text-2xl font-extrabold leading-tight tracking-tight text-slate-800 sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl"
              style={{
                opacity: Math.min(1, ease * 2),
                transform: `translateY(${(1 - Math.min(1, ease * 2)) * 40}px)`,
                transition: 'opacity 0.1s, transform 0.1s',
              }}
            >
              Circuito integrado de acción.
            </h2>
          </div>

          {/* Venn diagram area — responsive height */}
          <div
            className="relative mx-auto flex w-full items-center justify-center"
            style={{ height: 'clamp(340px, 55vw, 620px)', maxWidth: 'min(100%, 550px)' }}
          >
            {/* Center label */}
            <div
              className="absolute z-20 rounded-md bg-white/90 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-600 shadow-sm ring-1 ring-slate-200 backdrop-blur sm:px-3 sm:py-1.5 sm:text-xs"
              style={{
                opacity: ease > 0.7 ? 1 : 0,
                transition: 'opacity 0.5s',
              }}
            >
              Empresa + C.P.E
            </div>

            {CIRCLE_LABELS.map((label, i) => (
              <button
                key={i}
                type="button"
                onClick={() => navigate(SERVICE_ROUTES[i])}
                className={`absolute flex items-center justify-center rounded-full ${CIRCLE_COLORS[i].bg} ${CIRCLE_COLORS[i].hover} ring-2 ${CIRCLE_COLORS[i].ring} cursor-pointer transition-colors duration-300`}
                style={{
                  width: 'clamp(120px, 22vw, 280px)',
                  height: 'clamp(120px, 22vw, 280px)',
                  zIndex: 10,
                  transform: `translate(${positions[i].x}px, ${positions[i].y}px) scale(${0.3 + ease * 0.7})`,
                  opacity: 0.15 + ease * 0.85,
                  transition: 'background-color 0.3s',
                }}
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
