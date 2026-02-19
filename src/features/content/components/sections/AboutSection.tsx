import type { Section } from '../../models'
import { textByRole, textsByRole, mediasByRole } from './sectionHelpers'
import { useInView } from '@shared/hooks'

interface Props { section: Section }

/**
 * Sección "Nosotros" — 100vh, layout texto|imagen|texto|imagen.
 * Imágenes entran desde los costados, textos suben desde abajo con scroll.
 * Roles: heading, paragraph | photo
 */
export default function AboutSection({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')
  const paragraphs = textsByRole(section.texts, 'paragraph')
  const photos = mediasByRole(section.media, 'photo')

  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.15 })

  // Emparejar: texto[0], foto[0], texto[1], foto[1]
  const text0 = paragraphs[0]
  const text1 = paragraphs[1]
  const photo0 = photos[0]
  const photo1 = photos[1]

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center bg-teal-700 py-20"
    >
      <div className="mx-auto w-full max-w-7xl px-6">
        {/* Heading */}
        {heading && (
          <h2
            className={`mb-16 text-center text-3xl font-bold tracking-tight text-white sm:text-4xl transition-all duration-700 ${
              isInView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
          >
            {heading.body}
          </h2>
        )}

        {/* Grid: text | image | text | image */}
        <div className="grid grid-cols-1 items-center gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Texto 0 — sube desde abajo */}
          <div
            className={`transition-all duration-1000 delay-200 ${
              isInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}
          >
            {text0 && (
              <div className="space-y-2">
                {text0.title && (
                  <h3 className="text-lg font-semibold text-teal-400">{text0.title}</h3>
                )}
                <p className="text-sm leading-relaxed text-slate-300">{text0.body}</p>
              </div>
            )}
          </div>

          {/* Foto 0 — entra desde la izquierda */}
          <div
            className={`transition-all duration-1000 delay-300 ${
              isInView ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'
            }`}
          >
            {photo0 && (
              <div className="overflow-hidden rounded-2xl shadow-xl shadow-teal-900/20">
                <img
                  src={photo0.mediaUrl}
                  alt=""
                  className="aspect-[3/4] w-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
          </div>

          {/* Texto 1 — sube desde abajo */}
          <div
            className={`transition-all duration-1000 delay-500 ${
              isInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}
          >
            {text1 && (
              <div className="space-y-2">
                {text1.title && (
                  <h3 className="text-lg font-semibold text-teal-400">{text1.title}</h3>
                )}
                <p className="text-sm leading-relaxed text-slate-300">{text1.body}</p>
              </div>
            )}
          </div>

          {/* Foto 1 — entra desde la derecha */}
          <div
            className={`transition-all duration-1000 delay-300 ${
              isInView ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'
            }`}
          >
            {photo1 && (
              <div className="overflow-hidden rounded-2xl shadow-xl shadow-teal-900/20">
                <img
                  src={photo1.mediaUrl}
                  alt=""
                  className="aspect-[3/4] w-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
