import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { contentKeys, contentService } from '@features/content'
import WhatsAppFab from './WhatsAppFab'
import LoadingSpinner from './LoadingSpinner'
import SiteHeader, { type SiteHeaderNavItem, type SiteHeaderSearchItem } from './SiteHeader'
import SiteFooter from './SiteFooter'
import { useSmoothScroll } from '@shared/hooks'
import { colors } from '../../theme'

interface MainLayoutProps {
  children: ReactNode
}

interface NavLinkItem {
  label: string
  href: string
  variant?: 'default' | 'cta'
  /** Links elsewhere entirely (e.g. the Foro sub-app) — renders a plain <a>, never react-router's <Link>. */
  external?: boolean
}

interface ServiceLinkItem {
  label: string
  href: string
}

/** Foro sub-app base URL — production points at its own subdomain; dev/preview falls back to the co-hosted multi-page entry. */
const FORO_URL = (import.meta.env.VITE_FORO_URL as string | undefined) ?? '/foro.html'

const NAV_LINKS: NavLinkItem[] = [
  { label: 'Inicio', href: '/#hero' },
  { label: 'Nosotros', href: '/#about' },
  { label: 'Foro', href: FORO_URL, external: true },
  { label: 'Dejanos tu CV', href: '/servicios/seleccion-de-personal#postulaciones', variant: 'cta' },
  { label: 'Solicitar presupuesto', href: '/contact', variant: 'cta' },
]

const SERVICE_LINKS: ServiceLinkItem[] = [
  { label: 'Intervención Directa', href: '/servicios/intervencion-directa' },
  { label: 'Acompañamiento a las personas', href: '/servicios/acompanamiento' },
  { label: 'Selección de Personal', href: '/servicios/seleccion-de-personal' },
  { label: 'Consultoría para el Empresario', href: '/servicios/clinica-para-empresarios' },
  { label: 'Traspaso Generacional', href: '/servicios/traspaso-generacional' },
]

const SEARCH_ITEMS = [
  ...NAV_LINKS.map((l) => ({ label: l.label, href: l.href, external: l.external })),
  ...SERVICE_LINKS.map((l) => ({ label: l.label, href: l.href, external: false })),
]

const HOME_SECTION_NAMES = [
  'hero',
  'about',
  'teaser_circuit',
  'teaser_clinica',
  'teaser_traspaso',
  'info_primary',
  'info_secondary',
  'secondary_hero',
] as const

export default function MainLayout({ children }: MainLayoutProps) {
  const [loading, setLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const lenisRef = useSmoothScroll()

  const isHome = location.pathname === '/'

  const scrollToTarget = useCallback((el: HTMLElement) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: 0 })
    } else {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [lenisRef])

  useEffect(() => {
    const t1 = setTimeout(() => setFadeOut(true), 1500)
    const t2 = setTimeout(() => setLoading(false), 2300)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  useEffect(() => {
    if (!location.hash) return

    const targetId = location.hash.slice(1)
    const isFooterTarget = targetId === 'footer'
    const headerOffset = 110
    let attempts = 0
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const isAtPageBottom = () => {
      const doc = document.documentElement
      return Math.abs(window.scrollY + window.innerHeight - doc.scrollHeight) <= 2
    }

    const isTargetReached = (el: HTMLElement) => el.getBoundingClientRect().top <= headerOffset

    const tryScroll = () => {
      const el = document.getElementById(targetId)
      if (el) {
        scrollToTarget(el)
      }

      const shouldRetryTarget = !el || !isTargetReached(el)
      const shouldRetryFooter = isFooterTarget && !isAtPageBottom()
      const shouldRetry = attempts < 30 && (shouldRetryTarget || shouldRetryFooter)
      if (shouldRetry) {
        attempts += 1
        timeoutId = setTimeout(tryScroll, 120)
      }
    }

    timeoutId = setTimeout(tryScroll, 0)

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [location.hash, location.pathname, scrollToTarget])

  useEffect(() => {
    if (location.hash) return

    const goTop = () => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0, { immediate: true })
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }

    goTop()
    const raf = requestAnimationFrame(goTop)
    const timeoutId = setTimeout(goTop, 120)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timeoutId)
    }
  }, [location.pathname, location.hash, lenisRef])

  useEffect(() => {
    const prefetchHome = () => {
      HOME_SECTION_NAMES.forEach((sectionName) => {
        void queryClient.prefetchQuery({
          queryKey: contentKeys.publicSection(sectionName),
          queryFn: () => contentService.getPublicSection(sectionName),
        })
      })
    }

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(prefetchHome)
      return () => window.cancelIdleCallback(idleId)
    }

    const timeoutId = setTimeout(prefetchHome, 250)
    return () => clearTimeout(timeoutId)
  }, [queryClient])

  const handleHashNavigate = useCallback((href: string) => {
    const targetId = href.split('#')[1]

    if (!targetId) {
      navigate(href)
      return
    }

    const normalizedHash = `#${targetId}`

    if (location.pathname === '/' && location.hash === normalizedHash) {
      const el = document.getElementById(targetId)
      if (el) scrollToTarget(el)
      return
    }

    navigate({ pathname: '/', hash: normalizedHash })
  }, [location.hash, location.pathname, navigate, scrollToTarget])

  const handleSearchNavigate = useCallback((href: string, external?: boolean) => {
    if (external) {
      window.location.href = href
      return
    }
    if (href.startsWith('/#')) {
      handleHashNavigate(href)
    } else {
      navigate(href)
    }
  }, [handleHashNavigate, navigate])

  // Maps a plain NAV_LINKS entry to a SiteHeader nav item: external links stay
  // real <a> tags, in-app routes stay <Link>s, and "/#section" entries become
  // header-owned actions that drive the hash-scroll logic above.
  const toNavItem = useCallback((l: NavLinkItem): SiteHeaderNavItem => {
    if (l.external) {
      return { type: 'link', key: l.href, label: l.label, href: l.href, variant: l.variant, external: true }
    }
    if (l.href.startsWith('/#')) {
      return { type: 'action', key: l.href, label: l.label, variant: l.variant, onSelect: () => handleHashNavigate(l.href) }
    }
    return { type: 'link', key: l.href, label: l.label, href: l.href, variant: l.variant }
  }, [handleHashNavigate])

  const navItems: SiteHeaderNavItem[] = [
    ...NAV_LINKS.slice(0, 2).map(toNavItem),
    { type: 'dropdown', key: 'servicios', label: 'Servicios', items: SERVICE_LINKS },
    ...NAV_LINKS.slice(2).map(toNavItem),
  ]

  const searchItems: SiteHeaderSearchItem[] = SEARCH_ITEMS.map((item) => ({
    label: item.label,
    onSelect: () => handleSearchNavigate(item.href, item.external),
  }))

  return (
    <div className="min-h-screen w-full overflow-x-hidden font-primary" style={{ backgroundColor: colors.blueDark, color: colors.white }}>
      {loading && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black ${fadeOut ? 'page-overlay-exit' : ''}`}>
          <LoadingSpinner size="lg" />
        </div>
      )}

      <SiteHeader
        navItems={navItems}
        onLogoClick={() => handleHashNavigate('/#hero')}
        searchItems={searchItems}
        forceActive={!isHome}
        onContactClick={() => handleHashNavigate('/#footer')}
      />

      <main>{children}</main>

      <WhatsAppFab />

      <SiteFooter privacyTo="/politica-de-privacidad" />
    </div>
  )
}
