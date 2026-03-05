import type { Section } from '../../models'
import { textByRole, textsByRole, mediasByRole } from './sectionHelpers'
import { useInView } from '@shared/hooks'
import { colors, layout } from '../../../../theme'

interface Props { section: Section }

export default function NewsSection({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')
  const paragraphs = textsByRole(section.texts, 'paragraph')
  const thumbnailsByRole = mediasByRole(section.media, 'thumbnail')
  const thumbnails = thumbnailsByRole.length > 0 ? thumbnailsByRole : section.media
  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.1 })

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
