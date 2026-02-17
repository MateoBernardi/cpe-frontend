import type { Section } from '../../models'
import { textByRole, textsByRole, mediasByRole, mediaByRole } from './sectionHelpers'

interface Props { section: Section }

/**
 * Sección de noticias / novedades — cards en grid.
 * Roles: heading, paragraph, quote | thumbnail, illustration
 */
export default function NewsSection({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')
  const paragraphs = textsByRole(section.texts, 'paragraph')
  const quotes = textsByRole(section.texts, 'quote')
  const thumbnails = mediasByRole(section.media, 'thumbnail')
  const illustration = mediaByRole(section.media, 'illustration')

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        {heading && (
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {heading.body}
          </h2>
        )}

        {/* Cards grid: empareja thumbnail[i] con paragraph[i] */}
        {paragraphs.length > 0 && (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {paragraphs.map((p, i) => {
              const thumb = thumbnails[i]
              return (
                <article key={i} className="overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md">
                  {thumb && (
                    <div className="aspect-video overflow-hidden bg-slate-100">
                      <img
                        src={thumb.mediaUrl}
                        alt=""
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    {p.title && (
                      <h3 className="mb-2 font-semibold text-slate-900">{p.title}</h3>
                    )}
                    <p className="text-sm leading-relaxed text-slate-600">{p.body}</p>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {/* Illustration lateral + quote */}
        {(quotes.length > 0 || illustration) && (
          <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:items-center">
            {illustration && (
              <img
                src={illustration.mediaUrl}
                alt=""
                className="w-full rounded-xl object-cover shadow-md"
              />
            )}
            <div className="space-y-6">
              {quotes.map((q, i) => (
                <blockquote key={i} className="border-l-4 border-teal-600 pl-4 text-slate-700 italic">
                  <p>"{q.body}"</p>
                  {q.title && (
                    <cite className="mt-2 block text-sm font-medium text-slate-500 not-italic">
                      — {q.title}
                    </cite>
                  )}
                </blockquote>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
