import { useInView } from '@shared/hooks'
import type { Section } from '../../models'
import { textByRole } from './sectionHelpers'
import { colors, layout } from '../../../../theme'

interface Props { section: Section }

/**
 * Sección teaser editable de "Traspaso Generacional" que aparece en la home
 * debajo del Circuito. Título clickeable que lleva a la página de servicio.
 */
export default function GenerationalTransferTeaser({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')
  const subtitle = textByRole(section.texts, 'subtitle')
  const cta = textByRole(section.texts, 'cta')

  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.15 })

  return (
    <section
      ref={ref}
      className={layout.sectionPadY}
      style={{ backgroundColor: colors.circuitBg }}
    >
      <div className={layout.container}>
        <div className="grid items-center gap-[3vh] lg:grid-cols-2 lg:gap-[4vh]">
          {/* Left: Title as button */}
          <div
            className={`flex flex-col items-center lg:items-start gap-[2vh] transition-all duration-700 ${
              isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            {heading && (
              <h2
                className="text-center text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl md:text-4xl lg:text-left lg:text-5xl xl:text-6xl font-primary"
                style={{ color: colors.blueDark }}
              >
                {heading.body}
              </h2>
            )}
            {subtitle && (
              <p
                className={`w-full max-w-lg text-base sm:text-lg leading-relaxed text-center lg:text-justify transition-all duration-700 delay-200 ${
                  isInView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                }`}
                style={{ color: colors.blueMid }}
              >
                {subtitle.body}
              </p>
            )}
            {cta && (
              <a
                href="/servicios/traspaso-generacional"
                className="inline-flex items-center rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:scale-[1.03] hover:shadow-lg sm:px-8 sm:py-4 sm:text-base"
                style={{ backgroundColor: colors.tealMid }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.tealBright }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.tealMid }}
              >
                {cta.body}
              </a>
            )}
          </div>

          {/* Right: Illustration icon */}
          <div
            className={`flex items-center justify-center transition-all duration-1000 delay-300 ${
              isInView ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95'
            }`}
          >
            <svg
              viewBox="0 0 200 180"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-80 lg:h-80"
            >
              {/* Smaller person (passing generation) */}
              <circle cx="68" cy="52" r="16" fill={colors.blueDark} />
              <path d="M68 72 C50 72 42 88 42 104 L42 120 C42 124 46 126 50 126 L86 126 C90 126 94 124 94 120 L94 104 C94 88 86 72 68 72Z" fill={colors.blueDark} />
              {/* Arm reaching toward bigger person */}
              <path d="M94 96 L112 88" stroke={colors.blueDark} strokeWidth="6" strokeLinecap="round" />

              {/* Larger person (receiving generation) */}
              <circle cx="140" cy="36" r="22" fill={colors.tealBright} />
              <path d="M140 62 C116 62 106 84 106 106 L106 140 C106 145 110 148 115 148 L165 148 C170 148 174 145 174 140 L174 106 C174 84 164 62 140 62Z" fill={colors.tealBright} />
              {/* Hand receiving */}
              <path d="M106 100 L96 94" stroke={colors.tealBright} strokeWidth="6" strokeLinecap="round" />

              {/* Connection arc (generational bond) */}
              <path d="M86 130 Q104 155 122 148" stroke={colors.tealMid} strokeWidth="3" strokeLinecap="round" strokeDasharray="6 4" opacity="0.6" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
