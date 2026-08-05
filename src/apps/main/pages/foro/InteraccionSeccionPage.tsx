import { Navigate, useParams } from 'react-router-dom'
import { usePublications, usePublicationTypes, resolveKnownSlug } from '@features/foro'
import {
  FeaturedCard,
  LatestList,
  findInteraccionSection,
  DEFAULT_INTERACCION_ROUTE,
} from '@features/content/components/foro'
import { LoadingSpinner, ErrorMessage } from '@shared/components'
import { colors, layout } from '@/theme'

const SECTION_ITEMS_LIMIT = 5
/** Sentinel type_id used while the real numeric id hasn't resolved yet — keeps
 *  `usePublications` (which has no `enabled` flag) from fetching every publication. */
const UNRESOLVED_TYPE_ID = -1

/**
 * One publication type's ("cpevoz" | "discusiones" | "papers" | "novedades")
 * main page: a large `<FeaturedCard>` for the newest item alongside a
 * `<LatestList>` of the next few. There is deliberately no visible header —
 * the nav already tells the user which format they're in (`aria-current`)
 * and this page already *is* that format's full list — no filter row, no
 * "todas" view. The numeric `type_id` is never hardcoded — it's resolved at
 * runtime by matching `resolveKnownSlug` over `usePublicationTypes()`.
 */
export default function InteraccionSeccionPage() {
  const { seccion } = useParams<{ seccion: string }>()
  const section = findInteraccionSection(seccion)

  const { data: types, isLoading: typesLoading, isError: typesError, refetch: refetchTypes } = usePublicationTypes()
  const type = types?.find((t) => resolveKnownSlug(t) === section?.slug)

  const {
    data: publications,
    isLoading: pubsLoading,
    isError: pubsError,
    refetch: refetchPubs,
  } = usePublications({ typeId: type?.id ?? UNRESOLVED_TYPE_ID, limit: SECTION_ITEMS_LIMIT })

  const featured = publications?.[0]

  if (!section) {
    return <Navigate to={DEFAULT_INTERACCION_ROUTE} replace />
  }

  if (typesLoading) {
    return <LoadingSpinner size="lg" className="pt-[22vh] pb-24" />
  }

  if (typesError || !types) {
    return (
      <div className="mx-auto max-w-4xl px-4 pt-[22vh] pb-24">
        <ErrorMessage message="No pudimos cargar las secciones del foro." onRetry={refetchTypes} />
      </div>
    )
  }

  // El backend no devolvió este tipo: se muestra la sección vacía en vez de
  // redirigir — redirigir a otra sección podría no resolver tampoco y encadenar
  // un bucle de navegación.
  if (!type) {
    return (
      <div className="pt-[22vh] pb-[6vh] sm:pb-[8vh] md:pb-[10vh]" style={{ backgroundColor: colors.white }}>
        <div className={layout.container}>
          {/* The nav already surfaces the active format (aria-current), so the
              page itself doesn't repeat it as a visible title — but the
              document still needs a real top-level heading. */}
          <h1 className="sr-only">{section.label}</h1>
          <p className="py-16 text-center text-sm text-gray-500">
            Esta sección todavía no está disponible.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-[22vh] pb-[6vh] sm:pb-[8vh] md:pb-[10vh]" style={{ backgroundColor: colors.white }}>
      <div className={layout.container}>
        {/* No visible header here — the nav already shows the active format
            (aria-current), so the page renders its content directly. This
            sr-only heading keeps the document's accessible structure intact
            (a real top-level heading) without repeating the label on screen. */}
        <h1 className="sr-only">{section.label}</h1>

        {pubsLoading && <LoadingSpinner size="lg" className="py-16" />}

        {!pubsLoading && pubsError && (
          <ErrorMessage message="No pudimos cargar las publicaciones de esta sección." onRetry={refetchPubs} />
        )}

        {!pubsLoading && !pubsError && (!publications || publications.length === 0) && (
          <p className="py-16 text-center text-sm text-gray-500">Todavía no hay publicaciones en este canal.</p>
        )}

        {!pubsLoading && !pubsError && featured && (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[3fr_2fr] lg:gap-12">
            <FeaturedCard preview={featured} typeSlug={section.slug} typeName={type.name} />
            <LatestList publications={publications?.slice(1) ?? []} typeSlug={section.slug} typeName={type.name} />
          </div>
        )}
      </div>
    </div>
  )
}
