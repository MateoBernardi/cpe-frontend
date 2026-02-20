import type { Section } from '../../models'
import { textByRole, textsByRole, mediaByRole } from './sectionHelpers'
import { useInView } from '@shared/hooks'

interface Props { section: Section }

export default function InfoPrimarySection({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')
  const bullets = textsByRole(section.texts, 'bullet')
  const diagram = mediaByRole(section.media, 'diagram')
  const icons = section.media.filter((m) => m.role === 'icon').sort((a, b) => a.order - b.order)

  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.1 })

  return (
    <section ref={ref} className="bg-slate-100 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Imagen/diagrama a la izquierda */}
          {diagram && (
            <div
              className={`flex justify-center transition-all duration-1000 ${
                isInView ? 'translate-x-0 opacity-100' : '-translate-x-16 opacity-0'
              }`}
            >
              <div className="group relative">
                <img
                  src={diagram.mediaUrl}
                  alt=""
                  className="w-full max-w-lg rounded-2xl shadow-lg ring-1 ring-slate-200"
                />
              </div>
            </div>
          )}

          {/* Columna de texto a la derecha */}
          <div
            className={`space-y-6 transition-all duration-1000 delay-200 ${
              isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            {heading && (
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {heading.body}
              </h2>
            )}

            {/* Bullet list — puntos teal-800, texto negro */}
            {bullets.length > 0 && (
              <ul className="space-y-4 pt-2">
                {bullets.map((b, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-3 transition-all duration-700 ${
                      isInView ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                    }`}
                    style={{ transitionDelay: `${400 + i * 100}ms` }}
                  >
                    {icons[i] ? (
                      <img src={icons[i].mediaUrl} alt="" className="mt-0.5 h-5 w-5 flex-shrink-0" />
                    ) : (
                      <span className="mt-1.5 flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-teal-800 shadow-sm shadow-teal-800/30" />
                    )}
                    <span className="text-slate-900">{b.body}</span>
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
