/** POST /content/sections/:sectionId/content */
export interface CreateTextInput {
  body: string
  title?: string
  role?: string
  order?: number
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
}

export interface CreateMediaInput {
  media_url: string
  mime_type: string
  title?: string
  role?: string
  order?: number
  origin?: 'ADMIN' | 'WEB_FORM'
}

export interface AddSectionContentDTO {
  texts?: CreateTextInput[]
  media?: CreateMediaInput[]
}

/** PATCH /content/texts/:id */
export interface PatchTextDTO {
  title?: string
  body?: string
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
}

/** PATCH /content/media/:id */
export interface PatchMediaDTO {
  title?: string
  url?: string
  mime_type?: string
  origin?: 'ADMIN' | 'WEB_FORM'
}

/** PATCH /content/text-sections/:pivotId  |  PATCH /content/media-texts/:pivotId */
export interface PatchPivotDTO {
  role?: string
  order?: number
}
