import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  usePublications,
  usePublicationTypes,
  usePublicationMutations,
  resolveKnownSlug,
  getForoApiErrorMessage,
  type PublicationPreview,
} from '@features/foro'
import { PublicationListItem, TrashIcon } from '@features/content/components/foro'
import { QueryState } from '@shared/components'
import { colors, foroPalette } from '@/theme'

const REVIEW_QUEUE_LIMIT = 50

/**
 * Publisher-only panel (gated by `canPublish(role)` at the `ProfilePage` tab-list level, same as
 * `MisPublicacionesPanel`) — every visitor submission currently `under_review`, across ALL
 * authors. `status: 'under_review'` is the one deliberate exception the backend's publications
 * list makes to "you only ever see your own drafts" — see `usePublications`/`foroService`.
 *
 * Per-row actions: "Revisar" links into the shared edit route (`/perfil/publicaciones/:id/editar`,
 * which renders `<ReviewCorrectionsPanel>` for a publisher looking at someone else's `under_review`
 * submission) and "Eliminar" soft-deletes straight from the queue — same `remove` mutation and
 * confirm idiom as `MisPublicacionesPanel`; a reviewing publisher can delete any submission here
 * (moderation), per `assertOwnerOrModerator` on the backend.
 */
export default function RevisionesPanel() {
  const { data: types } = usePublicationTypes()
  const { data, isLoading, isError, error, refetch } = usePublications({ status: 'under_review', limit: REVIEW_QUEUE_LIMIT })
  const { remove } = usePublicationMutations()
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDelete = async (pub: PublicationPreview) => {
    if (!confirm(`¿Eliminar "${pub.title}"? No vas a poder deshacerlo.`)) return
    setDeleteError(null)
    try {
      await remove.mutateAsync(pub.id)
    } catch (err) {
      setDeleteError(getForoApiErrorMessage(err))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {deleteError && (
        <p className="text-sm" role="alert" style={{ color: foroPalette.errorText }}>
          {deleteError}
        </p>
      )}

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
                    <button
                      type="button"
                      className="flex shrink-0 items-center justify-center rounded-lg border bg-transparent p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                      style={{ color: foroPalette.errorText, borderColor: foroPalette.errorText }}
                      onClick={() => void handleDelete(pub)}
                      disabled={remove.isPending}
                      aria-label={`Eliminar "${pub.title}"`}
                      title="Eliminar"
                    >
                      <TrashIcon size={16} />
                    </button>
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
