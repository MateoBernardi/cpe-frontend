import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  usePublicationTypes,
  useFeedsByType,
  useInfinitePublications,
  foroService,
  resolveKnownSlug,
  mapPublicationPreviewDTO,
} from '@features/foro'
import type { PublicationPreview, PublicationType, KnownPublicationTypeSlug } from '@features/foro'
import { FeedStrip } from '../components/FeedStrip'
import { CategoryTag } from '../components/CategoryTag'
import { formatForoDate, initialsOf } from '../lib/typeStyle'

const TYPE_ORDER: KnownPublicationTypeSlug[] = ['novedad', 'paper', 'discusion', 'podcast']
const INITIAL_BATCH = 4
const EXTRA_CHUNK = 3
const MAX_ROUNDS = 8

// Human label used as the CategoryView title/tag while `usePublicationTypes()`
// hasn't resolved yet (avoids falling back to the literal "Categoría").
const CATEGORY_FALLBACK_LABEL: Record<KnownPublicationTypeSlug, string> = {
  paper: 'Papers',
  podcast: 'Podcasts',
  novedad: 'Novedades',
  discusion: 'Discusión',
}

interface ExtraStrip {
  typeId: number
  items: PublicationPreview[]
}

function orderTypes(types: PublicationType[]): PublicationType[] {
  return [...types].sort((a, b) => {
    const ai = TYPE_ORDER.indexOf(resolveKnownSlug(a) as KnownPublicationTypeSlug)
    const bi = TYPE_ORDER.indexOf(resolveKnownSlug(b) as KnownPublicationTypeSlug)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
}

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeSlug = searchParams.get('tipo') as KnownPublicationTypeSlug | null

  const { data: types } = usePublicationTypes()
  const orderedTypes = useMemo(() => (types ? orderTypes(types) : []), [types])
  const typeIds = useMemo(() => orderedTypes.map((t) => t.id), [orderedTypes])
  const feeds = useFeedsByType(typeIds, INITIAL_BATCH)

  const typeById = useMemo(() => new Map(orderedTypes.map((t) => [t.id, t])), [orderedTypes])

  if (activeSlug) {
    const activeType = orderedTypes.find((t) => resolveKnownSlug(t) === activeSlug)
    return (
      <CategoryView
        type={activeType ?? null}
        slug={activeSlug}
        onBack={() => setSearchParams({})}
      />
    )
  }

  // ── Hero: first Paper found, else first item across any feed ──
  const heroTypeId = orderedTypes.find((t) => resolveKnownSlug(t) === 'paper')?.id
  const heroFeed = feeds.find((f) => f.typeId === heroTypeId) ?? feeds.find((f) => f.items.length > 0)
  const hero = heroFeed?.items[0]
  const heroType = hero ? typeById.get(hero.typeId ?? -1) : undefined
  const heroSlug = resolveKnownSlug(heroType)

  const totalRecent = feeds.reduce((sum, f) => sum + f.items.length, 0)
  const discussionFeed = feeds.find((f) => resolveKnownSlug(typeById.get(f.typeId)) === 'discusion')
  const activeDiscussions = discussionFeed?.items.length ?? 0

  return (
    <>
      {hero && (
        <header className="foro-hero">
          <div className="foro-wrap">
            <article className="foro-feature">
              <div className="foro-feature-body">
                <CategoryTag slug={heroSlug} label={heroType?.name ?? ''} />
                <h2>{hero.title}</h2>
                {hero.subtitle && <p className="foro-lede">{hero.subtitle}</p>}
                <div className="foro-feature-meta">
                  <span className="foro-avatar">{initialsOf(hero.createdBy)}</span>
                  <span>{hero.createdBy}</span>
                  <span className="foro-dotsep" />
                  <span>{formatForoDate(hero.createdAt)}</span>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Link className="foro-btn foro-btn-navy" to={`/publicaciones/${hero.id}`}>Leer más →</Link>
                </div>
              </div>
              <div className="foro-side">
                <span className="foro-stat">PUBLICACIONES RECIENTES<strong>{totalRecent}</strong></span>
                <b>en el foro</b>
                <span className="foro-stat">DISCUSIONES ACTIVAS<strong>{activeDiscussions}</strong></span>
              </div>
            </article>
          </div>
        </header>
      )}

      <main id="foro-feed">
        <div className="foro-wrap">
          {feeds.map((feed) => {
            const type = typeById.get(feed.typeId)
            if (!type) return null
            const slug = resolveKnownSlug(type)
            return (
              <FeedStrip
                key={feed.typeId}
                heading={type.name}
                items={feed.items}
                typeSlug={slug}
                typeName={type.name}
                onSeeAll={() => setSearchParams({ tipo: slug ?? '' })}
              />
            )
          })}
        </div>
        <InfiniteFeedLoader typeById={typeById} orderedTypeIds={typeIds} />
      </main>
    </>
  )
}

function InfiniteFeedLoader({ typeById, orderedTypeIds }: { typeById: Map<number, PublicationType>; orderedTypeIds: number[] }) {
  const [extraStrips, setExtraStrips] = useState<ExtraStrip[]>([])
  const [done, setDone] = useState(false)
  const loaderRef = useRef<HTMLDivElement>(null)
  const roundRef = useRef(0)
  const offsetsRef = useRef<Record<number, number>>({})
  const exhaustedRef = useRef<Set<number>>(new Set())
  const loadingRef = useRef(false)

  useEffect(() => {
    if (orderedTypeIds.length === 0) return
    const el = loaderRef.current
    if (!el) return

    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || loadingRef.current || done) return
      loadingRef.current = true

      const loadNext = async () => {
        if (roundRef.current >= MAX_ROUNDS || exhaustedRef.current.size >= orderedTypeIds.length) {
          setDone(true)
          loadingRef.current = false
          return
        }
        const typeId = orderedTypeIds[roundRef.current % orderedTypeIds.length]
        roundRef.current += 1
        if (exhaustedRef.current.has(typeId)) {
          loadingRef.current = false
          return
        }
        const offset = offsetsRef.current[typeId] ?? INITIAL_BATCH
        try {
          const dtos = await foroService.listPublications({ type_id: typeId, limit: EXTRA_CHUNK, offset })
          if (dtos.length < EXTRA_CHUNK) exhaustedRef.current.add(typeId)
          if (dtos.length > 0) {
            offsetsRef.current[typeId] = offset + dtos.length
            setExtraStrips((prev) => [...prev, { typeId, items: dtos.map(mapPublicationPreviewDTO) }])
          }
        } finally {
          loadingRef.current = false
        }
      }

      void loadNext()
    }, { rootMargin: '400px' })

    io.observe(el)
    return () => io.disconnect()
  }, [orderedTypeIds, done])

  return (
    <div className="foro-wrap">
      {extraStrips.map((strip, i) => {
        const type = typeById.get(strip.typeId)
        if (!type) return null
        return (
          <FeedStrip
            key={`${strip.typeId}-${i}`}
            heading={type.name}
            items={strip.items}
            typeSlug={resolveKnownSlug(type)}
            typeName={type.name}
            startIndex={INITIAL_BATCH + 1 + i * EXTRA_CHUNK}
          />
        )
      })}
      <div className="foro-loader" ref={loaderRef}>
        {done
          ? <span>Llegaste al final del feed por ahora ✦</span>
          : <><span className="foro-spinner" /> Cargando más publicaciones…</>}
      </div>
    </div>
  )
}

function CategoryView({ type, slug, onBack }: { type: PublicationType | null; slug: KnownPublicationTypeSlug; onBack: () => void }) {
  // `type` is null until `usePublicationTypes()` resolves (or, in principle,
  // for an unknown slug) — never show the resolved-name UI ("•" tag with no
  // label, "Categoría" heading) while that's the case. Fall back to a human
  // label derived from the slug instead.
  const title = type?.name ?? CATEGORY_FALLBACK_LABEL[slug]
  const hasType = type !== null
  const query = useInfinitePublications(type ? { typeId: type.id } : undefined, 12, hasType)

  const items = query.data?.pages.flat() ?? []
  const isInitialLoading = !hasType || (query.isLoading && items.length === 0)
  const isEmpty = hasType && query.isSuccess && items.length === 0

  return (
    <div className="foro-wrap" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <div className="foro-catview-head">
        <CategoryTag slug={slug} label={title} />
        <h2>{title}</h2>
        <button type="button" className="foro-sec-link" onClick={onBack} style={{ marginTop: 12 }}>← Volver al inicio</button>
      </div>

      {isInitialLoading && (
        <div className="foro-loader">
          <span className="foro-spinner" /> Cargando publicaciones…
        </div>
      )}

      {!isInitialLoading && isEmpty && (
        <div className="foro-empty">
          <span className="foro-empty-eyebrow">Próximamente</span>
          <p>Todavía no hay publicaciones en esta categoría. Volvé pronto.</p>
        </div>
      )}

      {!isInitialLoading && !isEmpty && query.data?.pages.map((page, i) => (
        <FeedStrip
          key={i}
          heading=""
          items={page}
          typeSlug={slug}
          typeName={title}
          startIndex={i * 12 + 1}
        />
      ))}

      {query.hasNextPage && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0 40px' }}>
          <button
            type="button"
            className="foro-btn foro-btn-ghost"
            onClick={() => query.fetchNextPage()}
            disabled={query.isFetchingNextPage}
          >
            {query.isFetchingNextPage ? 'Cargando…' : 'Cargar más'}
          </button>
        </div>
      )}
    </div>
  )
}
