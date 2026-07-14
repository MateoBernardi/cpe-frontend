import type { CSSProperties } from 'react'
import type { PublicationPreview, KnownPublicationTypeSlug } from '@features/foro'
import { PublicationListItem } from './PublicationListItem'
import { typeSlugToCssVar, typeSlugChannelLabel } from '../lib/typeStyle'

interface FeedStripProps {
  heading: string
  count?: string
  items: PublicationPreview[]
  typeSlug: KnownPublicationTypeSlug | null
  typeName: string
  cols?: 2 | 3
  onSeeAll?: () => void
  startIndex?: number
}

/**
 * Section head + `.list` grid for one publication type. Each strip carries its
 * category accent (`--foro-cat`) so the header rule/eyebrow reads as a distinct
 * "channel" (Novedades / Papers / Podcasts / Discusión) — accent hairlines only,
 * no shadows/elevation.
 */
export function FeedStrip({ heading, count, items, typeSlug, typeName, cols = 2, onSeeAll, startIndex = 1 }: FeedStripProps) {
  if (items.length === 0) return null
  return (
    <section className="foro-strip" style={{ '--foro-cat': typeSlugToCssVar(typeSlug) } as CSSProperties}>
      {heading && (
        <div className="foro-sec-head foro-strip-head">
          <div className="foro-strip-titles">
            <span className="foro-strip-eyebrow">{typeSlugChannelLabel(typeSlug)}</span>
            <div className="foro-title">
              <h2>{heading}</h2>
              {count && <span className="foro-count">{count}</span>}
            </div>
          </div>
          {onSeeAll && (
            <button type="button" className="foro-sec-link" onClick={onSeeAll}>Ver todo →</button>
          )}
        </div>
      )}
      <div className={cols === 3 ? 'foro-list foro-cols-3' : 'foro-list'}>
        {items.map((item, i) => (
          <PublicationListItem
            key={item.id}
            publication={item}
            typeSlug={typeSlug}
            typeName={typeName}
            index={startIndex + i}
          />
        ))}
      </div>
    </section>
  )
}
