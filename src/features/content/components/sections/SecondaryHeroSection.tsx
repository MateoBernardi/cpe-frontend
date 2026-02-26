import type { Section } from '../../models'
import { textByRole, mediasByRole } from './sectionHelpers'
import { useInView } from '@shared/hooks'

interface Props { section: Section }

export default function SecondaryHeroSection({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')
  const subtitle = textByRole(section.texts, 'subtitle')
  const ctaTitle = textByRole(section.texts, 'cta')
  const photos = mediasByRole(section.media, 'photo')

  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.1 })

  const mainPhoto = photos[0]

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center bg-slate-50"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        {/* Header text — centered */}
        <div
          className={`mx-auto max-w-3xl text-center transition-all duration-1000 ${
            isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          {heading && (
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl lg:text-5xl">
              {heading.body}
            </h2>
          )}
          {subtitle && (
            <p className="mt-4 text-lg font-medium text-teal-600">{subtitle.body}</p>
          )}
        </div>

        {/* Floating image */}
        {mainPhoto && (
          <div
            className={`mt-14 flex justify-center transition-all duration-1000 delay-300 ${
              isInView ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
            }`}
          >
            <div className="group relative w-full max-w-3xl">
              <div className="overflow-hidden rounded-2xl shadow-2xl shadow-slate-300/50 ring-1 ring-slate-200">
                <img
                  src={mainPhoto.url}
                  alt=""
                  className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        )}

        {/* CTA text (without hardcoded button) */}
        {ctaTitle && (
          <div
            className={`mt-14 mx-auto max-w-2xl transition-all duration-700 ${
              isInView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
          >
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-blue-50 px-5 py-5 sm:px-8 sm:py-6 md:px-10 md:py-8 shadow-xl ring-1 ring-blue-100 mx-0 sm:mx-4 md:mx-6">
              <p className="text-center text-base font-semibold text-slate-800">{ctaTitle.body}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
