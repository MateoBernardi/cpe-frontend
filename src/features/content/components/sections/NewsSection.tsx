import { useRef } from 'react'
import type { Section } from '../../models'
import { textByRole, textsByRole, mediasByRole } from './sectionHelpers'
import { useInView } from '@shared/hooks'

interface Props { section: Section }

/**
 * Sección Novedades — carrusel horizontal de cards flotantes.
 * Cada card muestra imagen + título + texto completo.
 * Roles: heading, paragraph | thumbnail
 */
export default function NewsSection({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')
  const paragraphs = textsByRole(section.texts, 'paragraph')
  const thumbnailsByRole = mediasByRole(section.media, 'thumbnail')
  // Fallback: if no media has 'thumbnail' role, use all media in order
  const thumbnails = thumbnailsByRole.length > 0 ? thumbnailsByRole : section.media
  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.1 })
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.7
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <section ref={ref} className="bg-teal-50 py-12 sm:py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section heading + nav arrows */}
        <div className="mb-6 sm:mb-8 md:mb-10 flex items-end justify-between">
          {heading && (
            <h2
              className={`text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl transition-all duration-700 ${
                isInView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
            >
              {heading.body}
            </h2>
          )}

          {paragraphs.length > 1 && (
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => scroll('left')}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-slate-200 text-slate-500 transition-colors hover:bg-teal-50 hover:text-teal-700"
                aria-label="Anterior"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-slate-200 text-slate-500 transition-colors hover:bg-teal-50 hover:text-teal-700"
                aria-label="Siguiente"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Horizontal scrollable cards */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {paragraphs.map((p, i) => {
            const thumb = thumbnails[i]
            const imgUrl = thumb?.url
            return (
              <article
                key={i}
                className={`group flex-shrink-0 w-[85vw] sm:w-[340px] md:w-[380px] lg:w-[420px] snap-center overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200/60 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${
                  isInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                }`}
                style={{ transitionDelay: `${200 + i * 100}ms` }}
              >
                {/* Image */}
                {imgUrl && (
                  <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                    <img
                      src={imgUrl}
                      alt={p.title ?? ''}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                )}
                {/* Content */}
                <div className="p-4 sm:p-5 md:p-6">
                  {p.title && (
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {p.title}
                    </h3>
                  )}
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                    {p.body}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
