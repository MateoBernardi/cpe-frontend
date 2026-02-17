import type { TextContent } from './TextContent'
import type { MediaContent } from './MediaContent'

export interface Section {
  id: number
  name: string
  texts: TextContent[]
  media: MediaContent[]
}
