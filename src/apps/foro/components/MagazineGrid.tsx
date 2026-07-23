import { Link } from 'react-router-dom'
import type { PublicationPreview, KnownPublicationTypeSlug } from '@features/foro'
import { PublicationListItem } from './PublicationListItem'
import { YouTubeMark } from './PlatformMarks'
import { formatForoDate } from '../lib/typeStyle'
import { findYouTubeLink } from '../lib/youtube'
import './magazine.css'

interface MagazineGridProps {
  publications: PublicationPreview[]
  typeSlug: KnownPublicationTypeSlug | null
  typeName: string
}

/**
 * `.foro-novedad-promo-card` — image-dominant promo card for the novedad
 * type page: a big square image (`imageUrl`, big — previews don't carry a
 * gallery) with just the date + title underneath. No author, no excerpt —
 * a novedad reads as a promotional announcement, not an article teaser.
 * Flags a small video badge when the item's external links include a
 * YouTube-recognizable URL, mirroring the embedded player on the detail page.
 */
function NovedadPromoCard({ publication }: { publication: PublicationPreview }) {
  const to = `/publicaciones/${publication.id}`
  const hasVideo = findYouTubeLink(publication.externalLinks) != null
  return (
    <article className="foro-novedad-promo-card">
      <Link className="foro-novedad-promo-media" to={to}>
        <div className="foro-ph foro-novedad-promo-img">
          {publication.imageUrl
            ? <img src={publication.imageUrl} alt="" />
            : <span>img</span>}
        </div>
        {hasVideo && (
          <span className="foro-novedad-promo-video-badge"><YouTubeMark size={12} /> Video</span>
        )}
      </Link>
      <div className="foro-novedad-promo-caption">
        <span className="foro-novedad-promo-date">{formatForoDate(publication.createdAt)}</span>
        <h3><Link to={to}>{publication.title}</Link></h3>
      </div>
    </article>
  )
}

/**
 * Magazine-style grid for the rest of a publication type's items (after
 * <TypeHero> has taken the newest one). For paper/podcast/discusión, reuses
 * <PublicationListItem> so those types keep their existing card treatment
 * (image, badge, title, subtitle, date, channel chips) — this component
 * only adds the grid container and a subtle "first row larger" rhythm.
 * 1 column on mobile, 2–3 on desktop.
 *
 * Novedades switch to `<NovedadPromoCard>`: an image-forward poster-wall
 * grid (big square images, date + title only) matching <TypeHero>'s
 * media-first novedad band above it. Renders nothing when the list is
 * empty; the page handles the empty state.
 */
export function MagazineGrid({ publications, typeSlug, typeName }: MagazineGridProps) {
  if (publications.length === 0) return null

  if (typeSlug === 'novedad') {
    return (
      <div className="foro-novedad-promo-grid">
        {publications.map((publication) => (
          <NovedadPromoCard key={publication.id} publication={publication} />
        ))}
      </div>
    )
  }

  return (
    <div className="foro-magazine-grid">
      {publications.map((publication, i) => (
        <PublicationListItem
          key={publication.id}
          publication={publication}
          typeSlug={typeSlug}
          typeName={typeName}
          index={i + 1}
        />
      ))}
    </div>
  )
}
