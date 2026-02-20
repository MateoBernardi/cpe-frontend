import type { Section } from '../../models'
import { textByRole, textsByRole, mediasByRole } from './sectionHelpers'
import { useInView } from '@shared/hooks'

interface Props { section: Section }

export default function AboutSection({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')
  const paragraphs = textsByRole(section.texts, 'paragraph')
  const bios = textsByRole(section.texts, 'bio')
  const photos = mediasByRole(section.media, 'photo')

  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.15 })

  const text0 = paragraphs[0]
  const text1 = paragraphs[1]
  const bio0 = bios[0]
  const bio1 = bios[1]
  const photo0 = photos[0]
  const photo1 = photos[1]

  return (
    <section
      ref={ref}
      className="flex min-h-screen items-center bg-gray-50 py-20"
    >
      <div className="mx-auto w-full max-w-7xl px-6">
        {heading && (
          <h2
            className={`mb-16 text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl transition-all duration-700 ${
              isInView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
          >
            {heading.body}
          </h2>
        )}

        <div className="grid grid-cols-1 items-center gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Texto 0 — bio arriba, párrafo con fondo punteado */}
          <div
            className={`transition-all duration-1000 delay-200 ${
              isInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}
          >
            {bio0 && (
              <h3 className="mb-3 text-lg font-semibold text-slate-900">{bio0.body}</h3>
            )}
            {text0 && (
              <div
                className="rounded-xl border border-slate-200 p-5 shadow-sm"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgb(13 148 136 / 0.25) 1px, transparent 1px)',
                  backgroundSize: '12px 12px',
                  backgroundColor: '#f8faf9',
                }}
              >
                <p className="text-sm font-medium leading-relaxed text-slate-900">{text0.body}</p>
              </div>
            )}
          </div>

          {/* Foto 0 */}
          <div
            className={`transition-all duration-1000 delay-300 ${
              isInView ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'
            }`}
          >
            {photo0 && (
              <div className="group relative">
                <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-200">
                  <img
                    src={photo0.mediaUrl}
                    alt=""
                    className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Texto 1 — bio arriba, párrafo con fondo punteado */}
          <div
            className={`transition-all duration-1000 delay-500 ${
              isInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}
          >
            {bio1 && (
              <h3 className="mb-3 text-lg font-semibold text-slate-900">{bio1.body}</h3>
            )}
            {text1 && (
              <div
                className="rounded-xl border border-slate-200 p-5 shadow-sm"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgb(13 148 136 / 0.25) 1px, transparent 1px)',
                  backgroundSize: '12px 12px',
                  backgroundColor: '#f8faf9',
                }}
              >
                <p className="text-sm font-medium leading-relaxed text-slate-900">{text1.body}</p>
              </div>
            )}
          </div>

          {/* Foto 1 */}
          <div
            className={`transition-all duration-1000 delay-300 ${
              isInView ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'
            }`}
          >
            {photo1 && (
              <div className="group relative">
                <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-200">
                  <img
                    src={photo1.mediaUrl}
                    alt=""
                    className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
