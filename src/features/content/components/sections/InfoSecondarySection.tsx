import { useState } from 'react'
import type { Section } from '../../models'
import { textByRole, textsByRole } from './sectionHelpers'
import { useScrollProgress, useInView } from '@shared/hooks'

interface Props { section: Section }

// ── Constantes del donut SVG ──
const RADIUS = 80
const CIRCUMFERENCE = 2 * Math.PI * RADIUS // ~502.65
const NUM_SEGMENTS = 5
const GAP = 8
const SEG_LENGTH = (CIRCUMFERENCE - NUM_SEGMENTS * GAP) / NUM_SEGMENTS
const CENTER = 125
const STROKE_W = 28

const COLORS = ['#0d9488', '#0891b2', '#059669', '#6366f1', '#8b5cf6']

/** Progreso individual por segmento (dibujo secuencial) */
function segmentProgress(index: number, total: number): number {
  const start = index / NUM_SEGMENTS
  const end = (index + 1) / NUM_SEGMENTS
  return Math.max(0, Math.min(1, (total - start) / (end - start)))
}

/** Ángulo central de cada porción para posicionar labels */
function labelPosition(index: number) {
  const angle = (-90 + index * (360 / NUM_SEGMENTS) + 360 / NUM_SEGMENTS / 2) * (Math.PI / 180)
  return {
    x: CENTER + (RADIUS + STROKE_W + 20) * Math.cos(angle),
    y: CENTER + (RADIUS + STROKE_W + 20) * Math.sin(angle),
  }
}

/**
 * Sección informativa secundaria — Gráfico dona con scroll + collapsibles.
 * Usa textos de la sección: heading + hasta 5 paragraph/quote items.
 * Cada item: title en la dona, body en el collapsible.
 * Cada porción enlaza a una sub-sección placeholder abajo.
 */
export default function InfoSecondarySection({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')

  // Tomamos todos los textos que no sean heading como items del donut
  const items = [
    ...textsByRole(section.texts, 'paragraph'),
    ...textsByRole(section.texts, 'quote'),
  ]
    .sort((a, b) => a.order - b.order)
    .slice(0, NUM_SEGMENTS)

  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const { ref: scrollRef, progress } = useScrollProgress<HTMLDivElement>()
  const { ref: viewRef, isInView } = useInView<HTMLElement>({ threshold: 0.1 })

  // Progreso escalado: empezar el dibujo cuando hay ≈30% de visibilidad
  const drawProgress = Math.max(0, Math.min(1, (progress - 0.2) / 0.5))

  return (
    <>
      <section
        ref={(el) => {
          // Asignar ambos refs
          (viewRef as React.MutableRefObject<HTMLElement | null>).current = el;
          (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = el as HTMLDivElement | null
        }}
        className="bg-slate-950 py-24 text-white"
      >
        <div className="mx-auto max-w-7xl px-6">
          {heading && (
            <h2
              className={`mb-16 text-center text-3xl font-bold tracking-tight sm:text-4xl transition-all duration-700 ${
                isInView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
            >
              {heading.body}
            </h2>
          )}

          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            {/* ── Collapsibles (izquierda) ── */}
            <div
              className={`space-y-3 transition-all duration-700 delay-200 ${
                isInView ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
              }`}
            >
              {items.map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-3 w-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span className="font-semibold text-white">
                        {item.title ?? `Servicio ${i + 1}`}
                      </span>
                    </div>
                    <svg
                      className={`h-5 w-5 text-white/50 transition-transform duration-300 ${
                        openIndex === i ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className={`accordion-body ${openIndex === i ? 'open' : ''}`}>
                    <div className="px-5 pb-4 pt-0">
                      <p className="text-sm leading-relaxed text-slate-300">{item.body}</p>
                      <a
                        href={`#subsection-${i}`}
                        className="mt-3 inline-block text-xs font-medium text-teal-400 transition-colors hover:text-teal-300"
                      >
                        Ver más →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Donut chart (derecha) ── */}
            <div
              className={`flex justify-center transition-all duration-700 delay-300 ${
                isInView ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
              }`}
            >
              <svg viewBox="0 0 250 250" className="w-full max-w-sm">
                {items.map((item, i) => {
                  const rotation = -90 + i * (360 / NUM_SEGMENTS)
                  const sp = segmentProgress(i, drawProgress)
                  const offset = SEG_LENGTH * (1 - sp)
                  const lp = labelPosition(i)

                  return (
                    <g key={i}>
                      {/* Segmento */}
                      <circle
                        cx={CENTER}
                        cy={CENTER}
                        r={RADIUS}
                        fill="none"
                        stroke={COLORS[i % COLORS.length]}
                        strokeWidth={STROKE_W}
                        strokeLinecap="round"
                        strokeDasharray={`${SEG_LENGTH} ${CIRCUMFERENCE - SEG_LENGTH}`}
                        strokeDashoffset={offset}
                        transform={`rotate(${rotation} ${CENTER} ${CENTER})`}
                        className="donut-segment cursor-pointer"
                        onClick={() => {
                          const el = document.getElementById(`subsection-${i}`)
                          if (el) el.scrollIntoView({ behavior: 'smooth' })
                        }}
                        style={{ opacity: 0.15 + 0.85 * sp }}
                      />
                      {/* Label */}
                      {sp > 0.5 && (
                        <text
                          x={lp.x}
                          y={lp.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-white text-[7px] font-medium pointer-events-none"
                          style={{
                            opacity: Math.min(1, (sp - 0.5) * 2),
                            transition: 'opacity 0.3s',
                          }}
                        >
                          {(item.title ?? `Servicio ${i + 1}`).slice(0, 18)}
                        </text>
                      )}
                    </g>
                  )
                })}
                {/* Centro del donut */}
                <circle cx={CENTER} cy={CENTER} r={RADIUS - STROKE_W / 2 - 4} fill="rgb(2 6 23)" />
                <text
                  x={CENTER}
                  y={CENTER}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-white text-[9px] font-bold"
                >
                  Servicios
                </text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sub-secciones placeholder — una por porción ── */}
      {items.map((item, i) => (
        <section
          key={i}
          id={`subsection-${i}`}
          className="flex min-h-[50vh] items-center justify-center border-t border-white/5 bg-slate-950 px-6 py-20"
        >
          <div className="text-center">
            <span
              className="mb-4 inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <h3 className="text-2xl font-bold text-white">
              {item.title ?? `Servicio ${i + 1}`}
            </h3>
            <p className="mt-4 text-slate-500">
              Próximamente — Contenido en construcción
            </p>
          </div>
        </section>
      ))}
    </>
  )
}
