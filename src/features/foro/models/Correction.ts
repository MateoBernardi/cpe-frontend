/**
 * A single reviewer comment anchored to one paragraph of a publication's body — the "intermediate
 * table" of the review workflow (`correcciones_publicacion` on the backend). Flat, no threading:
 * general publication-level discussion still goes through `Interaction`/comments, this is
 * corrections-only. See `ReviewCorrectionsPanel.tsx`.
 */
export interface Correction {
  id: number
  publicationId: number
  reviewerId: string
  /** `null` when the backend can't resolve the reviewer's name (deleted user). */
  reviewerName: string | null
  paragraphIndex: number
  body: string
  createdAt: Date
}

/** POST /corrections body. */
export interface CreateCorrectionInput {
  publicationId: number
  paragraphIndex: number
  body: string
}
