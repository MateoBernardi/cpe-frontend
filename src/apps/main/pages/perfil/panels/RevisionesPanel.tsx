import { Link } from 'react-router-dom'
import { usePublications, usePublicationTypes, resolveKnownSlug, getForoApiErrorMessage } from '@features/foro'
import { PublicationListItem } from '@features/content/components/foro'
import { QueryState } from '@shared/components'
import { colors } from '@/theme'

const REVIEW_QUEUE_LIMIT = 50

/**
 * Publisher-only panel (gated by `canPublish(role)` at the `ProfilePage` tab-list level, same as
 * `MisPublicacionesPanel`) — every visitor submission currently `under_review`, across ALL
 * authors. `status: 'under_review'` is the one deliberate exception the backend's publications
 * list makes to "you only ever see your own drafts" — see `usePublications`/`foroService`.
 *
 * No per-row edit/delete here, just a link into the shared edit route: `/perfil/publicaciones/:id/
 * editar` already renders `<ReviewCorrectionsPanel>` for a publisher looking at someone else's
 * `under_review` submission, so that single route doubles as the review view.
 */
export default function RevisionesPanel() {
  const { data: types } = usePublicationTypes()
  const { data, isLoading, isError, error, refetch } = usePublications({ status: 'under_review', limit: REVIEW_QUEUE_LIMIT })

  return (
    <div className="flex flex-col gap-6">
      <QueryState
        isLoading={isLoading}
        isError={isError}
        errorMessage={getForoApiErrorMessage(error)}
        onRetry={refetch}
        data={data}
        emptyMessage="No hay envíos esperando revisión."
      >
        {(publications) => (
          <div className="flex flex-col divide-y divide-gray-200">
            {publications.map((pub) => {
              const type = types?.find((t) => t.id === pub.typeId)
              return (
                <div key={pub.id} className="flex flex-col gap-1.5 py-1">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <PublicationListItem
                        publication={pub}
                        typeSlug={resolveKnownSlug(type)}
                        typeName={type?.name ?? ''}
                        size="compact"
                        showSave={false}
                        statusBadge="under_review"
                      />
                    </div>
                    <Link
                      to={`/perfil/publicaciones/${pub.id}/editar`}
                      className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                      style={{ color: colors.ctaPrimary, border: `1px solid ${colors.ctaPrimary}` }}
                    >
                      Revisar
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </QueryState>
    </div>
  )
}
