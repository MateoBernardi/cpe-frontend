import type { PublicationPreviewDTO } from './PublicationDTO'

/** Interaction type ids (seeded, fixed). */
export const INTERACTION_TYPE_IDS = {
  like: 1,
  comentario: 2,
  upvote: 3,
  guardado: 4,
  visita: 5,
} as const

export type InteractionTypeId = typeof INTERACTION_TYPE_IDS[keyof typeof INTERACTION_TYPE_IDS]

/** POST /interactions body */
export interface CreateInteractionDTO {
  publication_id: number
  type_id: number
  /** required for comments (type_id=2) */
  content?: string
  image_ids?: number[]
}

/** PATCH /interactions/:id body — edit own comment */
export interface PatchInteractionDTO {
  content: string
}

/**
 * GET /interactions/publication/:id?type_id=2 — list item.
 * The contract does not fully specify this shape; the fields below are the
 * ones that are certain from the write body + ownership rules (owner-or-admin
 * PATCH/DELETE). Render only what's present — no invented fields.
 */
export interface InteractionDTO {
  id: number
  publication_id: number
  type_id: number
  user_id?: string
  created_by?: string
  content?: string | null
  image_ids?: number[] | null
  created_at: string
  updated_at?: string | null
}

/** Query params for GET /interactions/me (all optional; numeric coercion server-side). */
export interface ListMyInteractionsQueryDTO {
  type_id?: number
  limit?: number
  offset?: number
}

/**
 * GET /interactions/me — a signed-in user's own interaction, enriched with
 * its parent publication preview (unlike `listInteractionsForPublication`,
 * which returns bare interaction rows).
 */
export interface MyInteractionDTO {
  id: number
  type_id: number
  content: string | null
  created_at: string
  publication: PublicationPreviewDTO
}
