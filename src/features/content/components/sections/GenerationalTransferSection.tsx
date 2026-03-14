import type { Section } from '../../models'
import { textByRole, textsByRole, mediaByRole } from './sectionHelpers'
import { useInView } from '@shared/hooks'
import { colors, layout } from '../../../../theme'

interface Props { section: Section }

/**
 * Sección "Traspaso Generacional" — imagen arriba, texto editable debajo, CTA al final.
 * Fondo #eeeeee (misma paleta que CircuitSection).
 */
export default function GenerationalTransferSection({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')
  const subtitle = textByRole(section.texts, 'subtitle')
  const paragraphs = textsByRole(section.texts, 'paragraph')
  const ctaText = textByRole(section.texts, 'cta')
  const photo = mediaByRole(section.media, 'photo')

  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.12 })

  return (
    <section
      ref={ref}
      className={layout.sectionPadY}
      style={{ backgroundColor: colors.circuitBg }}
    >
      <div className={layout.containerNarrow}>
        {/* Heading */}
        {heading && (
          <h2
            className={`text-center text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl font-primary transition-all duration-700 ${
              isInView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ color: colors.blueDark }}
          >
            {heading.body}
          </h2>
        )}

        {subtitle && (
          <p
            className={`mt-[2vh] text-center text-base sm:text-lg font-medium transition-all duration-700 delay-100 ${
              isInView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
            style={{ color: colors.tealMid }}
          >
            {subtitle.body}
          </p>
        )}

        {/* Image */}
        {photo && (
          <div
            className={`mt-[5vh] overflow-hidden rounded-2xl transition-all duration-1000 delay-200 ${
              isInView ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95'
            }`}
          >
            <img
              src={photo.url}
              alt=""
              className="aspect-[4/3] w-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Paragraphs */}
        {paragraphs.length > 0 && (
          <div className="mt-[4vh] space-y-[2vh]">
            {paragraphs.map((p, i) => (
              <p
                key={i}
                className={`text-sm leading-relaxed sm:text-base md:text-lg transition-all duration-700 ${
                  isInView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                }`}
                style={{
                  color: colors.blueMid,
                  transitionDelay: `${300 + i * 120}ms`,
                }}
              >
                {p.body}
              </p>
            ))}
          </div>
        )}

        {/* CTA Button */}
        {ctaText && (
          <div
            className={`mt-[5vh] flex justify-center transition-all duration-700 delay-500 ${
              isInView ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
            }`}
          >
            <a
              href="/servicios/traspaso-generacional"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-xl px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-xl sm:px-10 sm:py-5 sm:text-lg"
              style={{ backgroundColor: colors.tealMid, boxShadow: `0 6px 24px ${colors.tealDeep}60` }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.tealBright }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.tealMid }}
            >
              <span className="relative">{ctaText.body}</span>
              <svg className="relative h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              {/* Shine effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
