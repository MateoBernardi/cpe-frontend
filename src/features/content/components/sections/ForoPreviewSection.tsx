import { Link } from 'react-router-dom'
import { usePublicationTypes, useFeedsByType, resolveKnownSlug } from '@features/foro'
import type { PublicationPreview } from '@features/foro'
import { INTERACCIONES_SECTIONS, typeAccent, formatForoDate, heroCtaVerb, TypePill, ChevronRight } from '@features/content/components/foro'
import type { InteraccionSection } from '@features/content/components/foro'
import { colors } from '../../../../theme'

interface FormatCard {
  section: InteraccionSection
  item: PublicationPreview
}

/** Generic cover-image placeholder for a featured item without `imageUrl`. */
function ImagePlaceholderIcon({ accent }: { accent: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center" style={{ color: `${accent}55` }}>
      <svg viewBox="0 0 24 24" width={32} height={32} fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8.5" cy="9.5" r="1.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m4 17 5-5 3 3 4-4 4 4" />
      </svg>
    </div>
  )
}

/**
 * "Desde el foro" home teaser: one card per publication format (papers /
 * CPEVoz / novedades / discusiones), each showing that format's newest item.
 *
 * The format list — labels, routes and slugs — comes from the shared
 * `INTERACCIONES_SECTIONS` (single source of truth also used by the Foro
 * nav), so this never re-declares the four formats. Type ids are resolved
 * at runtime by matching each section's slug against `GET /publication-types`
 * results — never hardcoded. Renders nothing when every feed is empty, so
 * the home page degrades gracefully if the Foro backend is unreachable.
 */
export default function ForoPreviewSection() {
  const { data: types } = usePublicationTypes()

  const typeIdBySlug = new Map(
    (types ?? [])
      .map((type) => [resolveKnownSlug(type), type.id] as const)
      .filter((entry): entry is [InteraccionSection['slug'], number] => entry[0] !== null),
  )

  const typeIds = INTERACCIONES_SECTIONS
    .map((section) => typeIdBySlug.get(section.slug))
    .filter((id): id is number => typeof id === 'number')

  // Only the single newest item per format is shown, so a 1-item page is enough.
  const feeds = useFeedsByType(typeIds, 1)

  const cards: FormatCard[] = INTERACCIONES_SECTIONS.flatMap((section) => {
    const typeId = typeIdBySlug.get(section.slug)
    const item = feeds.find((feed) => feed.typeId === typeId)?.items[0]
    return item ? [{ section, item }] : []
  })

  if (cards.length === 0) {
    return null
  }

  return (
    <section className="bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <span className="mb-6 block text-xs font-bold uppercase tracking-wider" style={{ color: colors.tealDeep }}>
          Desde el foro
        </span>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ section, item }) => {
            const accent = typeAccent(section.slug)
            return (
              <div key={section.slug} className="flex flex-col gap-3">
                {/* Format link — the shared `<TypePill>` pill, same as every
                    other place a format is identified, so the home preview
                    can't drift from the pages' pill styling. */}
                <Link
                  to={`/interacciones/${section.path}`}
                  className="group inline-flex w-fit items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <TypePill slug={section.slug} label={section.label} />
                  <ChevronRight size={16} className="text-gray-400 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                {/* Item link — house card idiom (see ServicesAccessSection): white
                    surface, rounded-xl, soft shadow, transform/shadow-only hover
                    so the grid never reflows. */}
                <Link
                  to={`/publicaciones/${item.id}`}
                  className="group flex flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-lg transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-xl focus-visible:-translate-y-1 focus-visible:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  <div className="aspect-video w-full overflow-hidden bg-gray-100">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <ImagePlaceholderIcon accent={accent} />
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <h3 className="line-clamp-2 text-lg font-semibold leading-snug" style={{ color: colors.blueDark }}>
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p className="line-clamp-2 text-sm leading-relaxed text-gray-500">{item.subtitle}</p>
                    )}
                    <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-sm">
                      <span className="text-gray-400">{formatForoDate(item.createdAt)}</span>
                      <span className="inline-flex items-center gap-1 font-semibold" style={{ color: accent }}>
                        {heroCtaVerb(section.slug)}
                        <ChevronRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
