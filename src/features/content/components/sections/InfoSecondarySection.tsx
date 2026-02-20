import { useState } from 'react'
import type { Section } from '../../models'
import { textByRole, textsByRole } from './sectionHelpers'
import { useInView } from '@shared/hooks'

interface Props { section: Section }

// ── Constantes del donut SVG ──
const CENTER = 150
const OUTER_R = 120
const INNER_R = 65
const GAP_DEG = 3 // grados de separación entre porciones

const COLORS = ['#0d9488', '#06b6d4', '#6366f1', '#4338ca', '#134e4a']
const HOVER_COLORS = ['#14b8a6', '#22d3ee', '#818cf8', '#6366f1', '#1a6b64']

/** Convierte grados → radianes */
const deg2rad = (d: number) => (d * Math.PI) / 180

/** Punto en un círculo */
function polarToCart(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = deg2rad(angleDeg)
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

/** Genera el path `d` para un sector anular (porción de dona gruesa) */
function arcSectorPath(
  cx: number, cy: number,
  outerR: number, innerR: number,
  startDeg: number, endDeg: number,
): string {
  const sweep = endDeg - startDeg
  const largeArc = sweep > 180 ? 1 : 0

  const os = polarToCart(cx, cy, outerR, startDeg)
  const oe = polarToCart(cx, cy, outerR, endDeg)
  const is_ = polarToCart(cx, cy, innerR, endDeg)
  const ie = polarToCart(cx, cy, innerR, startDeg)

  return [
    `M ${os.x} ${os.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${oe.x} ${oe.y}`,
    `L ${is_.x} ${is_.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ie.x} ${ie.y}`,
    'Z',
  ].join(' ')
}

/** Ángulo medio de un segmento para posicionar el label */
function midAngle(index: number, numSegments: number): number {
  const segDeg = 360 / numSegments
  return -90 + index * segDeg + segDeg / 2
}

/** Separa texto largo en líneas de máximo `max` caracteres */
function wrapText(text: string, max: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const w of words) {
    if (current && (current + ' ' + w).length > max) {
      lines.push(current)
      current = w
    } else {
      current = current ? current + ' ' + w : w
    }
  }
  if (current) lines.push(current)
  return lines
}

/**
 * Sección informativa secundaria — Gráfico dona con scroll + collapsibles.
 * Cada porción del donut es clickable y scrollea a su sub-sección.
 */
export default function InfoSecondarySection({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')

  // Paragraphs → porciones de rosca + títulos de collapsibles
  const paragraphs = textsByRole(section.texts, 'paragraph')
  // Quotes → descripciones que se abren en los collapsibles
  const quotes = textsByRole(section.texts, 'quote')

  const numSegments = paragraphs.length || 1

  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [hoveredSeg, setHoveredSeg] = useState<number | null>(null)
  const { ref: viewRef, isInView } = useInView<HTMLElement>({ threshold: 0.1 })

  // ── Pre-calcular geometría de cada segmento ──
  const segDeg = 360 / numSegments
  const segments = paragraphs.map((paragraph, i) => {
    const startDeg = -90 + i * segDeg + GAP_DEG / 2
    const endDeg = -90 + (i + 1) * segDeg - GAP_DEG / 2
    const d = arcSectorPath(CENTER, CENTER, OUTER_R, INNER_R, startDeg, endDeg)
    const mid = midAngle(i, numSegments)
    const labelR = (OUTER_R + INNER_R) / 2
    const lp = polarToCart(CENTER, CENTER, labelR, mid)
    const title = (paragraph.body ?? `Servicio ${i + 1}`).toUpperCase()
    const lines = wrapText(title, 14)
    const quote = quotes[i] // descripción asociada
    return { d, lp, lines, paragraph, quote }
  })

  return (
    <>
      <section
        ref={(el) => {
          (viewRef as React.RefObject<HTMLElement | null>).current = el
        }}
        className="bg-white py-24"
      >
        <div className="mx-auto max-w-7xl px-6">
          {heading && (
            <h2
              className={`mb-16 text-center text-black text-3xl font-bold tracking-tight sm:text-4xl transition-all duration-700 ${
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
              {segments.map(({ paragraph, quote }, i) => (
                <div
                  key={i}
                  className={`rounded-xl overflow-hidden transition-colors duration-300 border-l-4 ${
                    hoveredSeg === i ? 'bg-slate-50' : 'bg-white'
                  } shadow-sm`}
                  style={{ borderLeftColor: COLORS[i % COLORS.length] }}
                  onMouseEnter={() => setHoveredSeg(i)}
                  onMouseLeave={() => setHoveredSeg(null)}
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-black/5"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-3 w-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span className="font-semibold text-black">
                        {paragraph?.body ?? `Servicio ${i + 1}`}
                      </span>
                    </div>
                    {quote && (
                      <svg
                        className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${
                          openIndex === i ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                  {quote && (
                    <div className={`accordion-body ${openIndex === i ? 'open' : ''}`}>
                      <div className="px-5 pb-4 pt-0">
                        <p className="text-sm leading-relaxed text-slate-600">{quote.body}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ── Donut chart (derecha) ── */}
            <div
              className={`flex justify-center transition-all duration-700 delay-300 ${
                isInView ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
              }`}
            >
              <svg viewBox="0 0 300 300" className="w-full max-w-md">
                {/* Segmentos (porciones gruesas) */}
                {segments.map(({ d, lp, lines }, i) => {
                  const isHovered = hoveredSeg === i
                  const color = isHovered ? HOVER_COLORS[i % HOVER_COLORS.length] : COLORS[i % COLORS.length]

                  return (
                    <g
                      key={i}
                      className="cursor-pointer"
                      style={{
                        transition: 'opacity 0.7s ease, transform 0.25s ease',
                        transitionDelay: `${i * 80}ms`,
                        opacity: isInView ? 1 : 0,
                        transformOrigin: `${CENTER}px ${CENTER}px`,
                        transform: isHovered
                          ? 'scale(1.04)'
                          : isInView ? 'scale(1)' : 'scale(0.85)',
                      }}
                      onMouseEnter={() => setHoveredSeg(i)}
                      onMouseLeave={() => setHoveredSeg(null)}
                      onClick={() => {
                        setOpenIndex(i)
                      }}
                    >
                      {/* Porción rellena */}
                      <path
                        d={d}
                        fill={color}
                        stroke="transparent"
                        strokeWidth={1}
                        style={{ transition: 'fill 0.25s ease' }}
                      />
                      {/* Label dentro del segmento */}
                      <text
                        x={lp.x}
                        y={lp.y - ((lines.length - 1) * 6)}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="pointer-events-none select-none"
                      >
                        {lines.map((line, li) => (
                          <tspan
                            key={li}
                            x={lp.x}
                            dy={li === 0 ? 0 : 13}
                            className="fill-white text-[7px] font-sans"
                            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
                          >
                            {line}
                          </tspan>
                        ))}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
