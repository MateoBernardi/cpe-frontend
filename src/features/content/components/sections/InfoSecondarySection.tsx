import { useState } from 'react'
import type { Section } from '../../models'
import { textByRole, textsByRole } from './sectionHelpers'
import { useInView } from '@shared/hooks'
import InterventionCircuitDiagram from './InterventionCircuitDiagram'
import { colors, layout } from '../../../../theme'

interface Props { section: Section }

const COLORS = colors.donut

/**
 * Sección "Metodología" — a la izquierda un acordeón plano (solo línea
 * superior, sin card ni sombra) con los pasos del proceso; a la derecha el
 * circuito integrado de acción (imagen + hotspots hacia los servicios),
 * que reemplaza a la antigua rueda de segmentos.
 */
export default function InfoSecondarySection({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')
  const paragraphs = textsByRole(section.texts, 'paragraph')
  const quotes = textsByRole(section.texts, 'quote')

  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const { ref: viewRef, isInView } = useInView<HTMLElement>({ threshold: 0.1 })

  return (
    <section
      ref={viewRef}
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

        <div className="mt-[2.5vh] grid gap-[4vh] sm:gap-[5vh] lg:mt-[3vh] lg:grid-cols-2 lg:gap-[6vh] lg:items-center">
          {/* Acordeón plano (izquierda) */}
          <div
            className={`flex flex-col transition-all duration-700 delay-200 ${
              isInView ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
            }`}
          >
            {paragraphs.map((paragraph, i) => {
              const quote = quotes[i]
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

          {/* Circuito integrado de acción (derecha) */}
          <div
            className={`flex justify-center transition-all duration-700 delay-300 ${
              isInView ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
            }`}
          >
            <InterventionCircuitDiagram />
          </div>
        </div>
      </div>
    </section>
  )
}
