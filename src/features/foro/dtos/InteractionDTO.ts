import type { PublicationImageDTO } from './ImageDTO'
import type { PublicationPreviewDTO } from './PublicationDTO'

/**
 * Interaction type ids (seeded, fixed). `like` fue renombrado a `favorito`
 * (aplica a publicaciones y comentarios); `upvote` (id 3) se eliminó — no
 * tenía UI y quedó sin filas en el seed.
 */
export const INTERACTION_TYPE_IDS = {
  favorito: 1,
  comentario: 2,
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
  /**
   * Reply/target comment id. Sólo válido junto a `comentario` (respuesta) o
   * `favorito` (favorito sobre un comentario en vez de sobre la publicación).
   * `visita` nunca llega por esta ruta.
   */
  parent_id?: number
}

/** PATCH /interactions/:id body — edit own comment */
export interface PatchInteractionDTO {
  content: string
}

/**
 * DELETE /interactions body — borra la fila PROPIA del usuario autenticado
 * que matchee el target, sin necesidad de conocer su id. Es el reemplazo de
 * "togglear" favorito/guardado: antes había que bajar la lista de
 * interacciones para encontrar el id propio; ahora el backend lo resuelve
 * por (publication_id, type_id, parent_id, user de la sesión).
 */
export interface DeleteInteractionByTargetDTO {
  publication_id: number
  type_id: number
  parent_id?: number
}

/**
 * Nodo de interacción. Dos usos:
 * - Fila plana: la respuesta de POST/PATCH /interactions (un comentario o un
 *   favorito recién creado/editado) — sólo trae los campos base.
 * - Nodo de árbol: GET /publications/:id/comments devuelve comentarios con
 *   `parent_id`/`depth`/`favorites_count`/`replies_count`/`viewer_favorited`
 *   y sus respuestas anidadas en `replies`. Render only what's present — no
 *   invented fields.
 */
export interface InteractionDTO {
  id: number
  publication_id: number
  type_id: number
  /** Raíz cuando es null/ausente. Apunta a un comentario cuando la interacción es una
   *  respuesta o un favorito sobre un comentario. */
  parent_id?: number | null
  /** Nivel materializado (0..MAX_COMMENT_DEPTH), sólo presente en el árbol de comentarios. */
  depth?: number
  user_id?: string | null
  created_by?: string
  /** Resolved author display name — optional/nullable, same caveats as the publication DTOs. */
  created_by_name?: string | null
  content?: string | null
  images?: PublicationImageDTO[]
  created_at: string
  updated_at?: string | null
  /** Sólo presentes en el árbol de comentarios (GET /publications/:id/comments). */
  favorites_count?: number
  replies_count?: number
  viewer_favorited?: boolean
  replies?: InteractionDTO[]
}

/** Query params for GET /interactions/me (all optional; numeric coercion server-side). */
export interface ListMyInteractionsQueryDTO {
  /** CSV de type ids (p.ej. `"1,2"` para favoritos + comentarios) — antes era un `type_id` único. */
  type_ids?: string
  limit?: number
  offset?: number
}

/**
 * GET /interactions/me — a signed-in user's own interaction, enriched with
 * its parent publication preview (unlike the old
 * `listInteractionsForPublication`, which returned bare interaction rows).
 */
export interface MyInteractionDTO {
  id: number
  type_id: number
  content: string | null
  created_at: string
  publication: PublicationPreviewDTO
}
