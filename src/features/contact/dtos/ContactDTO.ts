/** POST /public/contacts — body */
export interface CreateContactDTO {
  name: string
  email: string
  town: string
  address: string
  phone_number?: string
  number_of_people: number
  message?: string
}

/** POST /public/contacts — respuesta 201 */
export interface CreateContactResponseDTO {
  id: number
  created_at: string
}

/** Objeto devuelto por GET /content/contacts */
export interface ContactDTO {
  id: number
  name: string
  email: string
  town: string
  address: string | null
  phone_number: string | null
  number_of_people: number
  message: string | null
  created_at: string
}

/** GET /content/contacts — respuesta 200 */
export interface ContactListResponseDTO {
  contacts: ContactDTO[]
}
