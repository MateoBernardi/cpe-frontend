import { useInView } from '@shared/hooks'
import type { Section } from '../../models'
import { textByRole } from './sectionHelpers'
import { colors, layout } from '../../../../theme'

interface Props { section: Section }

/**
 * Sección teaser editable de "Clínica para Empresarios" que aparece en la home.
 * Layout: ícono/ilustración a la izquierda, info (título, subtítulo, CTA) a la derecha.
 */
export default function ClinicaEmpresariosTeaser({ section }: Props) {
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
          {/* Left: Illustration icon */}
          <div
            className={`flex items-center justify-center transition-all duration-1000 delay-300 ${
              isInView ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95'
            }`}
          >
            <svg
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-80 lg:h-80"
            >
              {/* Psychology + Leadership icon */}
              {/* Head silhouette */}
              <path
                d="M100 20 C65 20 42 50 42 82 C42 100 50 115 62 124 L62 148 C62 154 67 158 73 158 L92 158 L92 170 C92 174 95 178 100 178 C105 178 108 174 108 170 L108 158 L127 158 C133 158 138 154 138 148 L138 124 C150 115 158 100 158 82 C158 50 135 20 100 20Z"
                fill={colors.tealBright}
                opacity="0.9"
              />
              {/* Brain detail – left hemisphere */}
              <path
                d="M78 60 C72 60 68 66 68 72 C68 76 70 79 73 81 C70 84 68 88 68 92 C68 98 73 103 80 103 L80 80 C76 78 74 75 74 72 C74 68 76 64 80 62Z"
                fill="white"
                opacity="0.5"
              />
              {/* Brain detail – right hemisphere */}
              <path
                d="M122 60 C128 60 132 66 132 72 C132 76 130 79 127 81 C130 84 132 88 132 92 C132 98 127 103 120 103 L120 80 C124 78 126 75 126 72 C126 68 124 64 120 62Z"
                fill="white"
                opacity="0.5"
              />
              {/* Brain center line */}
              <line x1="100" y1="52" x2="100" y2="108" stroke="white" strokeWidth="2" opacity="0.4" />
              {/* Brain bridge */}
              <path d="M82 78 Q100 70 118 78" stroke="white" strokeWidth="2.5" fill="none" opacity="0.5" />
              <path d="M82 90 Q100 82 118 90" stroke="white" strokeWidth="2.5" fill="none" opacity="0.5" />
              {/* Lightbulb glow / insight spark above head */}
              <circle cx="100" cy="10" r="5" fill={colors.tealBright} opacity="0.6" />
              <line x1="100" y1="2" x2="100" y2="0" stroke={colors.tealBright} strokeWidth="2" strokeLinecap="round" />
              <line x1="92" y1="5" x2="89" y2="2" stroke={colors.tealBright} strokeWidth="2" strokeLinecap="round" />
              <line x1="108" y1="5" x2="111" y2="2" stroke={colors.tealBright} strokeWidth="2" strokeLinecap="round" />
              {/* Upward growth arrows beside the head */}
              <path d="M28 130 L28 100 L22 108 M28 100 L34 108" stroke={colors.blueDark} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
              <path d="M172 120 L172 90 L166 98 M172 90 L178 98" stroke={colors.blueDark} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
              {/* Small people silhouettes at bottom – team/leadership */}
              <circle cx="55" cy="180" r="5" fill={colors.blueDark} opacity="0.35" />
              <rect x="50" y="187" width="10" height="10" rx="3" fill={colors.blueDark} opacity="0.25" />
              <circle cx="145" cy="180" r="5" fill={colors.blueDark} opacity="0.35" />
              <rect x="140" y="187" width="10" height="10" rx="3" fill={colors.blueDark} opacity="0.25" />
              <circle cx="100" cy="182" r="4" fill={colors.blueDark} opacity="0.25" />
              <rect x="96" y="188" width="8" height="8" rx="2" fill={colors.blueDark} opacity="0.18" />
            </svg>
          </div>

          {/* Right: Title, subtitle, CTA */}
          <div
            className={`flex flex-col items-center lg:items-start gap-[2vh] transition-all duration-700 ${
              isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            {heading && (
              <h2
                className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-primary"
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
                href="/servicios/clinica-para-empresarios"
                className="inline-flex items-center rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:scale-[1.03] hover:shadow-lg sm:px-8 sm:py-4 sm:text-base"
                style={{ backgroundColor: colors.tealMid }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.tealBright }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.tealMid }}
              >
                {cta.body}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
