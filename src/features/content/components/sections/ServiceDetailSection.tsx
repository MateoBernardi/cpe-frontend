import type { Section } from '../../models'
import { textByRole, textsByRole, mediaByRole } from './sectionHelpers'
import { useInView } from '@shared/hooks'
import { colors, layout } from '../../../../theme'

interface Props { section: Section }

export default function ServiceDetailSection({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')
  const subtitle = textByRole(section.texts, 'subtitle')
  const paragraphs = textsByRole(section.texts, 'paragraph')
  const bullets = textsByRole(section.texts, 'bullet')
  const photo = mediaByRole(section.media, 'photo')
  const ctaHeading = textByRole(section.texts, 'cta_heading')
  const cta = textByRole(section.texts, 'cta')

  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.1 })

  const hasTextContent = heading || subtitle || paragraphs.length > 0 || bullets.length > 0
  const hairline = `${colors.blueDark}20`

  return (
    <section ref={ref} className={layout.sectionPadYCompact} style={{ backgroundColor: colors.lightGray }}>
      <div className={layout.container}>
        {/* Eyebrow */}
        <span
          className={`block font-mono text-xs uppercase tracking-[0.2em] transition-all duration-700 ${
            isInView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
          style={{ color: colors.tealMid }}
        >
          Nuestros servicios
        </span>

        <div
          className={`mt-[3vh] grid gap-y-10 lg:items-start lg:gap-x-[72px] lg:gap-y-0 ${
            hasTextContent && photo ? 'lg:grid-cols-[1.15fr_1fr]' : ''
          }`}
        >
          {/* Left: text content */}
          {hasTextContent && (
            <div
              className={`transition-all duration-1000 ${
                isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              <div className="space-y-[3.5vh]">
                {heading && (
                  <h2
                    className="font-secondary text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.5rem]"
                    style={{ color: colors.blueDark }}
                  >
                    {heading.body}
                    <span style={{ color: colors.tealBright }}>.</span>
                  </h2>
                )}

                {paragraphs.length > 0 && (
                  <div className="max-w-[460px] space-y-4">
                    {paragraphs.map((p, i) => (
                      <p key={i} className="text-[17px] leading-relaxed" style={{ color: colors.blueMid }}>
                        {p.body}
                      </p>
                    ))}
                  </div>
                )}

                {subtitle && (
                  <div className="max-w-[480px] border-t pt-6" style={{ borderColor: hairline }}>
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: colors.tealMid }}>
                      Objetivo
                    </p>
                    <p
                      className="font-secondary mt-3 text-xl italic leading-[1.45] sm:text-[1.4375rem]"
                      style={{ color: colors.blueDark }}
                    >
                      {subtitle.body}
                    </p>
                  </div>
                )}

                {bullets.length > 0 && (
                  <div className="border-t pt-6" style={{ borderColor: hairline }}>
                    <p className="mb-1 font-mono text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: colors.tealMid }}>
                      Ejes de trabajo
                    </p>
                    <ul>
                      {bullets.map((b, i) => (
                        <li
                          key={i}
                          className={`flex items-baseline gap-[22px] border-b py-4 transition-all duration-500 ${
                            isInView ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                          }`}
                          style={{ borderColor: hairline, transitionDelay: `${300 + i * 80}ms` }}
                        >
                          <span
                            className="font-secondary min-w-[34px] flex-shrink-0 text-xl"
                            style={{ color: colors.tealMid }}
                          >
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className="text-base leading-snug" style={{ color: colors.blueDark }}>
                            {b.body}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Right: sticky image */}
          {photo && (
            <div
              className={`transition-all duration-1000 delay-300 lg:sticky lg:top-24 ${
                isInView ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
              }`}
            >
              <div className="overflow-hidden ring-1 ring-slate-200">
                <img src={photo.url} alt="" className="aspect-[4/5] w-full object-cover" loading="lazy" />
              </div>
            </div>
          )}
        </div>

        {/* Dark CTA band */}
        {(ctaHeading || cta) && (
          <div
            className={`mt-16 flex flex-wrap items-center justify-between gap-10 p-8 transition-all duration-1000 delay-500 sm:p-10 lg:p-14 ${
              isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
            style={{ backgroundColor: colors.blueDark }}
          >
            {ctaHeading && (
              <div className="max-w-[640px]">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: colors.tealBright }}>
                  También ofrecemos
                </p>
                <h3 className="font-secondary mt-3 text-2xl font-medium leading-[1.1] sm:text-3xl" style={{ color: colors.white }}>
                  {ctaHeading.body}
                  <span style={{ color: colors.tealBright }}>.</span>
                </h3>
              </div>
            )}
            {cta && (
              <div className="text-center">
                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold shadow-md transition-all hover:-translate-y-0.5 sm:px-8 sm:py-4 sm:text-base"
                  style={{ backgroundColor: colors.white, color: colors.blueDark }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.lightGray }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.white }}
                >
                  {cta.body}
                  <span aria-hidden="true">&rarr;</span>
                </a>
                <p className="mt-3 text-xs" style={{ color: `${colors.white}99` }}>
                  Sin costo · Reunión virtual
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
