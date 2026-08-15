import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForoAuth, canAuthor, canPublish } from '@features/foro'
import { hexToRgba } from '@features/content/components/foro'
import { colors, layout } from '@/theme'
import CuentaPanel from './panels/CuentaPanel'
import GuardadosPanel from './panels/GuardadosPanel'
import InteraccionesPanel from './panels/InteraccionesPanel'
import MisPublicacionesPanel from './panels/MisPublicacionesPanel'
import RevisionesPanel from './panels/RevisionesPanel'

type PanelSlug = 'cuenta' | 'guardados' | 'interacciones' | 'publicaciones' | 'revisiones'

interface PanelDef {
  slug: PanelSlug
  label: string
}

const DEFAULT_PANEL: PanelSlug = 'cuenta'

const BASE_PANELS: PanelDef[] = [
  { slug: 'cuenta', label: 'Cuenta' },
  { slug: 'guardados', label: 'Guardados' },
  { slug: 'interacciones', label: 'Interacciones' },
]

/** Authoring is author-gated (`canAuthor`), not publisher-only: visitors submit into the review
 *  workflow from here too — same composer, gated down to `paper`/`discusion` and forced into
 *  `under_review` instead of `published` (see `PublicarPage.tsx`/`PublicationComposer.tsx`). */
const PUBLISHER_PANEL: PanelDef = { slug: 'publicaciones', label: 'Mis publicaciones' }

/** Reviewing visitor submissions is publisher-gated too, same `canPublish(role)` check as
 *  `PUBLISHER_PANEL` — only publishers act as reviewers (D59's "any publisher = moderator"). */
const REVIEW_PANEL: PanelDef = { slug: 'revisiones', label: 'Revisiones pendientes' }

interface PillRect { left: number; top: number; width: number; height: number }

/** Module-level so the effects below need no memoized callback (the React Compiler
 *  lint rejects a `useCallback` keyed on the derived active panel). */
function measureTab(el: HTMLAnchorElement | null | undefined): PillRect | null {
  if (!el) return null
  const rect = { left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight }
  // A collapsed (display:none) strip measures 0 — keep the last good rect instead,
  // so re-expanding doesn't animate the pill in from the corner.
  return rect.width > 0 ? rect : null
}

/**
 * `/perfil` (index) and `/perfil/:panel` both render this component — the
 * URL param picks the active panel, defaulting to "Cuenta" on the bare
 * index route so every panel stays linkable. Sub-nav follows the
 * `AdminLayout` `navItems` pattern, styled after `ForoAuthDialog`'s
 * segmented tab strip but with real tab semantics (that dialog has none).
 */
export default function ProfilePage() {
  const { panel } = useParams<{ panel?: string }>()
  const { role } = useForoAuth()

  const panels = canAuthor(role)
    ? canPublish(role)
      ? [...BASE_PANELS, PUBLISHER_PANEL, REVIEW_PANEL]
      : [...BASE_PANELS, PUBLISHER_PANEL]
    : BASE_PANELS
  const requestedSlug = (panel ?? DEFAULT_PANEL) as PanelSlug
  const active = panels.find((p) => p.slug === requestedSlug) ?? panels[0]

  // The active pill is a single absolutely-positioned element measured from the
  // active tab, so it glides between tabs instead of cutting. Position comes from
  // `offsetLeft/Top` — the tabs' offsetParent is the (relative) track, and reading
  // top/height too means it still lands correctly when the tabs wrap to a second
  // row on narrow screens.
  const trackRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Partial<Record<PanelSlug, HTMLAnchorElement | null>>>({})
  const [pill, setPill] = useState<PillRect | null>(null)
  // Gates the transition so the pill doesn't fly in from 0,0 on first paint.
  const [hasMeasured, setHasMeasured] = useState(false)
  // Mobile only: the tab strip collapses behind a disclosure. Desktop ignores this.
  const [menuOpen, setMenuOpen] = useState(false)

  const activeSlug = active.slug

  useLayoutEffect(() => {
    const rect = measureTab(tabRefs.current[activeSlug])
    if (rect) setPill(rect)
    const id = requestAnimationFrame(() => setHasMeasured(true))
    return () => cancelAnimationFrame(id)
    // `menuOpen` matters on mobile: the strip is display:none while collapsed and
    // only has real offsets once expanded.
  }, [activeSlug, menuOpen])

  // Re-measure when the track reflows: viewport resize, font swap, or the
  // publisher tab appearing once the session resolves.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const observer = new ResizeObserver(() => {
      const rect = measureTab(tabRefs.current[activeSlug])
      if (rect) setPill(rect)
    })
    observer.observe(track)
    return () => observer.disconnect()
  }, [activeSlug])

  return (
    <div className="pt-[22vh] pb-[6vh] sm:pb-[8vh] md:pb-[10vh]" style={{ backgroundColor: colors.white }}>
      <div className={layout.container}>
        <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: colors.blueDark }}>
          Mi perfil
        </h1>

        {/* Glass segmented control, matching the publication hero's "Guardar" /
            "Compartir" pills exactly: rounded-full, navy scrim at 0.45, accent
            hairline, backdrop-blur-md. Those pills only read as glass because
            something dark sits behind them, so the track carries the same
            navy→teal gradient ArticleHero falls back to when a publication has
            no cover image — that's the surface this overlays. `w-fit` keeps the
            track hugging the tabs instead of spanning the container. */}
        {/* Mobile disclosure trigger. Below md the five tabs wrap into a stack, so
            they collapse behind the current panel's name. Desktop never sees this
            button, and the strip below stays permanently open at md+. */}
        <button
          type="button"
          className="mt-6 flex w-full items-center justify-between rounded-full px-4 py-2.5 text-[13.5px] font-semibold text-white md:hidden"
          style={{ backgroundImage: `linear-gradient(135deg, ${colors.blueDark}, ${colors.tealDeep})` }}
          aria-expanded={menuOpen}
          aria-controls="perfil-tablist"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {active.label}
          <svg
            viewBox="0 0 24 24"
            width={18}
            height={18}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={`transition-transform duration-200 motion-reduce:transition-none ${menuOpen ? 'rotate-180' : ''}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        <div
          ref={trackRef}
          id="perfil-tablist"
          role="tablist"
          aria-label="Secciones del perfil"
          className={[
            // Stacked in a column on mobile, `rounded-full` reads as a circle —
            // it only looks like a pill once the tabs actually lay out
            // horizontally at md+. Below md the track (and its tabs/pill below)
            // use a softer rectangular radius instead.
            'relative w-full flex-col gap-1 rounded-2xl p-1 md:rounded-full',
            menuOpen ? 'mt-2 flex' : 'hidden',
            // md+: always visible, horizontal, hugging its tabs.
            'md:mt-6 md:flex md:w-fit md:max-w-full md:flex-row md:flex-wrap',
          ].join(' ')}
          style={{ backgroundImage: `linear-gradient(135deg, ${colors.blueDark}, ${colors.tealDeep})` }}
        >
          {pill && (
            <span
              aria-hidden="true"
              // The radius swap has to be a class, not an inline style: it's a
              // breakpoint decision, and inline styles can't carry a media query.
              // Mirrors the track/tabs' own swap so the sliding pill never reads
              // as a perfect circle while the tabs are stacked.
              className="pointer-events-none absolute rounded-xl backdrop-blur-md motion-reduce:transition-none md:rounded-full"
              style={{
                transform: `translate3d(${pill.left}px, ${pill.top}px, 0)`,
                width: pill.width,
                height: pill.height,
                left: 0,
                top: 0,
                backgroundColor: hexToRgba(colors.blueDark, 0.45),
                border: `1px solid ${hexToRgba(colors.ctaPrimary, 0.85)}`,
                transition: hasMeasured
                  ? 'transform 260ms cubic-bezier(0.4, 0, 0.2, 1), width 260ms cubic-bezier(0.4, 0, 0.2, 1), height 260ms cubic-bezier(0.4, 0, 0.2, 1)'
                  : undefined,
              }}
            />
          )}

          {panels.map((p) => {
            const isActive = p.slug === active.slug
            return (
              <Link
                key={p.slug}
                ref={(el) => { tabRefs.current[p.slug] = el }}
                to={`/perfil/${p.slug}`}
                role="tab"
                id={`perfil-tab-${p.slug}`}
                aria-selected={isActive}
                aria-controls={`perfil-panel-${p.slug}`}
                onClick={() => setMenuOpen(false)}
                className={[
                  // `relative` keeps the label above the sliding pill.
                  'relative border border-transparent px-4 py-2 text-[13.5px] font-semibold transition-colors duration-200',
                  // Stacked on mobile: full-width rows reading left-to-right, so
                  // the open menu is a proper box of options. At md+ they go back
                  // to hugging pills in a row.
                  'block w-full rounded-xl text-left md:inline-block md:w-auto md:rounded-full md:text-center',
                  isActive ? 'text-white' : 'text-white/70 hover:text-white',
                ].join(' ')}
              >
                {p.label}
              </Link>
            )
          })}
        </div>

        <div
          role="tabpanel"
          id={`perfil-panel-${active.slug}`}
          aria-labelledby={`perfil-tab-${active.slug}`}
          className="mt-8"
        >
          {active.slug === 'cuenta' && <CuentaPanel />}
          {active.slug === 'guardados' && <GuardadosPanel />}
          {active.slug === 'interacciones' && <InteraccionesPanel />}
          {active.slug === 'publicaciones' && <MisPublicacionesPanel />}
          {active.slug === 'revisiones' && <RevisionesPanel />}
        </div>
      </div>
    </div>
  )
}
