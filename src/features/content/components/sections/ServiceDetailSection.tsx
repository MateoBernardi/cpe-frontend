import type { Section } from '../../models'
import { textByRole, textsByRole, mediaByRole } from './sectionHelpers'
import { useInView } from '@shared/hooks'

interface Props { section: Section }

/**
 * Sección de detalle de servicio — layout izquierda texto / derecha imagen.
 * Roles: heading, subtitle (objetivo), paragraph (ejes de trabajo), bullet | photo
 */
export default function ServiceDetailSection({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')
  const subtitle = textByRole(section.texts, 'subtitle')
  const paragraphs = textsByRole(section.texts, 'paragraph')
  const bullets = textsByRole(section.texts, 'bullet')
  const photo = mediaByRole(section.media, 'photo')

  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.1 })

  const hasTextContent = heading || subtitle || paragraphs.length > 0 || bullets.length > 0

  return (
    <section ref={ref} className="py-10 sm:py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className={`grid gap-10 ${hasTextContent && photo ? 'lg:grid-cols-2' : ''} lg:items-start`}>
          {/* ── Left: text content (floating card) ── */}
          {hasTextContent && (
            <div
              className={`rounded-2xl bg-white/90 backdrop-blur-sm p-5 sm:p-6 md:p-8 shadow-lg ring-1 ring-slate-200/60 transition-all duration-1000 ${
                isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              <div className="space-y-6">
                {heading && (
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
                    {heading.body}
                  </h2>
                )}

                {subtitle && (
                  <div className="rounded-xl border border-teal-200 bg-teal-50 p-5">
                    <p className="text-sm font-semibold uppercase tracking-wider text-teal-700">
                      Objetivo
                    </p>
                    <p className="mt-2 leading-relaxed text-slate-700">{subtitle.body}</p>
                  </div>
                )}

                {paragraphs.map((p, i) => (
                  <p key={i} className="leading-relaxed text-slate-600">{p.body}</p>
                ))}

                {bullets.length > 0 && (
                  <div>
                    <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
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
                          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-500" />
                          <span className="text-slate-600">{b.body}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Right: floating image ── */}
          {photo && (
            <div
              className={`transition-all duration-1000 delay-300 ${
                isInView ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
              }`}
            >
              <div className="group relative">
                {/* Decorative background shape */}
                <div className="absolute -inset-4 rounded-3xl bg-teal-100/50" />
                <div className="relative overflow-hidden rounded-2xl shadow-xl ring-1 ring-slate-200">
                  <img
                    src={photo.url}
                    alt=""
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
