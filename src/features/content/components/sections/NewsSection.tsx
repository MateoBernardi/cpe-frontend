import type { Section } from '../../models'
import { textByRole, textsByRole, mediasByRole } from './sectionHelpers'
import { useInView } from '@shared/hooks'
import { colors, fonts, layout } from '../../../../theme'

interface Props { section: Section }

function EmptyNewsPlaceholder() {
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: colors.lightGray, fontFamily: fonts.primary }}
    >
      {/* Illustrated icon */}
      <div className="relative mb-10 h-48 w-48 select-none" aria-hidden="true">
        {/* Outer pulsing ring */}
        <div
          className="absolute inset-0 animate-ping rounded-full opacity-10"
          style={{ backgroundColor: colors.tealBright }}
        />
        {/* Circle background */}
        <div
          className="absolute inset-0 rounded-full opacity-10"
          style={{ backgroundColor: colors.tealMid }}
        />
        {/* Inner circle */}
        <div
          className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-lg"
          style={{ backgroundColor: colors.white }}
        >
          {/* Newspaper icon */}
          <svg
            className="h-16 w-16"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Newspaper body */}
            <g style={{ color: colors.tealMid }}>
              {/* Main page */}
              <rect
                x="10" y="8" width="34" height="44" rx="3"
                stroke="currentColor"
                strokeWidth="2.5"
              />
              {/* Fold / second sheet */}
              <path
                d="M44 18h6a3 3 0 013 3v28a3 3 0 01-3 3H16"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Headline lines */}
              <line x1="17" y1="16" x2="37" y2="16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="17" y1="22" x2="30" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </g>
            {/* Image placeholder box */}
            <g style={{ color: colors.tealBright }}>
              <rect x="17" y="28" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="2" />
            </g>
            {/* Text lines */}
            <g style={{ color: colors.blueDark }}>
              <line x1="33" y1="29" x2="37" y2="29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
              <line x1="33" y1="34" x2="37" y2="34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
              <line x1="17" y1="43" x2="37" y2="43" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
            </g>
          </svg>
        </div>
        {/* Floating decorative dots */}
        <span
          className="absolute left-2 top-6 h-3 w-3 rounded-full opacity-40"
          style={{ backgroundColor: colors.tealBright }}
        />
        <span
          className="absolute bottom-8 right-0 h-2 w-2 rounded-full opacity-30"
          style={{ backgroundColor: colors.blueMid }}
        />
        <span
          className="absolute right-4 top-2 h-2 w-2 rounded-full opacity-25"
          style={{ backgroundColor: colors.tealDeep }}
        />
      </div>

      {/* Heading */}
      <h2
        className="mb-3 text-3xl font-bold sm:text-4xl"
        style={{ color: colors.blueDark }}
      >
        Estamos preparando novedades
      </h2>
      <p
        className="mb-2 max-w-md text-base leading-relaxed sm:text-lg"
        style={{ color: colors.tealDeep, opacity: 0.85 }}
      >
        Nuestro equipo está trabajando en contenido nuevo para compartir con vos.
      </p>
      <p
        className="max-w-sm text-sm leading-relaxed sm:text-base"
        style={{ color: colors.blueMid, opacity: 0.7 }}
      >
        ¡Volvé pronto para enterarte de las últimas noticias!
      </p>
    </div>
  )
}

export default function NewsSection({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')
  const paragraphs = textsByRole(section.texts, 'paragraph')
  const thumbnailsByRole = mediasByRole(section.media, 'thumbnail')
  const thumbnails = thumbnailsByRole.length > 0 ? thumbnailsByRole : section.media
  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.1 })

  const hasContent = paragraphs.length > 0 || thumbnails.length > 0

  if (!hasContent) return <EmptyNewsPlaceholder />

  return (
    <section ref={ref} className={layout.sectionPadY} style={{ backgroundColor: colors.lightGray }}>
      <div className={layout.containerNarrow}>
        {/* Heading */}
        {heading && (
          <h2
            className={`mb-[4vh] text-center text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl transition-all duration-700 font-primary ${
              isInView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ color: colors.blueDark }}
          >
            {heading.body}
          </h2>
        )}

        {/* News items — vertical list with dividers */}
        <div className="space-y-0">
          {paragraphs.map((p, i) => {
            const thumb = thumbnails[i]
            const imgUrl = thumb?.url
            return (
              <div key={i}>
                {/* Divider (not before first item) */}
                {i > 0 && (
                  <div
                    className="my-[4vh] h-px"
                    style={{ backgroundColor: `${colors.blueMid}25` }}
                  />
                )}

                <article
                  className={`transition-all duration-700 ${
                    isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                  style={{ transitionDelay: `${200 + i * 120}ms` }}
                >
                  {/* Image */}
                  {imgUrl && (
                    <div className="mb-[3vh] overflow-hidden rounded-2xl">
                      <img
                        src={imgUrl}
                        alt=""
                        className="aspect-[16/9] w-full object-cover"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    </div>
                  )}

                  {/* Body */}
                  <p
                    className="mt-[1.5vh] text-sm leading-relaxed sm:text-base whitespace-pre-line"
                    style={{ color: colors.blueMid }}
                  >
                    {p.body}
                  </p>
                </article>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
