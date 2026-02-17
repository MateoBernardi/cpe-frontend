export interface CreateTextInput {
  title?: string
  body: string
  role?: string
  order?: number
  status?: 'PUBLISHED' | 'DRAFT'
}

export interface CreateMediaInput {
  title?: string
  media_url: string
  mime_type?: string
  role?: string
  order?: number
  origin?: 'ADMIN' | 'USER'
}

export interface CreateSectionDTO {
  tenant_id: number
  section_name: string
  texts?: CreateTextInput[]
  media?: CreateMediaInput[]
}
