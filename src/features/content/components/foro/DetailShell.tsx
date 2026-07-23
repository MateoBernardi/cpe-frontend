import type { ReactNode } from 'react'
import type { KnownPublicationTypeSlug, Publication, PublicationPreview } from '@features/foro'
import { ArticleHero } from './ArticleHero'
import { ShareIconRow } from './ShareButtons'
import { PublicationListItem } from './PublicationListItem'
import { typeAccent, shareCardTitle, publicationUrl } from './foroHelpers'
import { colors, layout } from '../../../../theme'

interface ShareCardProps {
  publication: Publication
  slug: KnownPublicationTypeSlug | null
}

function ShareCard({ publication, slug }: ShareCardProps) {
  if (publication.id <= 0) return null
  return (
    <div className="rounded-xl border border-gray-100 p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-bold" style={{ color: colors.blueDark }}>{shareCardTitle(slug)}</h3>
      <ShareIconRow url={publicationUrl(publication.id)} title={publication.title} accent={typeAccent(slug)} />
    </div>
  )
}

interface RelatedListProps {
  related: PublicationPreview[]
  slug: KnownPublicationTypeSlug | null
  typeName: string
}

function RelatedList({ related, slug, typeName }: RelatedListProps) {
  if (related.length === 0) return null
  return (
    <div>
      <h3 className="mb-4 text-sm font-bold" style={{ color: colors.blueDark }}>Te puede interesar</h3>
      <div className="flex flex-col divide-y divide-gray-100">
        {related.map((item) => (
          <PublicationListItem key={item.id} publication={item} typeSlug={slug} typeName={typeName} size="compact" showSave={false} />
        ))}
      </div>
    </div>
  )
}

interface DetailShellProps {
  publication: Publication
  slug: KnownPublicationTypeSlug | null
  typeName: string
  related: PublicationPreview[]
  children: ReactNode
}

/**
 * Shared page-level chrome for both detail templates (`PublicationDetail` /
 * `DiscussionDetail`): full-bleed `<ArticleHero>` and a two-column body —
 * the format-specific `children` on the left, a "Compartir esta <formato>"
 * card + "Te puede interesar" list on the right. There is no left "En esta
 * página" rail: `content` is plain prose with no heading markup, so a table
 * of contents can't be derived without fabricating structure that isn't
 * there (see the components barrel's module doc) — the body simply spans
 * wider instead.
 */
export function DetailShell({ publication, slug, typeName, related, children }: DetailShellProps) {
  return (
    <div style={{ backgroundColor: colors.white }}>
      <ArticleHero publication={publication} slug={slug} typeName={typeName} />
      <div className={`${layout.container} py-10 sm:py-14`}>
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            {children}
          </div>
          <aside className="flex flex-col gap-6 lg:sticky lg:top-28">
            <ShareCard publication={publication} slug={slug} />
            <RelatedList related={related} slug={slug} typeName={typeName} />
          </aside>
        </div>
      </div>
    </div>
  )
}
