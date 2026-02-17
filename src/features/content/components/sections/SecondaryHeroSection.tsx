import type { Section } from '../../models'
import { textByRole, textsByRole, mediaByRole } from './sectionHelpers'

interface Props { section: Section }

/**
 * Hero secundario — layout dividido con retrato y texto.
 * Roles: heading, subtitle, paragraph | portrait, background
 */
export default function SecondaryHeroSection({ section }: Props) {
  const heading = textByRole(section.texts, 'heading')
  const subtitle = textByRole(section.texts, 'subtitle')
  const paragraphs = textsByRole(section.texts, 'paragraph')
  const portrait = mediaByRole(section.media, 'portrait')
  const bg = mediaByRole(section.media, 'background')

  return (
    <section className="relative overflow-hidden bg-slate-50">
      {bg && (
        <img
          src={bg.mediaUrl}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-5"
        />
      )}

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
        {/* Text side */}
        <div className="space-y-6">
          {heading && (
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {heading.body}
            </h2>
          )}
          {subtitle && (
            <p className="text-lg font-medium text-teal-700">{subtitle.body}</p>
          )}
          {paragraphs.map((p, i) => (
            <p key={i} className="leading-relaxed text-slate-600">{p.body}</p>
          ))}
        </div>

        {/* Portrait side */}
        {portrait && (
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute -inset-4 rounded-2xl bg-teal-600/10 blur-2xl" />
              <img
                src={portrait.mediaUrl}
                alt={portrait.role ?? ''}
                className="relative w-full max-w-md rounded-2xl object-cover shadow-xl"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
