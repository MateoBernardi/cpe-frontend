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

/**
 * Sección "Circuito integrado de acción" — diagrama de Venn
 * con 3 círculos que se expanden desde el centro al hacer scroll.
 * Contenido hardcodeado (no editable desde admin).
 */
export default function CircuitSection() {
  const { ref, progress } = useScrollProgress<HTMLElement>()
  const navigate = useNavigate()

  // Map scroll progress (0-1) → expansion factor (0-1) with easing
  // Starts expanding when section is well into viewport (~20%)
  const t = Math.min(1, Math.max(0, (progress - 0.15) / 0.28))
  const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2 // easeInOutQuad

  // Circle positions: relative to center, spread outward — responsive
  const spread = ease * 190
  const positions = [
    { x: -spread * 0.55, y: -spread * 0.38 },
    { x: spread * 0.55,  y: -spread * 0.38 },
    { x: 0,              y: spread * 0.55 },
  ]

  // Smaller spread for mobile
  const spreadSm = ease * 100
  const positionsSm = [
    { x: -spreadSm * 0.55, y: -spreadSm * 0.38 },
    { x: spreadSm * 0.55,  y: -spreadSm * 0.38 },
    { x: 0,                y: spreadSm * 0.55 },
  ]

  return (
    <section
      ref={ref}
      className="relative bg-gray-100 py-16 sm:py-28"
      style={{ minHeight: '100vh' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Heading */}
          <div className="text-center lg:text-left">
            <h2
              className="text-3xl font-extrabold leading-tight tracking-tight text-slate-800 sm:text-4xl lg:text-5xl xl:text-6xl"
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
          <div className="relative mx-auto flex w-full max-w-md items-center justify-center sm:max-w-lg lg:max-w-none" style={{ height: 'clamp(380px, 55vw, 620px)' }}>
            {/* Center label */}
            <div
              className="absolute z-20 rounded-md bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 shadow-sm ring-1 ring-slate-200 backdrop-blur sm:px-3 sm:py-1.5 sm:text-xs"
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
                  width: 'clamp(150px, 22vw, 280px)',
                  height: 'clamp(150px, 22vw, 280px)',
                  transform: `translate(${
                    typeof window !== 'undefined' && window.innerWidth < 640
                      ? positionsSm[i].x
                      : positions[i].x
                  }px, ${
                    typeof window !== 'undefined' && window.innerWidth < 640
                      ? positionsSm[i].y
                      : positions[i].y
                  }px) scale(${0.3 + ease * 0.7})`,
                  opacity: 0.15 + ease * 0.85,
                  transition: 'background-color 0.3s',
                }}
                aria-label={label}
              >
                <span className="px-3 text-center text-[11px] font-semibold leading-snug text-white drop-shadow-sm sm:px-4 sm:text-sm lg:text-base">
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
