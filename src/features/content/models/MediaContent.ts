export interface MediaContent {
  mediaUrl: string
  mimeType: string | null
  role: string | null
  order: number
}

/** Modelo admin con IDs para edición */
export interface AdminMediaContent extends MediaContent {
  id: number
  title: string | null
  origin: string | null
  pivotId: number
}
