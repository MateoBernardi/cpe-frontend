import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Section } from '../../models'
import { textByRole, textsByRole } from './sectionHelpers'
import { useInView, useScrollProgress } from '@shared/hooks'
import { colors, layout } from '../../../../theme'

interface Props { section: Section }

// ── Accent palette for the accordion list (brand degradé) ──
const SEGMENT_COLORS = colors.donut

export default function InfoSecondarySection({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')
  const paragraphs = textsByRole(section.texts, 'paragraph')
  const quotes = textsByRole(section.texts, 'quote')

  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [hoveredSeg, setHoveredSeg] = useState<number | null>(null)
  const { ref: viewRef, isInView } = useInView<HTMLElement>({ threshold: 0.1 })
  // Progreso de scroll del diagrama del circuito (reemplaza a la dona) — anima
  // opacidad/escala igual que en el antiguo CircuitSection.
  const { ref: diagramRef, progress } = useScrollProgress<HTMLDivElement>()
  const navigate = useNavigate()

  const t = Math.min(1, Math.max(0, (progress - 0.15) / 0.28))
  const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2

  const handleNavigate = (route: string) => () => navigate({ pathname: route, hash: '' })

  const segments = paragraphs.map((paragraph, i) => ({ paragraph, quote: quotes[i] }))

  return (
    <section
      ref={viewRef}
      className="overflow-hidden lg:flex lg:flex-col lg:h-screen lg:supports-[height:100dvh]:h-[100dvh] pt-[4vh] sm:pt-[5vh] md:pt-[6vh] lg:pt-[6vh] pb-[4vh] sm:pb-[5vh] md:pb-[6vh]"
      style={{ backgroundColor: colors.infoSecondaryBg }}
    >
      <div className={`${layout.container} lg:flex lg:flex-1 lg:min-h-0 lg:flex-col`}>
        {heading && (
          <h2
            className={`mb-[5vh] sm:mb-[7vh] md:mb-[9vh] lg:mb-[6vh] lg:flex-shrink-0 text-center text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl transition-all duration-700 font-primary ${
              isInView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
            style={{ color: colors.blueDark }}
          >
            {heading.body}
          </h2>
        )}

        <div className="grid gap-[4vh] sm:gap-[5vh] lg:gap-[6vh] lg:grid-cols-2 lg:items-stretch lg:flex-1 lg:min-h-0">
          {/* Collapsibles (left) */}
          <div
            className={`space-y-3 transition-all duration-700 delay-200 lg:min-h-0 lg:overflow-y-auto lg:pr-1 ${
              isInView ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
            }`}
          >
            {segments.map(({ paragraph, quote }, i) => (
              <div
                key={i}
                className={`rounded-xl overflow-hidden transition-colors duration-300 border-l-4 shadow-sm`}
                style={{
                  borderLeftColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
                  backgroundColor: hoveredSeg === i ? colors.offWhite : colors.white,
                }}
                onMouseEnter={() => setHoveredSeg(i)}
                onMouseLeave={() => setHoveredSeg(null)}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="flex w-full items-center justify-between px-3 py-3 sm:px-5 sm:py-4 text-left transition-colors hover:bg-black/5"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }}
                    />
                    <span className="font-semibold text-sm sm:text-base" style={{ color: colors.blueDark }}>
                      {paragraph?.body ?? `Servicio ${i + 1}`}
                    </span>
                  </div>
                  {quote && (
                    <svg
                      className={`h-5 w-5 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}
                      style={{ color: colors.blueMid }}
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
                      <p className="text-sm leading-relaxed" style={{ color: colors.blueMid }}>{quote.body}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Circuito de intervención (right) — reemplaza a la dona */}
          <div className="flex flex-col items-center lg:min-h-0 lg:justify-start">
            <div
              ref={diagramRef}
              className="relative mx-auto w-full aspect-[596/720] max-w-[236px] overflow-hidden sm:max-w-[294px] md:max-w-[339px] lg:w-auto lg:max-w-full lg:flex-1 lg:min-h-0 lg:-top-[5vh]"
              style={{
                opacity: 0.1 + ease * 0.9,
                transform: `scale(${0.88 + ease * 0.12})`,
                transition: 'opacity 0.1s, transform 0.1s',
                backgroundColor: colors.infoSecondaryBg,
                transformOrigin: 'top center',
              }}
            >
              {/* El asset trae aire propio: su viewBox es 810x1012.5 pero el
                  dibujo real vive en (107,146)-(703,866) — o sea ~14% de lienzo
                  vacío arriba y abajo. Por eso `object-top` no servía: el lienzo
                  ya llenaba la caja y el hueco estaba adentro de la imagen. Se
                  recorta acá, escalando la img y corriéndola con offsets
                  negativos, para no tocar el SVG (que se reexporta desde diseño).
                  La caja queda con el aspecto del dibujo, así su borde superior
                  se alinea con el primer collapsible y los hotspots de abajo
                  siguen midiéndose en % sobre el dibujo recortado. */}
              <img
                src="/CPE%20%20POST.svg"
                alt="Circuito integrado de acción"
                className="absolute left-[-17.95%] top-[-20.28%] block h-[140.63%] w-[135.91%] max-w-none select-none object-contain mix-blend-multiply"
                loading="lazy"
                draggable={false}
              />

              {/* Intervención Directa (Cuadrado superior) */}
              <button
                type="button"
                aria-label="Intervención directa"
                onClick={handleNavigate('/servicios/intervencion-directa')}
                className="absolute left-[12.6%] top-[7.8%] h-[35.2%] w-[74.8%] bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              />

              {/* Selección de Personal (Cuadrado inferior izquierdo) */}
              <button
                type="button"
                aria-label="Selección de personal"
                onClick={handleNavigate('/servicios/seleccion-de-personal')}
                className="absolute left-[2.4%] top-[36%] h-[56.2%] w-[40.8%] bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              />

              {/* Acompañamiento a las personas (Cuadrado inferior derecho) */}
              <button
                type="button"
                aria-label="Acompañamiento a las personas"
                onClick={handleNavigate('/servicios/acompanamiento')}
                className="absolute left-[43.2%] top-[50%] h-[42.2%] w-[56.8%] bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              />
            </div>

            {/* Hint */}
            <div
              className="mt-2 text-center text-sm text-gray-500 lg:flex-shrink-0"
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
