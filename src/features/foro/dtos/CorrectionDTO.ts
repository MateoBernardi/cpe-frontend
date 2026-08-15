/** POST /corrections body — publisher-only, `publication_id` must be `under_review`. */
export interface CreateCorrectionDTO {
  publication_id: number
  paragraph_index: number
  body: string
}

/** GET /corrections?publication_id= and POST /corrections response. */
export interface CorrectionDTO {
  id: number
  publication_id: number
  reviewer_id: string
  /** Resolved display name of the reviewer, same join pattern as `PublicationDTO.created_by_name`. */
  reviewer_name: string | null
  paragraph_index: number
  body: string
  created_at: string
}
