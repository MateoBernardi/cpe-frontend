import type { KnownPublicationTypeSlug, Publication } from '@features/foro'
import { SaveButton } from './SaveButton'
import { FavoriteButton } from './FavoriteButton'
import { TypePill } from './TypePill'
import { CalendarIcon, ClockIcon } from './ForoIcons'
import { typeAccent, bylineFor, heroMetaValue, formatForoDate, hexToRgba } from './foroHelpers'
import { colors, layout } from '../../../../theme'

interface ArticleHeroProps {
  publication: Publication
  slug: KnownPublicationTypeSlug | null
  typeName: string
}

/**
 * Full-bleed dark hero for the publication detail screen: cover image (or an
 * accent-tinted gradient fallback for discusiones, which have none) behind a
 * dark gradient overlay tinted with the format's accent color, with the
 * title/meta/actions left-aligned on top. Renders edge-to-edge — must not be
 * nested inside a `layout.container`.
 */
export function ArticleHero({ publication, slug, typeName }: ArticleHeroProps) {
  const accent = typeAccent(slug)
  const byline = bylineFor(publication.authorName)
  const metaValue = heroMetaValue(slug, publication)
  const isReal = publication.id > 0

  const overlay = publication.imageUrl
    ? `linear-gradient(to top, rgba(6,10,14,0.92), rgba(6,10,14,0.55) 55%, ${hexToRgba(accent, 0.35)} 100%)`
    : `linear-gradient(135deg, ${colors.blueDark}, ${accent})`

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundColor: colors.blueDark }}>
        {publication.imageUrl && (
          <img src={publication.imageUrl} alt="" className="h-full w-full object-cover" aria-hidden="true" />
        )}
        <div className="absolute inset-0" style={{ backgroundImage: overlay }} aria-hidden="true" />
      </div>

      <div className={`relative ${layout.container} pb-10 pt-32 sm:pb-12 sm:pt-36 lg:pb-14 lg:pt-40`}>
        <div className="mb-5">
          <TypePill slug={slug} label={typeName} variant="glass" />
        </div>

        <h1 className="max-w-3xl font-primary text-4xl font-bold leading-tight text-white sm:text-5xl">
          {publication.title}
        </h1>

        {publication.subtitle && (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/75">{publication.subtitle}</p>
        )}

        <div className="mt-7 flex flex-wrap items-center justify-between gap-5">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/80">
            <span className="inline-flex items-center gap-1.5">
              <CalendarIcon size={15} /> {formatForoDate(publication.createdAt)}
            </span>
            {metaValue && (
              <span className="inline-flex items-center gap-1.5">
                <ClockIcon size={15} /> {metaValue}
              </span>
            )}
            {byline && <span className="font-medium text-white">{byline}</span>}
          </div>

          {/* Sin botón de compartir acá: la tarjeta "Compartir esta <formato>"
              del sidebar (`DetailShell`) ya ofrece exactamente las mismas
              opciones, y tener las dos duplicaba la acción en la misma
              pantalla. Guardar sí se queda: no está en ningún otro lado. */}
          {isReal && (
            <div className="flex flex-wrap items-center gap-2">
              {/* `viewer` viene sin la clave cuando no hay sesión: para un anónimo ambos arrancan
                  apagados y el click abre el diálogo de login. */}
              <FavoriteButton
                publicationId={publication.id}
                favorited={publication.viewer?.favorited ?? false}
                variant="pill"
              />
              <SaveButton
                publicationId={publication.id}
                saved={publication.viewer?.saved ?? false}
                variant="pill"
                accent={accent}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
