/** Archivo subido a R2 (asociado a una sección) */
export interface FileContent {
  id: number
  title: string | null
  size: number | null
  state: 'PENDING' | 'UPLOADED'
  role: string | null
  order: number
  pivotId: number
}
