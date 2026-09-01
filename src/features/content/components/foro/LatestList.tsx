import type { PublicationPreview, KnownPublicationTypeSlug } from '@features/foro'
import { PublicationListItem } from './PublicationListItem'
import { latestListHeading } from './foroHelpers'
import { colors } from '../../../../theme'

interface LatestListProps {
  publications: PublicationPreview[]
  typeSlug: KnownPublicationTypeSlug | null
  typeName: string
}

/**
 * The type page's right-hand column: a bold "Últimas <formato>" heading (no
 * "Ver todas" link — the page already is that format's full list) followed by
 * a row-per-item list of the next few publications after the featured one.
 */
export function LatestList({ publications, typeSlug, typeName }: LatestListProps) {
  return (
    <div>
      <h2 className="font-primary mb-2 text-2xl font-bold" style={{ color: colors.blueDark }}>
        {latestListHeading(typeSlug)}
      </h2>
      {publications.length === 0
        ? <p className="py-8 text-sm text-gray-400">Todavía no hay más publicaciones en esta sección.</p>
        : (
          <div className="flex flex-col divide-y divide-gray-100">
            {publications.map((publication) => (
              <PublicationListItem key={publication.id} publication={publication} typeSlug={typeSlug} typeName={typeName} size="default" />
            ))}
          </div>
        )}
    </div>
  )
}
