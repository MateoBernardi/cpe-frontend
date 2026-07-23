export interface InteractionCounts {
  saves: number | null
  visits: number | null
  likes: number | null
  comments: number | null
}

/** A single interaction row (e.g. a comment when typeId === 2). */
export interface Interaction {
  id: number
  publicationId: number
  typeId: number
  userId: string | null
  createdBy: string | null
  content: string | null
  imageIds: number[] | null
  createdAt: Date
  updatedAt: Date | null
}
