import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePublications, usePublicationTypes, usePublicationMutations, resolveKnownSlug, useForoAuth, getForoApiErrorMessage } from '@features/foro'
import { PublicationListItem } from '@features/content/components/foro'
import { QueryState } from '@shared/components'
import { colors, foroPalette } from '@/theme'

const MY_PUBLICATIONS_LIMIT = 50

/**
 * Publisher-only panel (gated by `canPublish(role)` at the `ProfilePage`
 * tab-list level) — the user's own publications, plus a link into the
 * composer at `/perfil/publicar`. The composer itself is a later wave: this
 * only links to it.
 */
export default function MisPublicacionesPanel() {
  const { user } = useForoAuth()
  const { data: types } = usePublicationTypes()
  const { data, isLoading, isError, error, refetch } = usePublications({ createdBy: user?.id, limit: MY_PUBLICATIONS_LIMIT })
  const { remove } = usePublicationMutations()
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDelete = async (id: number, title: string) => {
    // Mismo idioma que el resto del panel de admin (window.confirm). El backend
    // hace soft delete, pero no existe pantalla de restauración, así que para
    // el usuario esto es definitivo y el copy lo dice.
    if (!confirm(`¿Eliminar “${title}”? No vas a poder deshacerlo.`)) return
    setDeleteError(null)
    try {
      await remove.mutateAsync(id)
    } catch (err) {
      setDeleteError(getForoApiErrorMessage(err))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/perfil/publicar"
        className="self-start rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors"
        style={{ backgroundColor: colors.ctaPrimary }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.ctaPrimaryHover }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.ctaPrimary }}
      >
        Nueva publicación
      </Link>

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
        emptyMessage="Todavía no publicaste nada."
      >
        {(publications) => (
          <div className="flex flex-col divide-y divide-gray-200">
            {publications.map((pub) => {
              const type = types?.find((t) => t.id === pub.typeId)
              return (
                <div key={pub.id} className="flex flex-col gap-1.5 py-1">
                  {pub.status === 'draft' && (
                    <span
                      className="inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                      style={{ backgroundColor: `${colors.blueMid}1a`, color: colors.blueMid }}
                    >
                      Borrador
                    </span>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <PublicationListItem
                        publication={pub}
                        typeSlug={resolveKnownSlug(type)}
                        typeName={type?.name ?? ''}
                        size="compact"
                        showSave={false}
                      />
                    </div>
                    <Link
                      to={`/perfil/publicaciones/${pub.id}/editar`}
                      className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                      style={{ color: colors.ctaPrimary, border: `1px solid ${colors.ctaPrimary}` }}
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      className="shrink-0 rounded-lg border bg-transparent px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                      style={{ color: foroPalette.errorText, borderColor: foroPalette.errorText }}
                      onClick={() => void handleDelete(pub.id, pub.title)}
                      disabled={remove.isPending}
                    >
                      Eliminar
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
