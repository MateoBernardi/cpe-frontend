import type { Section } from '../../models'
import { textByRole, mediaByRole } from './sectionHelpers'

interface Props { section: Section }

/**
 * Hero principal — gradiente teal/dark-blue full-width.
 * Roles: heading, subheading | background
 */
export default function HeroSection({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')
  const subheading = textByRole(section.texts, 'subheading')
  const bg = mediaByRole(section.media, 'background')

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900">
      {/* Background image overlay */}
      {bg && (
        <img
          src={bg.mediaUrl}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20"
        />
      )}

      <div className="mx-auto max-w-7xl px-6 py-28 sm:py-36 lg:py-44">
        <div className="max-w-2xl">
          {heading && (
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {heading.body}
            </h1>
          )}
          {subheading && (
            <p className="mt-6 text-lg leading-relaxed text-teal-100 sm:text-xl">
              {subheading.body}
            </p>
          )}
          <div className="mt-10 flex gap-4">
            <a
              href="#contact_form"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-teal-800 shadow-sm transition hover:bg-teal-50"
            >
              Contáctanos
            </a>
            <a
              href="#about"
              className="rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Conocé más
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
