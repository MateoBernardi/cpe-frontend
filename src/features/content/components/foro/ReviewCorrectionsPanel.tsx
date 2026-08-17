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
import { colors } from '../../../../theme'

interface ReviewCorrectionsPanelProps {
  publication: Publication
  /**
   * Publisher-only "Aprobar" action — PATCHes `status: 'approved'`. Owned by the caller (the
   * composer reuses its existing `update` publication mutation) instead of duplicated here, so
   * this panel stays scoped to the `correcciones_publicacion` table it actually owns.
   */
  onApprove: () => void
  approveStatus: ActionButtonStatus
}

/**
 * Splits a publication body into paragraphs the same way it's authored: blank-line (`\n\n`)
 * separated blocks. There is no separate paragraph model anywhere else in the codebase — this
 * mirrors how the composer's textarea and the public detail templates already treat the body.
 */
function splitParagraphs(content: string): string[] {
  return content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
}

function groupByParagraph(corrections: Correction[] | undefined): Map<number, Correction[]> {
  const map = new Map<number, Correction[]>()
  for (const correction of corrections ?? []) {
    const list = map.get(correction.paragraphIndex) ?? []
    list.push(correction)
    map.set(correction.paragraphIndex, list)
  }
  return map
}

/**
 * Flattens corrections into paragraph order (ties broken by `createdAt`) so every comment gets a
 * stable citation number — the same number appears as an inline tag next to the paragraph it
 * cites and as the heading of its entry in the "Comentarios" list below, the way a footnote marker
 * ties back to its footnote.
 */
function orderForCitations(corrections: Correction[] | undefined): Correction[] {
  return [...(corrections ?? [])].sort((a, b) =>
    a.paragraphIndex - b.paragraphIndex || a.createdAt.getTime() - b.createdAt.getTime(),
  )
}

interface CitationTagProps {
  number: number
  href: string
  title: string
}

/** Small numbered badge — the citation marker itself. Same visual weight inline (next to a
 *  paragraph) and as the anchor target's heading (in the list below), so the two read as one pair. */
function CitationTag({ number, href, title }: CitationTagProps) {
  return (
    <a
      href={href}
      title={title}
      className="inline-flex h-4 min-w-[1rem] shrink-0 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none text-white no-underline"
      style={{ backgroundColor: colors.ctaPrimary }}
    >
      {number}
    </a>
  )
}

/**
 * Reviewer comment panel for a visitor's `under_review` submission — the paragraph-anchored
 * "correction" UI the review workflow needs. There is no existing anchoring/annotation UI
 * anywhere in this codebase to build on; per the product decision, anchoring is a plain integer
 * paragraph index (not a text-offset range) — simpler, and it survives edits.
 *
 * Comments read as footnotes: a numbered `<CitationTag>` sits inline right after the paragraph it
 * cites (`#comentario-N`), and the full text lives once, in the "Comentarios" list at the bottom
 * (`#paragraph-N` links back) — no more duplicating the reviewer's text under every paragraph.
 *
 * Two audiences render the same component:
 * - the author, read-only, while their own submission is `under_review` (sees feedback live,
 *   from inside the composer they're still editing in).
 * - any publisher reviewing someone else's `under_review` submission — same paragraph list, but
 *   with the "+" add-comment affordance enabled and an "Aprobar" button.
 * Renders nothing outside `under_review`, and nothing for anyone who is neither the author nor a
 * reviewing publisher — the caller doesn't need to gate on that itself.
 */
export function ReviewCorrectionsPanel({ publication, onApprove, approveStatus }: ReviewCorrectionsPanelProps) {
  const { user, role } = useForoAuth()
  const isOwner = user?.id === publication.createdBy
  const isReviewer = role === 'publisher' && !isOwner

  const { data: corrections, isLoading, isError, error } = useCorrections(publication.id)
  const { create } = useCorrectionMutations()

  const [openParagraph, setOpenParagraph] = useState<number | null>(null)
  const [draft, setDraft] = useState('')

  const paragraphs = useMemo(() => splitParagraphs(publication.content), [publication.content])
  const byParagraph = useMemo(() => groupByParagraph(corrections), [corrections])
  const orderedCorrections = useMemo(() => orderForCitations(corrections), [corrections])
  const citationNumbers = useMemo(() => {
    const map = new Map<number, number>()
    orderedCorrections.forEach((correction, i) => map.set(correction.id, i + 1))
    return map
  }, [orderedCorrections])

  if (publication.status !== 'under_review' || (!isOwner && !isReviewer)) {
    return null
  }

  const closeComposer = () => {
    setOpenParagraph(null)
    setDraft('')
  }

  const handleAddCorrection = async (paragraphIndex: number) => {
    const body = draft.trim()
    if (!body || create.isPending) return
    try {
      await create.mutateAsync({ publicationId: publication.id, paragraphIndex, body })
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
              ? 'Marcá correcciones por párrafo. Cuando esté lista, aprobala para que el autor pueda publicarla.'
              : 'Un publicador está revisando este envío — podés seguir editando mientras tanto.'}
          </p>
        </div>
        {isReviewer && (
          <ActionButton status={approveStatus} onClick={onApprove} pendingLabel="Aprobando…">
            Aprobar
          </ActionButton>
        )}
      </div>

      {isLoading && <LoadingSpinner className="py-6" />}
      {isError && <ErrorMessage message={getForoApiErrorMessage(error)} />}
      {create.error && <ErrorMessage message={getForoApiErrorMessage(create.error)} />}

      {!isLoading && !isError && (
        <div className="divide-y divide-gray-100">
          {paragraphs.length === 0 && (
            <p className="py-4 text-sm text-gray-400">Esta publicación todavía no tiene contenido.</p>
          )}
          {paragraphs.map((paragraph, index) => {
            const paragraphCorrections = byParagraph.get(index) ?? []
            const isOpen = openParagraph === index
            return (
              <div key={index} id={`paragraph-${index}`} className="flex scroll-mt-4 flex-col gap-2 py-3">
                <div className="flex items-start gap-2">
                  <p className="flex-1 text-sm text-gray-700">
                    {paragraph}
                    {paragraphCorrections.length > 0 && (
                      <span className="ml-1.5 inline-flex items-center gap-1 align-middle">
                        {paragraphCorrections.map((correction) => (
                          <CitationTag
                            key={correction.id}
                            number={citationNumbers.get(correction.id) ?? 0}
                            href={`#comentario-${correction.id}`}
                            title={`Ver comentario de ${correction.reviewerName ?? 'Revisor'}`}
                          />
                        ))}
                      </span>
                    )}
                  </p>
                  {isReviewer && (
                    <button
                      type="button"
                      onClick={() => {
                        if (isOpen) {
                          closeComposer()
                        } else {
                          setOpenParagraph(index)
                          setDraft('')
                        }
                      }}
                      aria-label={`Agregar corrección al párrafo ${index + 1}`}
                      aria-expanded={isOpen}
                      title="Agregar corrección"
                      className="shrink-0 rounded-full px-2 py-0.5 text-sm font-bold leading-none transition-colors"
                      style={{ backgroundColor: colors.lightGray, color: colors.ctaPrimary }}
                    >
                      +
                    </button>
                  )}
                </div>

                {isReviewer && isOpen && (
                  <div className="flex flex-col gap-2 rounded-lg p-3" style={{ backgroundColor: colors.lightGray }}>
                    <textarea
                      rows={2}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Sugerí una corrección para este párrafo…"
                      className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1"
                      style={{ color: colors.blueDark }}
                      maxLength={2000}
                    />
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={closeComposer} className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100">
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleAddCorrection(index)}
                        disabled={!draft.trim() || create.isPending}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                        style={{ backgroundColor: colors.ctaPrimary }}
                      >
                        {create.isPending ? 'Guardando…' : 'Agregar'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {!isLoading && !isError && orderedCorrections.length > 0 && (
        <div className="space-y-2 border-t pt-4" style={{ borderColor: colors.lightGray }}>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Comentarios</h3>
          <ul className="flex flex-col gap-2">
            {orderedCorrections.map((correction) => (
              <li
                key={correction.id}
                id={`comentario-${correction.id}`}
                className="flex scroll-mt-4 items-start gap-2 rounded-lg p-2"
                style={{ backgroundColor: colors.lightGray }}
              >
                <CitationTag
                  number={citationNumbers.get(correction.id) ?? 0}
                  href={`#paragraph-${correction.paragraphIndex}`}
                  title={`Ir al párrafo ${correction.paragraphIndex + 1}`}
                />
                <p className="flex-1 text-xs text-gray-600">
                  <span className="font-semibold" style={{ color: colors.blueDark }}>
                    {correction.reviewerName ?? 'Revisor'}:
                  </span>{' '}
                  {correction.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
