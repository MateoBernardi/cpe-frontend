import { useState } from 'react'
import type { Section } from '../../models'
import { textByRole, textsByRole } from './sectionHelpers'
import { useInView } from '@shared/hooks'
import { colors, layout } from '../../../../theme'

interface Props { section: Section }

// ── Wheel SVG constants ──
const CENTER = 150
const OUTER_R = 120
const INNER_R = 65
const GAP_DEG = 3

const COLORS = colors.donut
const HOVER_COLORS = colors.donutHover

const deg2rad = (d: number) => (d * Math.PI) / 180

function polarToCart(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = deg2rad(angleDeg)
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

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

/**
 * Sección "Metodología" — a la izquierda un acordeón plano (solo línea
 * superior, sin card ni sombra) con los pasos del proceso; a la derecha la
 * "rueda" — N segmentos de anillo (mismo arco matemático que antes, sin
 * etiquetas internas) que representan visualmente esos mismos pasos.
 */
export default function InfoSecondarySection({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')
  const paragraphs = textsByRole(section.texts, 'paragraph')
  const quotes = textsByRole(section.texts, 'quote')
  const numSegments = paragraphs.length || 1

  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const [hoveredSeg, setHoveredSeg] = useState<number | null>(null)
  const { ref: viewRef, isInView } = useInView<HTMLElement>({ threshold: 0.1 })

  const segDeg = 360 / numSegments
  const segments = paragraphs.map((paragraph, i) => {
    const startDeg = -90 + i * segDeg + GAP_DEG / 2
    const endDeg = -90 + (i + 1) * segDeg - GAP_DEG / 2
    const d = arcSectorPath(CENTER, CENTER, OUTER_R, INNER_R, startDeg, endDeg)
    const quote = quotes[i]
    return { d, paragraph, quote }
  })

  return (
    <section
      ref={(el) => {
        (viewRef as React.RefObject<HTMLElement | null>).current = el
      }}
      className={layout.sectionPadY}
      style={{ backgroundColor: colors.infoSecondaryBg }}
    >
      <div className={layout.container}>
        <div
          className={`max-w-2xl transition-all duration-700 ${
            isInView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          <span className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: colors.tealMid }}>
            Metodología
          </span>
          {heading && (
            <h2 className="mt-3 font-secondary text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl" style={{ color: colors.blueDark }}>
              {heading.body}
            </h2>
          )}
        </div>

        <div className="mt-[5vh] grid gap-[4vh] sm:gap-[5vh] lg:mt-[6vh] lg:grid-cols-2 lg:gap-[6vh] lg:items-start">
          {/* Acordeón plano (izquierda) */}
          <div
            className={`flex flex-col transition-all duration-700 delay-200 ${
              isInView ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
            }`}
          >
            {segments.map(({ paragraph, quote }, i) => {
              const isOpen = openIndex === i
              return (
                <div
                  key={i}
                  className="border-t last:border-b"
                  style={{ borderColor: `${colors.blueDark}24` }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    onMouseEnter={() => setHoveredSeg(i)}
                    onMouseLeave={() => setHoveredSeg(null)}
                    className="flex w-full items-center gap-4 py-4 text-left"
                  >
                    <span className="font-mono text-xs" style={{ color: COLORS[i % COLORS.length] }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1 text-sm font-semibold sm:text-base" style={{ color: colors.blueDark }}>
                      {paragraph?.body ?? `Etapa ${i + 1}`}
                    </span>
                    {quote && (
                      <svg
                        className="h-3 w-3 flex-shrink-0 transition-transform duration-200"
                        style={{ transform: isOpen ? 'rotate(-135deg)' : 'rotate(45deg)' }}
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M6 4L18 12L6 20"
                          stroke={colors.tealMid}
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                  {quote && (
                    <div className={`accordion-body ${isOpen ? 'open' : ''}`}>
                      <div className="max-w-md pb-4 pl-[42px] pr-2">
                        <p className="text-sm leading-relaxed" style={{ color: colors.blueMid }}>{quote.body}</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Rueda (derecha) */}
          <div
            className={`flex justify-center transition-all duration-700 delay-300 ${
              isInView ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
            }`}
          >
            <svg viewBox="0 0 300 300" className="w-full max-w-xs sm:max-w-sm md:max-w-md">
              {segments.map(({ d }, i) => {
                const isHovered = hoveredSeg === i
                const color = isHovered ? HOVER_COLORS[i % HOVER_COLORS.length] : COLORS[i % COLORS.length]

                return (
                  <path
                    key={i}
                    d={d}
                    fill={color}
                    stroke="transparent"
                    strokeWidth={1}
                    className="cursor-pointer"
                    style={{
                      transition: 'opacity 0.7s ease, transform 0.25s ease, fill 0.25s ease',
                      transitionDelay: `${i * 80}ms`,
                      opacity: isInView ? 1 : 0,
                      transformOrigin: `${CENTER}px ${CENTER}px`,
                      transform: isHovered
                        ? 'scale(1.04)'
                        : isInView ? 'scale(1)' : 'scale(0.85)',
                    }}
                    onMouseEnter={() => setHoveredSeg(i)}
                    onMouseLeave={() => setHoveredSeg(null)}
                    onClick={() => setOpenIndex(i)}
                  />
                )
              })}
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
