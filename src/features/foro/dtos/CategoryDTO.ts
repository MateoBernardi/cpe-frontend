/** GET /categories — public, returns a plain array. */
export interface CategoryDTO {
  id: number
  name: string
  slug: string
}

/** POST/PATCH /categories body — role publisher|admin */
export interface CategoryWriteDTO {
  name: string
  slug?: string
}
