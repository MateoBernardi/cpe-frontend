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

  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.1 })

  const hasTextContent = heading || subtitle || paragraphs.length > 0 || bullets.length > 0

  return (
    <section ref={ref} className={layout.sectionPadYCompact} style={{ backgroundColor: colors.lightGray }}>
      <div className={layout.container}>
        <div className={`grid gap-[4vh] ${hasTextContent && photo ? 'lg:grid-cols-2' : ''} lg:items-start`}>
          {/* Left: text content (floating card) */}
          {hasTextContent && (
            <div
              className={`rounded-2xl bg-white/90 backdrop-blur-sm p-5 sm:p-6 md:p-8 shadow-lg ring-1 ring-slate-200/60 transition-all duration-1000 ${
                isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              <div className="space-y-[3vh]">
                {heading && (
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl font-primary" style={{ color: colors.blueDark }}>
                    {heading.body}
                  </h2>
                )}

                {subtitle && (
                  <div className="rounded-xl border p-5" style={{ borderColor: colors.tealBright, backgroundColor: `${colors.tealBright}10` }}>
                    <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: colors.tealMid }}>
                      Objetivo
                    </p>
                    <p className="mt-2 leading-relaxed" style={{ color: colors.blueMid }}>{subtitle.body}</p>
                  </div>
                )}

                {paragraphs.map((p, i) => (
                  <p key={i} className="leading-relaxed" style={{ color: colors.blueMid }}>{p.body}</p>
                ))}

                {bullets.length > 0 && (
                  <div>
                    <p className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: colors.blueDark }}>
                      Ejes de trabajo
                    </p>
                    <ul className="space-y-2">
                      {bullets.map((b, i) => (
                        <li
                          key={i}
                          className={`flex items-start gap-3 transition-all duration-500 ${
                            isInView ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                          }`}
                          style={{ transitionDelay: `${400 + i * 80}ms` }}
                        >
                          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: colors.secondary.attention }} />
                          <span style={{ color: colors.blueMid }}>{b.body}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Right: floating image */}
          {photo && (
            <div
              className={`transition-all duration-1000 delay-300 ${
                isInView ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
              }`}
            >
              <div className="group relative">
                <div className="absolute -inset-4 rounded-3xl" style={{ backgroundColor: `${colors.tealBright}15` }} />
                <div className="relative overflow-hidden rounded-2xl shadow-xl ring-1 ring-slate-200">
                  <img src={photo.url} alt="" className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
