import type { Section } from '../../models'
import { textByRole, mediasByRole } from './sectionHelpers'
import { useInView } from '@shared/hooks'
import { colors, layout } from '../../../../theme'

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
      className={`relative flex min-h-screen items-center`}
      style={{ backgroundColor: colors.secondaryHeroBg, color: colors.secondaryHeroText }}
    >
      <div className={`w-full ${layout.container} ${layout.sectionPadY}`}>
        {/* Header text */}
        <div
          className={`mx-auto max-w-3xl text-center transition-all duration-1000 ${
            isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          {heading && (
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl font-secondary">
              {heading.body}
            </h2>
          )}
          {subtitle && (
            <p className="mt-[2vh] font-mono text-sm uppercase tracking-[0.18em]" style={{ color: colors.tealBright }}>{subtitle.body}</p>
          )}
        </div>

        {/* Floating image */}
        {mainPhoto && (
          <div
            className={`mt-[6vh] flex justify-center transition-all duration-1000 delay-300 ${
              isInView ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
            }`}
          >
            <div className="group relative w-full max-w-3xl">
              <div className="overflow-hidden rounded-2xl">
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

        {/* CTA */}
        {ctaTitle && (
          <div
            className={`mt-[6vh] mx-auto max-w-2xl transition-all duration-700 delay-500 ${
              isInView ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-95'
            }`}
          >
            <a
              href="/contact"
              className="group relative block overflow-hidden rounded-2xl px-5 py-6 sm:px-10 sm:py-8 md:px-12 md:py-10 text-center transition-all duration-500 hover:scale-[1.02]"
              style={{ backgroundColor: colors.tealMid, boxShadow: `0 8px 32px ${colors.tealDeep}80` }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.tealBright }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.tealMid }}
            >
              {/* Animated shine overlay */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <p className="relative text-lg font-bold text-white sm:text-xl md:text-2xl tracking-tight font-secondary">
                {ctaTitle.body}
              </p>
              <span className="relative mt-2 inline-flex items-center gap-2 text-sm font-medium text-white/80">
                Contactanos ahora
              </span>
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
