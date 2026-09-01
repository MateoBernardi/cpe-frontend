import type { MyInteraction } from '@features/foro'

/**
 * Agrupa las interacciones del usuario por publicación, conservando el orden en que llegaron.
 *
 * `GET /interactions/me` viene ordenado por fecha de interacción descendente, así que la primera
 * aparición de una publicación es también su interacción más reciente: usar ese orden para los grupos
 * mantiene el feed ordenado por "lo último que hice", que es lo que se espera de una pantalla de
 * actividad. Dentro de cada grupo se preserva el mismo orden (más nuevo primero).
 *
 * Existe porque los paneles del perfil muestran UNA tarjeta por publicación: sin agrupar, comentar
 * tres veces la misma publicación y marcarla como favorito daba cuatro tarjetas repitiendo la misma
 * fila de publicación.
 */
export function groupInteractionsByPublication(interactions: MyInteraction[]): MyInteraction[][] {
  const groups = new Map<number, MyInteraction[]>()

  for (const interaction of interactions) {
    const existing = groups.get(interaction.publication.id)
    if (existing) {
      existing.push(interaction)
    } else {
      groups.set(interaction.publication.id, [interaction])
    }
  }

  // `Map` itera en orden de inserción, que es justo el orden de primera aparición.
  return [...groups.values()]
}
