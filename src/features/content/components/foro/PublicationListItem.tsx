import { Link } from 'react-router-dom'
import type { PublicationPreview, KnownPublicationTypeSlug } from '@features/foro'
import { SaveButton } from './SaveButton'
import { FavoriteButton } from './FavoriteButton'
import { TypePill } from './TypePill'
import { PlayIcon, ChatBubbleIcon } from './ForoIcons'
import { formatForoDate, typeAccent, previewMetaLine } from './foroHelpers'
import { CategoryList } from './CategoryList'
import { colors } from '../../../../theme'

interface PublicationListItemProps {
  publication: PublicationPreview
  typeSlug: KnownPublicationTypeSlug | null
  typeName: string
  /** `default`: ~96px thumbnail (the type page's "Últimas <formato>" list). `compact`: ~64px ("Te puede interesar" sidebar). */
  size?: 'default' | 'compact'
  /** Whether to render the trailing bookmark/save button. Off in the sidebar's compact "También te puede interesar" list to keep it light. */
  showSave?: boolean
  /**
   * Renders a status chip inside the row, next to the format pill. It lives
   * here rather than above the row (where `MisPublicacionesPanel` used to put
   * it) so it reads as a property of the publication instead of a floating
   * label between rows. `'revision'` is the open-revision-draft case (a
   * separate staging row for an already-published publication) — same amber
   * chip style as `'draft'`, different copy so the two aren't confused.
   * `'under_review'` (visitor submission awaiting a publisher's review) reuses
   * the same amber "not public yet" treatment; `'approved'` gets its own green
   * chip — it's the one state that reads as progress, not a pending state.
   */
  statusBadge?: 'draft' | 'revision' | 'under_review' | 'approved'
  /**
   * "Mis publicaciones" (visitor's own listing) only — a publisher left at least one correction
   * while this row was `under_review`. Separate from `statusBadge` (that's the publication's own
   * lifecycle; this is "there's feedback waiting for you to read") so both can show at once.
   */
  hasCorrections?: boolean
  /**
   * Overrides the thumbnail/title link target (defaults to the public reader page,
   * `/publicaciones/:id`). `MisPublicacionesPanel` points this at the edit route instead — an own
   * draft/under_review/revision row has no public page to preview yet.
   */
  to?: string
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
 * overlay: a play badge for CPEVoz. The cover image (`imageUrl`) wins
 * whenever it's set, regardless of type; the fallback when there's none is a
 * chat-bubble placeholder for Discusiones, or the generic image glyph for
 * every other format.
 */
export function PublicationListItem({ publication, typeSlug, typeName, size = 'default', showSave = true, statusBadge, hasCorrections = false, to: toOverride }: PublicationListItemProps) {
  const to = toOverride ?? `/publicaciones/${publication.id}`
  const accent = typeAccent(typeSlug)
  const isDiscusion = typeSlug === 'discusion'
  const isPodcast = typeSlug === 'podcast'
  const metaLine = previewMetaLine(typeSlug, publication)
  const thumbSize = size === 'compact' ? 'h-16 w-16' : 'h-24 w-24'
  const titleSize = size === 'compact' ? 'text-sm' : 'text-base'

  return (
    <div className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
      <Link to={to} className={`group relative shrink-0 overflow-hidden rounded-xl ${thumbSize}`} style={{ backgroundColor: `${accent}14` }}>
        {publication.imageUrl
          ? (
            <img
              src={publication.imageUrl}
              alt={publication.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )
          : isDiscusion
            ? (
              <span className="absolute inset-0 flex items-center justify-center" style={{ color: accent }}>
                <ChatBubbleIcon size={size === 'compact' ? 20 : 26} />
              </span>
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
          <TypePill slug={typeSlug} label={typeName} />
          {(statusBadge === 'draft' || statusBadge === 'revision' || statusBadge === 'under_review') && (
            // Ámbar sólido, no el azul tenue de antes: un estado sin publicar es un estado
            // que hay que poder distinguir de un vistazo entre publicaciones ya
            // publicadas, y el azul se confundía con el resto de la fila. Mismo chip para
            // 'revision' (cambios sin publicar de una publicación ya online) y 'under_review'
            // (envío de un visitante esperando revisión) — sólo cambia el texto, no el color,
            // porque las tres son variantes del mismo "todavía no es público".
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
              style={{ backgroundColor: colors.draftBadge }}
            >
              {statusBadge === 'revision' ? 'Cambios sin publicar' : statusBadge === 'under_review' ? 'En revisión' : 'Borrador'}
            </span>
          )}
          {statusBadge === 'approved' && (
            // Verde, no ámbar: este es el único estado que se lee como progreso ("ya se puede
            // publicar") en vez de "todavía no es público" — ver `colors.approvedBadge`.
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
              style={{ backgroundColor: colors.approvedBadge }}
            >
              Aprobada, pendiente de publicar
            </span>
          )}
          {hasCorrections && (
            // Teal (ctaPrimary), no ámbar/verde: no es un estado del ciclo de vida, es "hay algo
            // que leer" — un tercer color evita que se confunda con el chip de status de al lado.
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
              style={{ backgroundColor: colors.ctaPrimary }}
            >
              Correcciones del revisor
            </span>
          )}
          <span className="text-gray-300" aria-hidden="true">·</span>
          <span className="text-xs font-medium text-gray-400">{formatForoDate(publication.createdAt)}</span>
        </div>
        <Link to={to} className={`line-clamp-2 font-semibold leading-snug ${titleSize}`} style={{ color: colors.blueDark }}>
          {publication.title}
        </Link>
        {metaLine && <span className="truncate text-xs text-gray-400">{metaLine}</span>}
        <CategoryList categories={publication.categories} max={3} size="sm" />
      </div>

      {showSave && (
        <div className="flex shrink-0 items-center gap-1 self-center">
          <FavoriteButton
            publicationId={publication.id}
            favorited={publication.viewer?.favorited ?? false}
            variant="icon"
          />
          <SaveButton
            publicationId={publication.id}
            saved={publication.viewer?.saved ?? false}
            variant="icon"
          />
        </div>
      )}
    </div>
  )
}
