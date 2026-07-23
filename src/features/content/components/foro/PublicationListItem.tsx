import { Link } from 'react-router-dom'
import type { PublicationPreview, KnownPublicationTypeSlug } from '@features/foro'
import { SaveButton } from './SaveButton'
import { CategoryTag } from './CategoryTag'
import { PlayIcon, ChatBubbleIcon } from './ForoIcons'
import { formatForoDate, typeAccent, previewMetaLine } from './foroHelpers'
import { colors } from '../../../../theme'

interface PublicationListItemProps {
  publication: PublicationPreview
  typeSlug: KnownPublicationTypeSlug | null
  typeName: string
  /** `default`: ~96px thumbnail (the type page's "Últimas <formato>" list). `compact`: ~64px ("Te puede interesar" sidebar). */
  size?: 'default' | 'compact'
  /** Whether to render the trailing bookmark/save button. Off in the sidebar's compact "Te puede interesar" list to keep it light. */
  showSave?: boolean
}

/** Generic image glyph shown when a publication has no cover image (papers/novedades/podcast without a set `imageUrl`). */
function ImagePlaceholderIcon({ accent }: { accent: string }) {
  return (
    <span className="absolute inset-0 flex items-center justify-center" style={{ color: `${accent}55` }}>
      <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8.5" cy="9.5" r="1.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m4 17 5-5 3 3 4-4 4 4" />
      </svg>
    </span>
  )
}

/**
 * The single row layout used across the Foro's publication lists — the
 * type page's "Últimas <formato>" strip and the detail screen's "Te puede
 * interesar" sidebar. Thumbnail on the left carries a format-specific
 * overlay: a play badge for CPEVoz, a chat-bubble placeholder for
 * Discusiones (which have no cover image), nothing extra for Papers/
 * Novedades.
 */
export function PublicationListItem({ publication, typeSlug, typeName, size = 'default', showSave = true }: PublicationListItemProps) {
  const to = `/publicaciones/${publication.id}`
  const accent = typeAccent(typeSlug)
  const isDiscusion = typeSlug === 'discusion'
  const isPodcast = typeSlug === 'podcast'
  const metaLine = previewMetaLine(typeSlug, publication)
  const thumbSize = size === 'compact' ? 'h-16 w-16' : 'h-24 w-24'
  const titleSize = size === 'compact' ? 'text-sm' : 'text-base'

  return (
    <div className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
      <Link to={to} className={`group relative shrink-0 overflow-hidden rounded-xl ${thumbSize}`} style={{ backgroundColor: `${accent}14` }}>
        {isDiscusion
          ? (
            <span className="absolute inset-0 flex items-center justify-center" style={{ color: accent }}>
              <ChatBubbleIcon size={size === 'compact' ? 20 : 26} />
            </span>
          )
          : publication.imageUrl
            ? (
              <img
                src={publication.imageUrl}
                alt={publication.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )
            : <ImagePlaceholderIcon accent={accent} />}
        {isPodcast && (
          <span
            className="absolute inset-0 flex items-center justify-center bg-black/10 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            aria-hidden="true"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/60">
              <PlayIcon size={14} />
            </span>
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryTag slug={typeSlug} label={typeName} />
          <span className="text-gray-300" aria-hidden="true">·</span>
          <span className="text-xs font-medium text-gray-400">{formatForoDate(publication.createdAt)}</span>
        </div>
        <Link to={to} className={`line-clamp-2 font-semibold leading-snug ${titleSize}`} style={{ color: colors.blueDark }}>
          {publication.title}
        </Link>
        {metaLine && <span className="truncate text-xs text-gray-400">{metaLine}</span>}
      </div>

      {showSave && (
        <div className="shrink-0 self-center">
          <SaveButton publicationId={publication.id} variant="icon" />
        </div>
      )}
    </div>
  )
}
