import { Link } from 'react-router-dom'
import type { PublicationPreview, KnownPublicationTypeSlug } from '@features/foro'
import { PublicationListItem } from './PublicationListItem'
import { formatForoDate } from '../lib/typeStyle'
import './magazine.css'

interface MagazineGridProps {
  publications: PublicationPreview[]
  typeSlug: KnownPublicationTypeSlug | null
  typeName: string
}

/**
 * `.foro-brief-row` — dense news-brief row for the novedad type page: a
 * strong date column, no image, no author (novedades are institutional
 * announcements). Rule-separated, text-first — deliberately unlike the
 * image-led card grid papers/podcasts use below <TypeHero>.
 */
function NovedadBriefRow({ publication, index }: { publication: PublicationPreview; index: number }) {
  const to = `/publicaciones/${publication.id}`
  const n = String(index).padStart(3, '0')
  return (
    <article className="foro-brief-row">
      <div className="foro-brief-date">
        <span className="foro-idx">N.{n}</span>
        <span className="foro-brief-day">{formatForoDate(publication.createdAt)}</span>
      </div>
      <div className="foro-text">
        <h3><Link to={to}>{publication.title}</Link></h3>
        {publication.subtitle && <p className="foro-excerpt">{publication.subtitle}</p>}
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
 * Novedades switch to `<NovedadBriefRow>`: a denser, text-first
 * announcement list (strong dates, no images, no author) matching
 * <TypeHero>'s distinctive novedad band above it. Renders nothing when the
 * list is empty; the page handles the empty state.
 */
export function MagazineGrid({ publications, typeSlug, typeName }: MagazineGridProps) {
  if (publications.length === 0) return null

  if (typeSlug === 'novedad') {
    return (
      <div className="foro-brief-list">
        {publications.map((publication, i) => (
          <NovedadBriefRow key={publication.id} publication={publication} index={i + 1} />
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
