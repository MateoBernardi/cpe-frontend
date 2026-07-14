import type { CSSProperties } from 'react'
import '@features/foro/styles/tokens.css'
import { usePublicationTypes, useFeedsByType, resolveKnownSlug } from '@features/foro'
import { useSectionViewModel } from '@features/content/viewmodels'

/**
 * Base URL for the Foro sub-app. In production this points at the Foro
 * subdomain (e.g. `https://foro.clinicaparaempresas.com`); in dev/preview
 * builds without that env var it falls back to the co-hosted `/foro.html`
 * multi-page entry. Foro routes: `/publicaciones/:id` (detail), `?tipo=<slug>`
 * (home filtered by publication type).
 */
const FORO_BASE = (import.meta.env.VITE_FORO_URL as string | undefined) ?? '/foro.html'

function foroHref(path = ''): string {
  return `${FORO_BASE}${path}`
}

function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

const MONTHS_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/**
 * Hardcoded fallbacks for the `foro_teaser` CMS section's text roles. Used
 * whenever the section/backend is unavailable or a role has no (or empty)
 * body, so this preview never breaks or blanks out — same resilience
 * contract as the rest of the component (see module docstring below).
 */
const FORO_TEASER_FALLBACKS = {
  heading: 'Pensar la empresa, puertas adentro.',
  subheading:
    'Papers, podcasts y conversaciones sobre sucesión, equipos y crecimiento. Un espacio para ' +
    'acompañar a empresas familiares y PyMEs más allá del proyecto.',
  cta_heading: 'Todo el foro, en un solo lugar.',
  cta_paragraph: 'Seguí leyendo, escuchá los episodios y sumate a las conversaciones de la comunidad.',
  cta: 'Explorar el foro completo →',
} as const

type ForoTeaserRole = keyof typeof FORO_TEASER_FALLBACKS

function formatForoDate(date: Date): string {
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `hace ${diffDays} días`
  return `${MONTHS_ES[date.getMonth()]} ${date.getFullYear()}`
}

/**
 * Home "Foro" preview — teaser for the Foro sub-app on the main institutional
 * landing page. Pulls live data (papers, discussions, podcast) from the
 * public Foro API via `@features/foro` query hooks.
 *
 * Renders nothing while the type catalog/feeds haven't resolved yet, and
 * nothing at all if the Foro backend is unreachable or has no published
 * content in any of the three tracked categories — this section must never
 * crash or block the rest of the home page (React Query's default retry is
 * disabled for non-429 errors app-wide, so a failed fetch settles quickly).
 */
export default function ForoPreviewSection() {
  const { data: types } = usePublicationTypes()
  // `foro_teaser` CMS copy (heading/subheading of the intro, cta_heading/
  // cta_paragraph/cta of the closing band). Public hook — same content
  // backend as every other main section, unrelated to the Foro backend
  // that powers the publications feeds below. Never gates rendering: a
  // missing section, a failed fetch, or an empty role just falls back to
  // the hardcoded copy via `teaserText()`.
  const { section: teaserSection } = useSectionViewModel('foro_teaser')

  function teaserText(role: ForoTeaserRole): string {
    const body = teaserSection?.texts.find((t) => t.role === role)?.body?.trim()
    return body ? body : FORO_TEASER_FALLBACKS[role]
  }

  const paperType = types?.find((t) => resolveKnownSlug(t) === 'paper')
  const discussionType = types?.find((t) => resolveKnownSlug(t) === 'discusion')
  const podcastType = types?.find((t) => resolveKnownSlug(t) === 'podcast')

  const typeIds = [paperType?.id, discussionType?.id, podcastType?.id].filter(
    (id): id is number => typeof id === 'number',
  )
  const feeds = useFeedsByType(typeIds, 6)

  const paperItems = feeds.find((f) => f.typeId === paperType?.id)?.items ?? []
  const discussionItems = feeds.find((f) => f.typeId === discussionType?.id)?.items ?? []
  const podcastItems = feeds.find((f) => f.typeId === podcastType?.id)?.items ?? []

  if (paperItems.length === 0 && discussionItems.length === 0 && podcastItems.length === 0) {
    return null
  }

  const [featured, ...restPapers] = paperItems
  const podcastFeatured = podcastItems[0]

  return (
    <div className="foro-scope" style={{ background: 'var(--foro-bg)' }}>
      {/* Intro */}
      <section>
        <div className="foro-wrap py-12 sm:py-16">
          <div className="foro-tag mb-4">
            <span
              className="text-[11px] font-medium uppercase tracking-wide"
              style={{ background: 'var(--foro-navy)', color: '#fff', padding: '3px 10px', fontFamily: 'var(--foro-font-mono)' }}
            >
              Nuevo
            </span>
            El foro
          </div>
          {/*
            Title + "Ver todo →" share one baseline row (space-between): the
            intro heading on the left, the link to the full foro home on the
            right. Moved here off the "Papers y publicaciones" section head.
          */}
          <div className="flex items-baseline justify-between gap-6">
            <h2 className="max-w-[760px] text-3xl font-semibold sm:text-4xl" style={{ color: 'var(--foro-navy)', lineHeight: 1.1 }}>
              {teaserText('heading')}
            </h2>
            <a className="foro-sec-link" href={foroHref()}>Ver todo →</a>
          </div>
          {/*
            `.foro-scope p { margin: 0 }` (specificity 0-1-1) beats the Tailwind
            `mt-4` utility (0-1-0) — margin has to be set inline to win. See
            FORO_ARCHITECTURE.md "CSS gotchas" / this component's known issues.
          */}
          <p
            className="max-w-[60ch] text-base sm:text-[16.5px]"
            style={{ color: 'var(--foro-muted)', lineHeight: 1.6, marginTop: '1.5rem' }}
          >
            {teaserText('subheading')}
          </p>
        </div>
      </section>

      {/* Publications + discussion feed */}
      {(paperItems.length > 0 || discussionItems.length > 0) && (
        <section className="foro-wrap py-10 sm:py-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_340px] lg:gap-12">
            {/* Main: papers & publicaciones */}
            {paperItems.length > 0 && (
              <div>
                <div className="foro-sec-head">
                  <div className="flex items-center gap-3">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: 'var(--foro-c-papers)' }} />
                    <h2>Papers y publicaciones</h2>
                  </div>
                </div>

                {featured && (
                  <a
                    href={foroHref(`/publicaciones/${featured.id}`)}
                    className="group block border-y py-6"
                    style={{ borderColor: 'var(--foro-line)' }}
                  >
                    <div className="text-[11px]" style={{ fontFamily: 'var(--foro-font-mono)', color: 'var(--foro-muted-2)' }}>
                      PAPER DESTACADO · N.001
                    </div>
                    <span className="foro-tag foro-cat-papers mt-2">
                      <span className="foro-dot" />{paperType?.name ?? 'Paper'}
                    </span>
                    <h2 className="mt-2 text-[27px] font-semibold leading-tight text-[var(--foro-navy)] group-hover:text-[var(--foro-teal-700)] group-hover:underline group-hover:decoration-[var(--foro-teal-tint-2)] group-hover:underline-offset-4">
                      {featured.title}
                    </h2>
                    {featured.subtitle && (
                      <p className="mt-2 text-[14.5px]" style={{ color: 'var(--foro-muted)' }}>{featured.subtitle}</p>
                    )}
                    <div className="foro-card-meta mt-3">
                      <span className="foro-avatar">{initialsOf(featured.createdBy)}</span>
                      <span>{featured.createdBy}</span>
                      <span className="foro-dotsep" />
                      <span>{formatForoDate(featured.createdAt)}</span>
                    </div>
                  </a>
                )}

                {restPapers.length > 0 && (
                  <div className="foro-list">
                    {restPapers.map((item, i) => (
                      <article
                        key={item.id}
                        className="foro-list-item"
                        style={{ '--foro-cat': 'var(--foro-c-papers)' } as CSSProperties}
                      >
                        <div className="foro-thumb foro-ph">
                          {item.imageUrl
                            ? <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} />
                            : <span>img</span>}
                        </div>
                        <div className="foro-text">
                          <div className="foro-idx">N.{String(i + 2).padStart(3, '0')}</div>
                          <span className="foro-tag foro-cat-papers">
                            <span className="foro-dot" />{paperType?.name ?? 'Paper'}
                          </span>
                          {/* Only the title is a link — matches the foro app's own
                              PublicationListItem, whose nested `h3 a` is the sole
                              target of the canonical `.foro-list-item h3 a:hover`
                              rule in tokens.css (a bare `<h3>` never matches it). */}
                          <h3><a href={foroHref(`/publicaciones/${item.id}`)}>{item.title}</a></h3>
                          {item.subtitle && <p className="foro-excerpt">{item.subtitle}</p>}
                          <div className="foro-card-meta">
                            <span className="foro-avatar">{initialsOf(item.createdBy)}</span>
                            <span>{item.createdBy}</span>
                            <span className="foro-dotsep" />
                            <span>{formatForoDate(item.createdAt)}</span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sidebar: discussion feed, "live" */}
            {discussionItems.length > 0 && (
              <aside>
                <div className="lg:sticky lg:top-24" style={{ borderTop: '1px solid var(--foro-line)', borderBottom: '1px solid var(--foro-line)' }}>
                  <div className="flex items-center justify-between gap-2 py-4">
                    <span className="foro-tag" style={{ color: 'var(--foro-c-foros)' }}>
                      <span className="inline-block h-[7px] w-[7px] animate-pulse rounded-full" style={{ background: 'var(--foro-c-foros)' }} />
                      Foros de discusión
                    </span>
                    <small className="text-[11px]" style={{ fontFamily: 'var(--foro-font-mono)', color: 'var(--foro-muted-2)' }}>en vivo</small>
                  </div>
                  {discussionItems.map((item, i) => (
                    <a
                      key={item.id}
                      href={foroHref(`/publicaciones/${item.id}`)}
                      className="block py-4 hover:opacity-80"
                      style={{ borderTop: i > 0 ? '1px solid var(--foro-line-2)' : undefined }}
                    >
                      <h4 className="text-sm font-semibold leading-snug" style={{ color: 'var(--foro-navy)', fontFamily: 'var(--foro-font-sans)' }}>
                        {item.title}
                      </h4>
                      {item.interactions?.comments != null && (
                        <div className="mt-2 text-[11.5px]" style={{ fontFamily: 'var(--foro-font-mono)', color: 'var(--foro-muted)' }}>
                          <b style={{ color: 'var(--foro-navy)', fontFamily: 'var(--foro-font-sans)' }}>{item.interactions.comments}</b> respuestas
                        </div>
                      )}
                    </a>
                  ))}
                  <a href={foroHref('?tipo=discusion')} className="foro-sec-link block py-3 text-center">
                    Ver todas las conversaciones →
                  </a>
                </div>
              </aside>
            )}
          </div>
        </section>
      )}

      {/* Podcast promo band (solid teal) */}
      {podcastFeatured && (
        <section className="foro-band-teal" style={{ padding: '56px 0' }}>
          <div className="foro-wrap grid items-center gap-10 lg:grid-cols-[1fr_280px]">
            <div>
              <span className="foro-tag" style={{ color: '#bdeaea' }}>
                <span className="inline-block h-[7px] w-[7px] rounded-full" style={{ background: '#fff' }} />
                Podcast del foro
              </span>
              <h2 className="mt-3 text-2xl font-semibold text-white sm:text-[32px]">{podcastFeatured.title}</h2>
              {podcastFeatured.subtitle && (
                <p
                  className="mt-4 max-w-[54ch] text-[16px] italic"
                  style={{ fontFamily: 'var(--foro-font-serif)', color: '#eafafa', borderLeft: '2px solid rgba(255,255,255,.55)', paddingLeft: 18 }}
                >
                  {podcastFeatured.subtitle}
                </p>
              )}
              <div className="foro-card-meta mt-4" style={{ color: '#cdeeee' }}>
                <span className="foro-avatar" style={{ background: 'rgba(255,255,255,.18)', color: '#fff' }}>
                  {initialsOf(podcastFeatured.createdBy)}
                </span>
                <span>{podcastFeatured.createdBy}</span>
                <span className="foro-dotsep" style={{ background: '#8fd0d0' }} />
                <span>{formatForoDate(podcastFeatured.createdAt)}</span>
              </div>
              <div className="mt-6">
                <a className="foro-btn foro-btn-light" href={foroHref(`/publicaciones/${podcastFeatured.id}`)}>
                  Ver el episodio →
                </a>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl" style={{ boxShadow: '0 20px 50px -22px rgba(0,0,0,.4)' }}>
              <div
                className="flex aspect-square items-center justify-center"
                style={{ background: 'repeating-linear-gradient(45deg,#0a5354 0 11px,#094b4c 11px 22px)' }}
              >
                {podcastFeatured.imageUrl
                  ? <img src={podcastFeatured.imageUrl} alt="" className="h-full w-full object-cover" />
                  : <span className="text-[11px]" style={{ color: '#bfeaea', fontFamily: 'var(--foro-font-mono)' }}>cover</span>}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Closing CTA (solid navy) */}
      <section className="foro-band-navy text-center" style={{ padding: '56px 0' }}>
        <div className="foro-wrap">
          <h2 className="text-2xl font-semibold text-white sm:text-[32px]">{teaserText('cta_heading')}</h2>
          {/*
            Same `.foro-scope p { margin: 0 }` specificity issue as the intro
            subtitle above — `mx-auto`/`mt-3` were both silently nullified
            (0-1-1 beats 0-1-0), losing the top gap AND the horizontal
            centering. Both are set inline here to win.
          */}
          <p
            className="max-w-[50ch] text-[15.5px]"
            style={{ color: '#a9d2d6', marginTop: '1.5rem', marginLeft: 'auto', marginRight: 'auto' }}
          >
            {teaserText('cta_paragraph')}
          </p>
          <a
            className="foro-btn foro-btn-teal mt-6 inline-flex"
            // `.foro-scope a { color: var(--foro-teal-700) }` (0-1-1) beats
            // `.foro-btn-teal { color: #fff }` (0-1-0), rendering teal text
            // on the teal button background (invisible). Inline style wins.
            style={{ fontSize: '15.5px', padding: '15px 32px', color: '#fff' }}
            href={foroHref()}
          >
            {teaserText('cta')}
          </a>
        </div>
      </section>
    </div>
  )
}
