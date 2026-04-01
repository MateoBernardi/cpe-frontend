/** Puesto activo devuelto por GET /public/interests */
export interface PublicInterestDTO {
  id: number
  name: string
}

/** GET /public/interests — respuesta 200 */
export interface PublicInterestListResponseDTO {
  interests: PublicInterestDTO[]
}

/** Puesto devuelto por GET /content/interests (admin) */
export interface AdminInterestDTO {
  id: number
  name: string
  active: boolean
  created_at: string
}

/** GET /content/interests — respuesta 200 */
export interface AdminInterestListResponseDTO {
  interests: AdminInterestDTO[]
}

/** POST /content/interests — body */
export interface CreateInterestDTO {
  name: string
}

/** PATCH /content/interests/:id — body */
export interface PatchInterestDTO {
  name?: string
  active?: boolean
}
