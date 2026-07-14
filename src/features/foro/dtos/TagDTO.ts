/** GET /tags — public, returns a plain array. */
export interface TagDTO {
  id: number
  name: string
}

/** POST/PATCH /tags body — role publisher|admin */
export interface TagWriteDTO {
  name: string
}
