import type { Section } from '../../models'
import { textByRole, textsByRole, mediasByRole } from './sectionHelpers'

interface Props { section: Section }

/**
 * Sección "Nosotros" — heading, bio cards con fotos, párrafos generales.
 * Roles: heading, paragraph, bio | photo, logo
 */
export default function AboutSection({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')
  const paragraphs = textsByRole(section.texts, 'paragraph')
  const bios = textsByRole(section.texts, 'bio')
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

        {/* Bio cards — empareja fotos por orden con textos bio */}
        {bios.length > 0 && (
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {bios.map((bio, i) => {
              const photo = photos[i]
              return (
                <div key={i} className="group text-center">
                  {photo && (
                    <div className="mx-auto mb-4 h-40 w-40 overflow-hidden rounded-full bg-slate-100 shadow-md transition-transform group-hover:scale-105">
                      <img
                        src={photo.mediaUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  {bio.title && (
                    <h3 className="text-lg font-semibold text-slate-900">{bio.title}</h3>
                  )}
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{bio.body}</p>
                </div>
              )
            })}
          </div>
        )}

        {/* Logos de clientes / partners */}
        {logos.length > 0 && (
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale">
            {logos.map((logo, i) => (
              <img
                key={i}
                src={logo.mediaUrl}
                alt=""
                className="h-10 w-auto object-contain"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
