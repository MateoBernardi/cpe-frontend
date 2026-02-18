import { useRef } from 'react'
import type { Section } from '../../models'
import { textByRole, textsByRole, mediasByRole } from './sectionHelpers'

interface Props { section: Section }

/**
 * Sección Novedades — carrusel horizontal tipo Instagram.
 * Cada card: thumbnail + paragraph (título + body).
 * Roles: heading, paragraph | thumbnail
 */
export default function NewsSection({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')
  const paragraphs = textsByRole(section.texts, 'paragraph')
  const thumbnails = mediasByRole(section.media, 'thumbnail')
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.8
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }

  return (
    <section className="bg-slate-950 py-24 text-white">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header con flechas */}
        <div className="mb-10 flex items-center justify-between">
          {heading && (
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {heading.body}
            </h2>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Anterior"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Siguiente"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Carrusel horizontal */}
        <div
          ref={scrollRef}
          className="snap-carousel flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none' }}
        >
          {paragraphs.map((p, i) => {
            const thumb = thumbnails[i]
            return (
              <article
                key={i}
                className="group flex-shrink-0 w-[300px] sm:w-[340px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
              >
                {/* Imagen tipo Instagram */}
                {thumb && (
                  <div className="aspect-square overflow-hidden bg-slate-800">
                    <img
                      src={thumb.mediaUrl}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}
                {/* Texto */}
                <div className="p-5 space-y-2">
                  {p.title && (
                    <h3 className="font-semibold text-white">{p.title}</h3>
                  )}
                  <p className="text-sm leading-relaxed text-slate-400 line-clamp-3">{p.body}</p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
