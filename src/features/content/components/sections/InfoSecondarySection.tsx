import type { Section } from '../../models'
import { textByRole, textsByRole, mediasByRole } from './sectionHelpers'

interface Props { section: Section }

/**
 * Sección informativa secundaria — fondo claro, fotos + quotes + logos.
 * Roles: heading, paragraph, quote | photo, logo
 */
export default function InfoSecondarySection({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')
  const paragraphs = textsByRole(section.texts, 'paragraph')
  const quotes = textsByRole(section.texts, 'quote')
  const photos = mediasByRole(section.media, 'photo')
  const logos = mediasByRole(section.media, 'logo')

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        {heading && (
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {heading.body}
          </h2>
        )}

        {paragraphs.length > 0 && (
          <div className="mx-auto mt-6 max-w-3xl space-y-4 text-center">
            {paragraphs.map((p, i) => (
              <p key={i} className="leading-relaxed text-slate-600">{p.body}</p>
            ))}
          </div>
        )}

        {/* Photos row */}
        {photos.length > 0 && (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo, i) => (
              <div key={i} className="overflow-hidden rounded-xl bg-slate-100 shadow-sm">
                <img
                  src={photo.mediaUrl}
                  alt=""
                  className="aspect-[4/3] w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}

        {/* Testimonials / quotes */}
        {quotes.length > 0 && (
          <div className="mt-16 grid gap-8 md:grid-cols-2">
            {quotes.map((q, i) => (
              <div key={i} className="rounded-xl bg-slate-50 p-6">
                <svg className="mb-3 h-8 w-8 text-teal-600/40" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                </svg>
                <p className="text-slate-700 italic leading-relaxed">"{q.body}"</p>
                {q.title && (
                  <p className="mt-4 text-sm font-semibold text-slate-900">— {q.title}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Logos row */}
        {logos.length > 0 && (
          <div className="mt-12 flex flex-wrap items-center justify-center gap-10 opacity-50 grayscale">
            {logos.map((logo, i) => (
              <img key={i} src={logo.mediaUrl} alt="" className="h-8 w-auto object-contain" />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
