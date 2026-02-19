import type { Section } from '../../models'
import { textByRole, textsByRole, mediaByRole } from './sectionHelpers'
import { useInView } from '@shared/hooks'

interface Props { section: Section }

/**
 * Sección informativa principal — imagen a la izquierda, texto largo a la derecha.
 * Roles: heading, subtitle, paragraph, bullet | diagram, icon
 */
export default function InfoPrimarySection({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')
  const subtitle = textByRole(section.texts, 'subtitle')
  const paragraphs = textsByRole(section.texts, 'paragraph')
  const bullets = textsByRole(section.texts, 'bullet')
  const diagram = mediaByRole(section.media, 'diagram')
  const icons = section.media.filter((m) => m.role === 'icon').sort((a, b) => a.order - b.order)

  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.1 })

  return (
    <section ref={ref} className="bg-slate-500 py-24 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Imagen a la izquierda */}
          {diagram && (
            <div
              className={`flex justify-center transition-all duration-1000 ${
                isInView ? 'translate-x-0 opacity-100' : '-translate-x-16 opacity-0'
              }`}
            >
              <img
                src={diagram.mediaUrl}
                alt=""
                className="w-full max-w-lg rounded-2xl shadow-2xl shadow-teal-900/30"
              />
            </div>
          )}

          {/* Columna de texto a la derecha */}
          <div
            className={`space-y-6 transition-all duration-1000 delay-200 ${
              isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            {heading && (
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {heading.body}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-teal-400">{subtitle.body}</p>
            )}
            {paragraphs.map((p, i) => (
              <p key={i} className="leading-relaxed text-slate-300">{p.body}</p>
            ))}

            {/* Bullet list */}
            {bullets.length > 0 && (
              <ul className="space-y-3 pt-2">
                {bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {icons[i] ? (
                      <img src={icons[i].mediaUrl} alt="" className="mt-0.5 h-5 w-5 flex-shrink-0" />
                    ) : (
                      <span className="mt-1.5 flex h-2 w-2 flex-shrink-0 rounded-full bg-teal-400" />
                    )}
                    <span className="text-slate-200">{b.body}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
