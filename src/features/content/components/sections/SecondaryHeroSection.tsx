import type { Section } from '../../models'
import { textByRole, textsByRole, mediaByRole } from './sectionHelpers'
import { useInView } from '@shared/hooks'

interface Props { section: Section }

/**
 * Hero secundario publicitario — texto a la izquierda, imagen a la derecha, animación.
 * Roles: heading, subtitle, paragraph | portrait, background
 */
export default function SecondaryHeroSection({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')
  const subtitle = textByRole(section.texts, 'subtitle')
  const paragraphs = textsByRole(section.texts, 'paragraph')
  const portrait = mediaByRole(section.media, 'portrait')
  const bg = mediaByRole(section.media, 'background')

  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.15 })

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950 py-24"
    >
      {bg && (
        <img
          src={bg.mediaUrl}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-10"
        />
      )}

      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-center">
        {/* Texto (izquierda) — sube con delay */}
        <div
          className={`space-y-6 transition-all duration-1000 ${
            isInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
          }`}
        >
          {heading && (
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {heading.body}
            </h2>
          )}
          {subtitle && (
            <p className="text-lg font-medium text-teal-400">{subtitle.body}</p>
          )}
          {paragraphs.map((p, i) => (
            <p key={i} className="leading-relaxed text-slate-300">{p.body}</p>
          ))}
          <a
            href="/contact"
            className="mt-4 inline-block rounded-xl bg-teal-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-600/30 transition-all hover:bg-teal-500 hover:shadow-teal-500/40"
          >
            Solicitar presupuesto
          </a>
        </div>

        {/* Imagen (derecha) — entra desde la derecha */}
        {portrait && (
          <div
            className={`flex justify-center lg:justify-end transition-all duration-1000 delay-300 ${
              isInView ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'
            }`}
          >
            <div className="relative">
              <div className="absolute -inset-6 rounded-3xl bg-teal-500/10 blur-3xl" />
              <img
                src={portrait.mediaUrl}
                alt={portrait.role ?? ''}
                className="relative w-full max-w-md rounded-2xl object-cover shadow-2xl"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
