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
      className="flex min-h-screen items-center bg-gray-50 py-12 sm:py-16 md:py-20"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10">
        {heading && (
          <h2
            className={`mb-8 sm:mb-12 md:mb-16 lg:mb-20 text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl lg:text-5xl transition-all duration-700 ${
              isInView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
          >
            {heading.body}
          </h2>
        )}

        {/* ── Mobile & Tablet: horizontal cards (< lg) ── */}
        <div className="flex flex-col gap-8 sm:gap-10 lg:hidden">
          {/* Persona 0 */}
          <div
            className={`flex flex-row items-center gap-4 sm:gap-6 transition-all duration-1000 delay-200 ${
              isInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}
          >
            {photo0 && (
              <div className="group relative w-32 flex-shrink-0 sm:w-44 md:w-52">
                <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-200">
                  <img
                    src={photo0.url}
                    alt=""
                    className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </div>
            )}
            <div className="min-w-0 flex-1">
              {bio0 && (
                <h3 className="mb-2 text-base font-semibold text-slate-900 sm:text-lg">{bio0.body}</h3>
              )}
              {text0 && (
                <div
                  className="rounded-xl border border-slate-200 p-3 shadow-sm sm:p-4"
                  style={{
                    backgroundImage: 'radial-gradient(circle, rgb(13 148 136 / 0.25) 1px, transparent 1px)',
                    backgroundSize: '12px 12px',
                    backgroundColor: '#f8faf9',
                  }}
                >
                  <p className="text-xs font-medium leading-relaxed text-slate-900 sm:text-sm">{text0.body}</p>
                </div>
              )}
            </div>
          </div>

          {/* Persona 1 — foto a la derecha */}
          <div
            className={`flex flex-row-reverse items-center gap-4 sm:gap-6 transition-all duration-1000 delay-400 ${
              isInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}
          >
            {photo1 && (
              <div className="group relative w-32 flex-shrink-0 sm:w-44 md:w-52">
                <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-200">
                  <img
                    src={photo1.url}
                    alt=""
                    className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </div>
            )}
            <div className="min-w-0 flex-1">
              {bio1 && (
                <h3 className="mb-2 text-base font-semibold text-slate-900 sm:text-lg">{bio1.body}</h3>
              )}
              {text1 && (
                <div
                  className="rounded-xl border border-slate-200 p-3 shadow-sm sm:p-4"
                  style={{
                    backgroundImage: 'radial-gradient(circle, rgb(13 148 136 / 0.25) 1px, transparent 1px)',
                    backgroundSize: '12px 12px',
                    backgroundColor: '#f8faf9',
                  }}
                >
                  <p className="text-xs font-medium leading-relaxed text-slate-900 sm:text-sm">{text1.body}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Desktop: 4-column grid (lg+) ── */}
        <div className="hidden lg:grid lg:grid-cols-4 lg:items-center lg:gap-8 xl:gap-12 2xl:gap-16">
          {/* Texto 0 — bio arriba, párrafo con fondo punteado */}
          <div
            className={`transition-all duration-1000 delay-200 ${
              isInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}
          >
            {bio0 && (
              <h3 className="mb-3 text-lg font-semibold text-slate-900 xl:text-xl">{bio0.body}</h3>
            )}
            {text0 && (
              <div
                className="rounded-xl border border-slate-200 p-5 shadow-sm xl:p-6"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgb(13 148 136 / 0.25) 1px, transparent 1px)',
                  backgroundSize: '12px 12px',
                  backgroundColor: '#f8faf9',
                }}
              >
                <p className="text-sm font-medium leading-relaxed text-slate-900 xl:text-base">{text0.body}</p>
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
                    src={photo0.url}
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
              <h3 className="mb-3 text-lg font-semibold text-slate-900 xl:text-xl">{bio1.body}</h3>
            )}
            {text1 && (
              <div
                className="rounded-xl border border-slate-200 p-5 shadow-sm xl:p-6"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgb(13 148 136 / 0.25) 1px, transparent 1px)',
                  backgroundSize: '12px 12px',
                  backgroundColor: '#f8faf9',
                }}
              >
                <p className="text-sm font-medium leading-relaxed text-slate-900 xl:text-base">{text1.body}</p>
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
                    src={photo1.url}
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
