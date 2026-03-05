/** POST /public/candidates — body */
export interface CreateCandidateDTO {
  name: string
  surname: string
  email: string
  phone_number?: string
  id_interest: number
  experience: string
  modality: string
  incorporation_time: string
  message?: string
  file_id: number
}

/** POST /public/candidates — respuesta 201 */
export interface CreateCandidateResponseDTO {
  id: number
  created_at: string
}

/** Objeto en la lista GET /content/candidates */
export interface CandidateListItemDTO {
  id: number
  name: string
  surname: string
  email: string
  phone_number: string | null
  id_interest: number
  experience: string | null
  modality: string | null
  incorporation_time: string | null
  message: string | null
  file_id: number
  created_at: string
  interest: { id: number; name: string }
}

/** GET /content/candidates — respuesta 200 */
export interface CandidateListResponseDTO {
  candidates: CandidateListItemDTO[]
}

/** Detalle GET /content/candidates/:id */
export interface CandidateDetailDTO extends CandidateListItemDTO {
  file: { id: number; title: string; state: string }
}

/** GET /content/candidates/:id — respuesta 200 */
export interface CandidateDetailResponseDTO {
  candidate: CandidateDetailDTO
}
