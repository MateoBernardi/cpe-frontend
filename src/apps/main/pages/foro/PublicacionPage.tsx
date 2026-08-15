import { Link, Navigate, useParams } from 'react-router-dom'
import { usePublication, usePublicationTypes, usePublications, resolveKnownSlug } from '@features/foro'
import {
  PublicationDetail,
  DiscussionDetail,
  hoverBgSwap,
  DEFAULT_INTERACCION_ROUTE,
  INTERACCIONES_SECTIONS,
} from '@features/content/components/foro'
import { LoadingSpinner, ErrorMessage } from '@shared/components'
import { colors } from '@/theme'

const RELATED_LIMIT = 4

/**
 * Publication detail screen. All of the actual page chrome — the full-bleed
 * hero, reading-progress bar, and the share/save/"te puede interesar"
 * sidebar — lives inside `<PublicationDetail>`/`<DiscussionDetail>` via the
 * shared `<DetailShell>`, so this component is just data-fetching plus a
 * template pick: `<DiscussionDetail>` (which renders its own comment thread
 * via `useComments`/`useCommentMutations`) when the publication's type
 * resolves to "discusion", otherwise `<PublicationDetail>`. No back/
 * breadcrumb navigation here by design — there is no "all publications"
 * index to return to, and the owner explicitly asked for that kind of link
 * to be removed.
 */
export default function PublicacionPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const validId = Number.isFinite(id) && id > 0

  const { data: publication, isLoading, isError, refetch } = usePublication(validId ? id : undefined)
  const { data: types } = usePublicationTypes()
  const type = types?.find((t) => t.id === publication?.typeId)
  const slug = resolveKnownSlug(type)

  const { data: relatedRaw } = usePublications(
    publication?.typeId != null ? { typeId: publication.typeId, limit: RELATED_LIMIT } : undefined,
  )
  const related = (relatedRaw ?? []).filter((p) => p.id !== publication?.id).slice(0, 3)

  if (!validId) {
    return <Navigate to={DEFAULT_INTERACCION_ROUTE} replace />
  }

  if (isLoading) {
    return <LoadingSpinner size="lg" className="pb-16 pt-40" />
  }

  if (isError || !publication) {
    return (
      <div className="mx-auto max-w-4xl px-4 pb-24 pt-40 text-center">
        <h2 className="text-xl font-semibold" style={{ color: colors.blueDark }}>No encontramos esta publicación</h2>
        <p className="mt-3 text-sm text-gray-500">
          Puede haber sido eliminada o el enlace es incorrecto.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <ErrorMessage message="No se pudo cargar la publicación." onRetry={refetch} />
        </div>
        <Link
          to={DEFAULT_INTERACCION_ROUTE}
          className="mt-6 inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform duration-150 hover:-translate-y-0.5"
          style={{ backgroundColor: colors.ctaPrimary }}
          {...hoverBgSwap(colors.ctaPrimary, colors.ctaPrimaryHover)}
        >
          Ver {INTERACCIONES_SECTIONS[0].label}
        </Link>
      </div>
    )
  }

  // Not published yet (draft / under_review / approved, or someone else's revision draft): there
  // is no reader-facing page for it, so pressing it goes straight to the editor instead of
  // rendering the detail template. If the repo/service returned it at all, the viewer is already
  // either the owner or a moderating publisher (see `getPublicationService`'s visibility check —
  // anyone else 404s before reaching this component), so no extra client-side gate is needed:
  // same audience the editor route itself requires. Covers visitors on their own submission and
  // publishers on their own draft or someone else's `under_review` review queue item alike.
  if (publication.status !== 'published') {
    return <Navigate to={`/perfil/publicaciones/${publication.id}/editar`} replace />
  }

  return slug === 'discusion'
    ? <DiscussionDetail publication={publication} typeName={type?.name ?? 'Discusión'} related={related} />
    : (
      <PublicationDetail
        publication={publication}
        type={type}
        slug={(slug ?? 'paper') as 'paper' | 'podcast' | 'novedad'}
        related={related}
      />
    )
}
