import { Link } from 'react-router-dom'
import type { PublicationPreview, KnownPublicationTypeSlug } from '@features/foro'
import { CategoryTag } from './CategoryTag'
import { ChatBubbleIcon, ChevronRight } from './ForoIcons'
import { TagList } from './TagList'
import { formatForoDate, typeAccent, bylineFor, hexToRgba } from './foroHelpers'
import { colors } from '../../../../theme'

interface FeaturedCardProps {
  preview: PublicationPreview
  typeSlug: KnownPublicationTypeSlug | null
  typeName: string
}

/** Generic image glyph for the card's cover when there is no `imageUrl`. */
function ImagePlaceholderIcon({ accent }: { accent: string }) {
  return (
    <span className="absolute inset-0 flex items-center justify-center" style={{ color: `${accent}55` }}>
      <svg viewBox="0 0 24 24" width={48} height={48} fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8.5" cy="9.5" r="1.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m4 17 5-5 3 3 4-4 4 4" />
      </svg>
    </span>
  )
}

/**
 * Large featured card for the newest publication of a type page — 16:9
 * cover with a "DESTACADO" badge, then title/subtitle/footer on a white
 * surface. The cover image (`imageUrl`) wins whenever it's set, regardless
 * of type. When a Discusión has no cover, its cover area falls back to an
 * accent-tinted panel with the format's chat-bubble glyph instead of a
 * photo, keeping the same card shape as the other three formats.
 */
export function FeaturedCard({ preview, typeSlug, typeName }: FeaturedCardProps) {
  const to = `/publicaciones/${preview.id}`
  const accent = typeAccent(typeSlug)
  const isDiscusion = typeSlug === 'discusion'
  const byline = bylineFor(preview.authorName)

  const metaValue = isDiscusion
    ? (preview.interactions?.comments != null && preview.interactions.comments > 0
      ? `${preview.interactions.comments} respuestas`
      : 'Ver conversación')
    : null

  return (
    <Link
      to={to}
      className="group block overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-slate-200/60 transition-shadow duration-300 hover:shadow-xl"
    >
      <div className="relative aspect-video w-full overflow-hidden" style={{ backgroundColor: `${accent}14` }}>
        {preview.imageUrl
          ? (
            <img
              src={preview.imageUrl}
              alt={preview.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          )
          : isDiscusion
            ? (
              <span className="absolute inset-0 flex items-center justify-center" style={{ color: accent }}>
                <ChatBubbleIcon size={56} />
              </span>
            )
            : <ImagePlaceholderIcon accent={accent} />}
        <span
          className="absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur-md"
          style={{ backgroundColor: hexToRgba(colors.blueDark, 0.55), border: `1px solid ${hexToRgba(colors.white, 0.35)}` }}
        >
          Destacado
        </span>
      </div>

      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryTag slug={typeSlug} label={typeName} />
          <span className="text-gray-300" aria-hidden="true">·</span>
          <span className="text-xs font-medium text-gray-400">{formatForoDate(preview.createdAt)}</span>
        </div>
        <h2 className="mt-3 font-primary text-2xl font-bold leading-tight sm:text-3xl" style={{ color: colors.blueDark }}>
          {preview.title}
        </h2>
        {preview.subtitle && (
          <p className="mt-3 line-clamp-2 text-base leading-relaxed text-gray-500">{preview.subtitle}</p>
        )}
        <div className="mt-4">
          <TagList tags={preview.tags} max={3} size="sm" />
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-gray-100 pt-5">
          <span className="truncate text-sm text-gray-500">{byline}</span>
          {metaValue && <span className="shrink-0 text-sm font-medium text-gray-700">{metaValue}</span>}
          <span
            aria-hidden="true"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:translate-x-0.5"
            style={{ backgroundColor: `${accent}14`, color: accent }}
          >
            <ChevronRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  )
}
