import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePublications, usePublicationTypes, usePublicationMutations, resolveKnownSlug, useForoAuth, getForoApiErrorMessage, type PublicationPreview } from '@features/foro'
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

  // Mapa original→revisión derivado del lado del cliente a partir de la misma página ya
  // cargada — no hace falta un campo nuevo del backend para esto: cualquier fila con
  // `revisionOf != null` es un borrador de revisión, y su `revisionOf` es el id del
  // original. Si el par cae en lados distintos de la paginación, el original simplemente no
  // muestra el enlace/nota (el redirect autocurativo del composer cubre ese caso al entrar
  // por el original de todos modos).
  const revisionMap = useMemo(() => {
    const map = new Map<number, number>()
    for (const pub of data ?? []) {
      if (pub.revisionOf != null) map.set(pub.revisionOf, pub.id)
    }
    return map
  }, [data])

  const handleDelete = async (pub: PublicationPreview) => {
    // Mismo idioma que el resto del panel de admin (window.confirm). El backend
    // hace soft delete, pero no existe pantalla de restauración, así que para
    // el usuario esto es definitivo y el copy lo dice. Si hay una revisión abierta, el
    // backend la borra en cascada junto con el original — el copy lo advierte para que no
    // sea una sorpresa.
    const revisionWarning = revisionMap.has(pub.id)
      ? ' Los cambios sin publicar que tiene esta publicación también se van a eliminar.'
      : ''
    if (!confirm(`¿Eliminar “${pub.title}”? No vas a poder deshacerlo.${revisionWarning}`)) return
    setDeleteError(null)
    try {
      await remove.mutateAsync(pub.id)
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
              // Si esta fila es el original y tiene una revisión abierta, "Editar" apunta
              // directo a esa revisión — así nunca se acuña una segunda (el redirect
              // autocurativo del composer cubre el caso de todos modos, pero esto evita el
              // salto). Si la fila ES la revisión, se edita a sí misma sin indirección.
              const openRevisionId = revisionMap.get(pub.id)
              const editTargetId = openRevisionId ?? pub.id
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
                        // El chip va DENTRO de la fila, junto al pill de formato: antes flotaba
                        // encima y se leía como un separador entre publicaciones. `revision`
                        // (esta fila ES un borrador de revisión) tiene prioridad sobre `draft`
                        // porque ambos casos nunca se solapan (una revisión no deja de serlo por
                        // su `status`).
                        statusBadge={pub.revisionOf != null ? 'revision' : pub.status === 'draft' ? 'draft' : undefined}
                      />
                      {openRevisionId != null && (
                        <p className="mt-0.5 text-xs" style={{ color: colors.draftBadge }}>
                          Tiene cambios sin publicar.
                        </p>
                      )}
                    </div>
                    <Link
                      to={`/perfil/publicaciones/${editTargetId}/editar`}
                      className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                      style={{ color: colors.ctaPrimary, border: `1px solid ${colors.ctaPrimary}` }}
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      className="shrink-0 rounded-lg border bg-transparent px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                      style={{ color: foroPalette.errorText, borderColor: foroPalette.errorText }}
                      onClick={() => void handleDelete(pub)}
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
