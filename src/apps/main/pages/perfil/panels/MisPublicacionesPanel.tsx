import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePublications, usePublicationTypes, usePublicationMutations, resolveKnownSlug, useForoAuth, getForoApiErrorMessage, type PublicationPreview } from '@features/foro'
import { PublicationListItem, TrashIcon } from '@features/content/components/foro'
import { QueryState } from '@shared/components'
import { colors, foroPalette } from '@/theme'

const MY_PUBLICATIONS_LIMIT = 50

/**
 * Author panel (gated by `canAuthor(role)` at the `ProfilePage` tab-list
 * level — publishers AND visitors) — the user's own publications, plus a
 * link into the composer at `/perfil/publicar`. For a visitor these rows
 * include their `draft`/`under_review`/`approved` submissions, never other
 * authors' — `usePublications({ createdBy: user.id })` is own-scoped.
 */
export default function MisPublicacionesPanel() {
  const { user } = useForoAuth()
  const { data: types } = usePublicationTypes()
  const { data, isLoading, isError, error, refetch } = usePublications({ createdBy: user?.id, limit: MY_PUBLICATIONS_LIMIT })
  const { remove } = usePublicationMutations()
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDelete = async (pub: PublicationPreview) => {
    // Mismo idioma que el resto del panel de admin (window.confirm). El backend
    // hace soft delete, pero no existe pantalla de restauración, así que para
    // el usuario esto es definitivo y el copy lo dice. Si hay una revisión abierta, el
    // backend la borra en cascada junto con el original — el copy lo advierte para que no
    // sea una sorpresa.
    const revisionWarning = pub.revisionId != null
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
              // El listado propio ya no incluye la fila de revisión (el backend la excluye
              // siempre — es un artefacto de edición, nunca un ítem de lista), así que
              // `pub.revisionOf` acá nunca puede ser distinto de `null`: cada fila es el
              // original. `pub.revisionId` es lo que indica que ese original tiene cambios sin
              // publicar, y hacia dónde apunta la fila al editar — así nunca se acuña una segunda
              // revisión (el redirect autocurativo del composer cubre el caso de todos modos, pero
              // esto evita el salto).
              const editTargetId = pub.revisionId ?? pub.id
              return (
                <div key={pub.id} className="flex flex-col gap-1.5 py-1">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <PublicationListItem
                        publication={pub}
                        to={`/perfil/publicaciones/${editTargetId}/editar`}
                        typeSlug={resolveKnownSlug(type)}
                        typeName={type?.name ?? ''}
                        size="compact"
                        showSave={false}
                        // El chip va DENTRO de la fila, junto al pill de formato: antes flotaba
                        // encima y se leía como un separador entre publicaciones. `revision`
                        // (este original tiene cambios sin publicar) ya dice lo que antes decía
                        // la nota aparte de abajo — no hace falta duplicarlo. `revisionId` gana
                        // sobre `status` porque sólo un publicador puede abrir una revisión (su
                        // propio envío de visitante nunca tiene una), así que no compiten entre sí.
                        statusBadge={
                          pub.revisionId != null
                            ? 'revision'
                            : pub.status === 'draft' || pub.status === 'under_review' || pub.status === 'approved'
                              ? pub.status
                              : undefined
                        }
                        // Gateado a `under_review`, mismo criterio de visibilidad que
                        // `ReviewCorrectionsPanel` (no renderiza nada fuera de ese status) — pasado
                        // ese punto el chip quedaría apuntando a un panel que ya no muestra nada.
                        hasCorrections={pub.status === 'under_review' && pub.hasCorrections}
                      />
                    </div>
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
