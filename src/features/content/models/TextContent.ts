export interface TextContent {
  title: string | null
  body: string
  role: string | null
  order: number
}

/** Modelo admin con IDs para edición */
export interface AdminTextContent extends TextContent {
  id: number
  status: string | null
  pivotId: number
}
