import { useMemo, useState } from 'react'
import {
  useForoAuth,
  useCorrections,
  useCorrectionMutations,
  getForoApiErrorMessage,
  type Publication,
  type Correction,
} from '@features/foro'
import { LoadingSpinner, ErrorMessage } from '@shared/components'
import { ActionButton, type ActionButtonStatus } from './ActionButton'
import { colors, foroPalette } from '../../../../theme'

interface ReviewCorrectionsPanelProps {
  publication: Publication
  /**
   * Publisher-only "Aprobar" action — PATCHes `status: 'approved'`. Owned by the caller (the
   * composer reuses its existing `update` publication mutation) instead of duplicated here, so
   * this panel stays scoped to the `correcciones_publicacion` table it actually owns.
   */
  onApprove: () => void
  approveStatus: ActionButtonStatus
  /**
   * Publisher-only "Eliminar" action — soft-deletes the publication (`DELETE /publications/:id`).
   * Same ownership rule as everywhere else the backend uses `assertOwnerOrModerator`: a publisher
   * can delete anyone's submission (moderation), an owner could delete their own — but this panel
   * only ever renders the button for `isReviewer`, same scope as `onApprove`. Owned by the caller
   * for the same reason `onApprove` is: it reuses the composer's existing `remove` mutation.
   */
  onDelete: () => void
  deleteStatus: ActionButtonStatus
  deleteError: string | null
}

/**
 * Corrections aren't paragraph-anchored in the UI — the body itself (plain text or HTML from the
 * docx importer) is already shown correctly by the composer's preview pane right next to this
 * panel, so re-rendering it here would either duplicate it or, for HTML content, dump raw markup
 * as text. `paragraphIndex` still exists on the backend row but every comment from this panel
 * writes a constant 0 — it's just general feedback on the submission, ordered by `createdAt`.
 */
const GENERAL_PARAGRAPH_INDEX = 0

function orderByDate(corrections: Correction[] | undefined): Correction[] {
  return [...(corrections ?? [])].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
}

/**
 * Reviewer comment panel for a visitor's `under_review` submission. There is no existing
 * annotation UI anywhere in this codebase to build on; per the product decision, comments here are
 * general feedback on the submission (not anchored to a specific paragraph) — the formatted body
 * is already visible in the composer's preview pane alongside this panel.
 *
 * Two audiences render the same component:
 * - the author, read-only, while their own submission is `under_review` (sees feedback live,
 *   from inside the composer they're still editing in).
 * - any publisher reviewing someone else's `under_review` submission — same comment list, but
 *   with the "add comment" affordance enabled and an "Aprobar" button.
 * Renders nothing outside `under_review`, and nothing for anyone who is neither the author nor a
 * reviewing publisher — the caller doesn't need to gate on that itself.
 */
export function ReviewCorrectionsPanel({
  publication,
  onApprove,
  approveStatus,
  onDelete,
  deleteStatus,
  deleteError,
}: ReviewCorrectionsPanelProps) {
  const { user, role } = useForoAuth()
  const isOwner = user?.id === publication.createdBy
  const isReviewer = role === 'publisher' && !isOwner

  const { data: corrections, isLoading, isError, error } = useCorrections(publication.id)
  const { create } = useCorrectionMutations()

  const [composerOpen, setComposerOpen] = useState(false)
  const [draft, setDraft] = useState('')

  const orderedCorrections = useMemo(() => orderByDate(corrections), [corrections])

  if (publication.status !== 'under_review' || (!isOwner && !isReviewer)) {
    return null
  }

  const closeComposer = () => {
    setComposerOpen(false)
    setDraft('')
  }

  const handleAddCorrection = async () => {
    const body = draft.trim()
    if (!body || create.isPending) return
    try {
      await create.mutateAsync({ publicationId: publication.id, paragraphIndex: GENERAL_PARAGRAPH_INDEX, body })
      closeComposer()
    } catch {
      // El error queda en `create.error`, mostrado más abajo — el texto se conserva para reintentar.
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: colors.lightGray }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold" style={{ color: colors.blueDark }}>
            {isReviewer ? 'Revisión' : 'Comentarios del revisor'}
          </h2>
          <p className="text-xs text-gray-400">
            {isReviewer
              ? 'Dejá comentarios para el autor. Cuando esté lista, aprobala para que pueda publicarla.'
              : 'Un publicador está revisando este envío — podés seguir editando mientras tanto.'}
          </p>
        </div>
        {isReviewer && (
          <div className="flex items-center gap-2">
            <ActionButton
              status={deleteStatus}
              onClick={onDelete}
              variant="outline"
              accentColor={foroPalette.errorText}
              pendingLabel="Eliminando…"
            >
              Eliminar
            </ActionButton>
            <ActionButton status={approveStatus} onClick={onApprove} pendingLabel="Aprobando…">
              Aprobar
            </ActionButton>
          </div>
        )}
      </div>

      {isLoading && <LoadingSpinner className="py-6" />}
      {isError && <ErrorMessage message={getForoApiErrorMessage(error)} />}
      {create.error && <ErrorMessage message={getForoApiErrorMessage(create.error)} />}
      {deleteError && <ErrorMessage message={deleteError} />}

      {!isLoading && !isError && (
        <div className="space-y-2">
          {orderedCorrections.length === 0 ? (
            <p className="py-2 text-sm text-gray-400">Todavía no hay comentarios.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {orderedCorrections.map((correction) => (
                <li key={correction.id} className="rounded-lg p-2" style={{ backgroundColor: colors.lightGray }}>
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold" style={{ color: colors.blueDark }}>
                      {correction.reviewerName ?? 'Revisor'}:
                    </span>{' '}
                    {correction.body}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {isReviewer && (
            <>
              {composerOpen ? (
                <div className="flex flex-col gap-2 rounded-lg p-3" style={{ backgroundColor: colors.lightGray }}>
                  <textarea
                    rows={2}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Dejá un comentario para el autor…"
                    className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1"
                    style={{ color: colors.blueDark }}
                    maxLength={2000}
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={closeComposer} className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100">
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleAddCorrection()}
                      disabled={!draft.trim() || create.isPending}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      style={{ backgroundColor: colors.ctaPrimary }}
                    >
                      {create.isPending ? 'Guardando…' : 'Agregar'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setComposerOpen(true)}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold"
                  style={{ backgroundColor: colors.lightGray, color: colors.ctaPrimary }}
                >
                  + Agregar comentario
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
