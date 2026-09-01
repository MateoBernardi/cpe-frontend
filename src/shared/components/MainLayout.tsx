import { useState, useEffect, useRef, useCallback, type ReactNode, type MouseEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { contentKeys, contentService } from '@features/content'
import { INTERACCIONES_SECTIONS, HeaderProfileButton } from '@features/content/components/foro'
import WhatsAppFab from './WhatsAppFab'
import LoadingSpinner from './LoadingSpinner'
import { useSmoothScroll } from '@shared/hooks'
import { colors, layout } from '../../theme'

interface MainLayoutProps {
  children: ReactNode
}

interface DropdownLinkItem {
  label: string
  href: string
}

type NavLink = {
  kind: 'link'
  label: string
  href: string
  variant?: 'default' | 'cta'
}

type NavDropdown = {
  kind: 'dropdown'
  key: string
  label: string
  items: DropdownLinkItem[]
  /**
   * Cuando la ruta actual es uno de los ítems, el disparador muestra la
   * etiqueta de ese ítem en vez de la genérica — así el formato del Foro en el
   * que estás parado queda visible en la nav. No se activa en "Servicios",
   * cuyas etiquetas son largas y desbordarían la barra.
   */
  reflectActive?: boolean
}

type NavLinkItem = NavLink | NavDropdown

const SERVICE_LINKS: DropdownLinkItem[] = [
  { label: 'Intervención Directa', href: '/servicios/intervencion-directa' },
  { label: 'Acompañamiento a las personas', href: '/servicios/acompanamiento' },
  { label: 'Selección de Personal', href: '/servicios/seleccion-de-personal' },
]

const INTERACCIONES_LINKS: DropdownLinkItem[] = INTERACCIONES_SECTIONS.map((section) => ({
  label: section.label,
  href: `/interacciones/${section.path}`,
}))

const NAV_LINKS: NavLinkItem[] = [
  { kind: 'dropdown', key: 'servicios', label: 'Servicios', items: SERVICE_LINKS },
  { kind: 'dropdown', key: 'interacciones', label: 'Interacciones', items: INTERACCIONES_LINKS, reflectActive: true },
  { kind: 'link', label: 'Dejanos tu CV', href: '/servicios/seleccion-de-personal#postulaciones', variant: 'cta' },
  { kind: 'link', label: 'Solicitar presupuesto', href: '/contact', variant: 'cta' },
]

const SEARCH_ITEMS = NAV_LINKS.flatMap((l) =>
  l.kind === 'link' ? [{ label: l.label, href: l.href }] : l.items,
)

const HOME_SECTION_NAMES = [
  'hero',
  'about',
  'info_secondary',
  'secondary_hero',
] as const

// Social media links — shared across the header dropdown, the mobile panel and the footer.
// TODO(owner): reemplazar por la URL real del show de CPEVoz en Spotify.
const SPOTIFY_URL = 'https://open.spotify.com/'
const INSTAGRAM_URL = 'https://www.instagram.com/clinicaparaempresas'
const LINKEDIN_URL = 'https://www.linkedin.com/company/cl%C3%ADnica-para-empresas/'

function InstagramIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}

function LinkedInIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function SpotifyIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.1-10.561-1.14-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.019zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.3.421-1.02.599-1.559.3z" />
    </svg>
  )
}

type SocialLinkDef = {
  key: string
  href: string
  label: string
  Icon: (props: { className: string }) => ReactNode
}

const SOCIAL_LINKS: SocialLinkDef[] = [
  { key: 'instagram', href: INSTAGRAM_URL, label: 'Instagram', Icon: InstagramIcon },
  { key: 'linkedin', href: LINKEDIN_URL, label: 'LinkedIn', Icon: LinkedInIcon },
  { key: 'spotify', href: SPOTIFY_URL, label: 'Spotify', Icon: SpotifyIcon },
]

export default function MainLayout({ children }: MainLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const servicesTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [loading, setLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [desktopSocialsOpen, setDesktopSocialsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const lenisRef = useSmoothScroll()

  const isHome = location.pathname === '/'
  const headerActive = !isHome || scrolled

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
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
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

  // Search helpers
  const openSearch = useCallback(() => {
    setSearchQuery('')
    setSearchOpen(true)
    setTimeout(() => searchInputRef.current?.focus(), 50)
  }, [])

  const closeSearch = useCallback(() => {
    setSearchOpen(false)
    setSearchQuery('')
  }, [])

  const filteredSearch = SEARCH_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleHashNavigate = useCallback((href: string) => {
    const targetId = href.split('#')[1]
    setMobileOpen(false)
    setOpenDropdown(null)

    closeSearch()

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
  }, [closeSearch, location.hash, location.pathname, navigate, scrollToTarget])

  const handleSearchNavigate = useCallback((href: string) => {
    if (href.startsWith('/#')) {
      handleHashNavigate(href)
    } else {
      closeSearch()
      setMobileOpen(false)
      navigate(href)
    }
  }, [closeSearch, handleHashNavigate, navigate])

  // Close search on Escape
  useEffect(() => {
    if (!searchOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [searchOpen, closeSearch])

  const renderNavLink = (l: NavLink, extraClassName?: string) => {
    const isCta = l.variant === 'cta'
    const baseClassName = [
      isCta
        ? 'whitespace-nowrap rounded-xl px-2 lg:px-2 xl:px-2 py-2 text-xs lg:text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5'
        : 'nav-link md:text-xs lg:text-sm',
      extraClassName,
    ].filter(Boolean).join(' ')

    const baseStyle = isCta
      ? { backgroundColor: colors.ctaPrimary, boxShadow: `0 4px 14px ${colors.ctaShadow}` }
      : undefined

    const onMouseEnter = isCta
      ? (e: MouseEvent<HTMLElement>) => { e.currentTarget.style.backgroundColor = colors.ctaPrimaryHover }
      : undefined

    const onMouseLeave = isCta
      ? (e: MouseEvent<HTMLElement>) => { e.currentTarget.style.backgroundColor = colors.ctaPrimary }
      : undefined

    const isRoute = !l.href.startsWith('/#')
    if (isRoute) {
      return (
        <Link
          key={l.href}
          to={l.href}
          onClick={() => setMobileOpen(false)}
          className={baseClassName}
          style={baseStyle}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {l.label}
        </Link>
      )
    }
    return (
      <button
        key={l.href}
        type="button"
        onClick={() => handleHashNavigate(l.href)}
        className={baseClassName}
        style={baseStyle}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {l.label}
      </button>
    )
  }

  /**
   * Etiqueta del disparador del desplegable: la del ítem activo cuando la ruta
   * actual coincide con uno de ellos (p. ej. "Novedades" en
   * /interacciones/novedades), si no la genérica.
   */
  const dropdownTriggerLabel = (d: NavDropdown): string => {
    if (!d.reflectActive) return d.label
    const active = d.items.find((item) => location.pathname === item.href.split('#')[0])
    return active?.label ?? d.label
  }

  const renderDesktopDropdown = (d: NavDropdown) => {
    const isOpen = openDropdown === d.key
    return (
      <div
        key={d.key}
        className="relative"
        onMouseEnter={() => { clearTimeout(servicesTimeoutRef.current); setOpenDropdown(d.key) }}
        onMouseLeave={() => { servicesTimeoutRef.current = setTimeout(() => setOpenDropdown((cur) => (cur === d.key ? null : cur)), 300) }}
      >
        <button
          type="button"
          className="nav-link inline-flex items-center gap-1 md:text-xs lg:text-sm"
          onClick={() => setOpenDropdown((cur) => (cur === d.key ? null : d.key))}
        >
          {dropdownTriggerLabel(d)}
          <svg className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div className="absolute left-1/2 top-full z-50 w-48 md:w-56 -translate-x-1/2 rounded-xl bg-white py-2 shadow-xl ring-1 ring-slate-200 before:absolute before:left-0 before:right-0 before:-top-4 before:h-4 before:content-[''] mt-1">
            {d.items.map((s) => (
              <Link
                key={s.href}
                to={s.href}
                onClick={() => setOpenDropdown(null)}
                className="block px-2 py-2.5 text-sm transition-colors hover:text-white"
                style={{ color: colors.blueDark }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.tealMid; e.currentTarget.style.color = colors.white }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = colors.blueDark }}
              >
                {s.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderMobileDropdown = (d: NavDropdown) => {
    const isOpen = openDropdown === d.key
    return (
      <div key={d.key}>
        <button
          type="button"
          onClick={() => setOpenDropdown((cur) => (cur === d.key ? null : d.key))}
          className="nav-link relative block w-full text-center"
        >
          <span>{dropdownTriggerLabel(d)}</span>
          <svg className={`absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div className="mt-1 flex flex-col gap-1">
            {d.items.map((s) => (
              <Link
                key={s.href}
                to={s.href}
                onClick={() => { setOpenDropdown(null); setMobileOpen(false) }}
                className="block rounded-lg px-3 py-2 text-center text-sm transition-colors"
                style={{ color: headerActive ? colors.blueDark : 'rgba(255,255,255,0.6)' }}
              >
                {s.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden font-primary" style={{ backgroundColor: colors.blueDark, color: colors.white }}>
      {loading && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black ${fadeOut ? 'page-overlay-exit' : ''}`}>
          <LoadingSpinner size="lg" />
        </div>
      )}

      <header className={`fixed z-50 transition-all duration-500 ease-in-out ${
        headerActive
          ? 'top-5 left-3 right-3 md:left-6 md:right-6 lg:left-16 lg:right-16 xl:left-32 xl:right-32 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg header-scrolled'
          : 'top-4 left-0 right-0 bg-transparent backdrop-blur-sm'
      }`}>
        <div className={`${layout.container} flex items-center justify-between py-3 sm:py-4`}>
          <button
            type="button"
            onClick={() => handleHashNavigate('/#hero')}
            className="-ml-1 flex flex-shrink-0 items-center overflow-visible sm:-ml-2"
            style={{ height: headerActive ? '2.5rem' : '3rem' }}
          >
            <img
              src="/cpeLogo.png"
              // `pointer-events-none`: cpeLogo.png is a 1080x1350 canvas with the real 558x206
              // mark centered — 85% of it transparent padding (see the footer logo's crop, which
              // works around the same file). This `<img>` is deliberately rendered way taller
              // than the button's own box and left to overflow, so its transparent margins spill
              // out well past the header pill — without this, that invisible overflow was
              // swallowing clicks meant for whatever page content happened to sit underneath it
              // (e.g. the /perfil tab strip). The button's own (correctly small) box still
              // catches clicks on the visible logo.
              className={`pointer-events-none w-auto transition-all duration-500 ${headerActive ? 'h-44 sm:h-52 md:h-60 lg:h-72' : 'h-60 sm:h-72 md:h-80 lg:h-96'}`}
              alt="CPE Logo"
            />
          </button>

          <nav className="hidden min-w-0 flex-1 items-center justify-end gap-2 lg:gap-4 xl:gap-8 md:flex">
            {NAV_LINKS.map((item) => (item.kind === 'link' ? renderNavLink(item) : renderDesktopDropdown(item)))}
            <div className="relative hidden xl:block">
              <div className="flex items-center gap-1">
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
                  className={`transition-colors ${desktopSocialsOpen ? 'hidden' : 'inline-flex'}`}
                  style={{ color: headerActive ? colors.tealDeep : 'rgba(255,255,255,0.7)' }}
                  aria-label="Instagram"
                >
                  <InstagramIcon className="h-4 w-4 lg:h-5 lg:w-5" />
                </a>
                <button
                  type="button"
                  onClick={() => setDesktopSocialsOpen((o) => !o)}
                  className="transition-colors"
                  style={{ color: headerActive ? colors.tealDeep : 'rgba(255,255,255,0.7)' }}
                  aria-label="Mostrar redes"
                >
                  <svg className={`h-4 w-4 transition-transform duration-200 ${desktopSocialsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <div className={`absolute right-0 top-full mt-2 rounded-xl bg-white p-2 shadow-lg ring-1 ring-slate-200 transition-all duration-200 ${desktopSocialsOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-1 opacity-0'}`}>
                <div className="flex flex-col items-center gap-2">
                  <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
                    className="transition-colors"
                    style={{ color: colors.tealDeep }}
                    aria-label="Instagram"
                  >
                    <InstagramIcon className="h-4 w-4 lg:h-5 lg:w-5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleHashNavigate('/#footer')}
                    className="transition-colors"
                    style={{ color: colors.tealDeep }}
                    aria-label="Teléfono"
                  >
                    <svg className="h-4 w-4 lg:h-5 lg:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.129a11.042 11.042 0 005.516 5.516l1.129-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.95V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleHashNavigate('/#footer')}
                    className="transition-colors"
                    style={{ color: colors.tealDeep }}
                    aria-label="Correo"
                  >
                    <svg className="h-4 w-4 lg:h-5 lg:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l8.485 5.657a1 1 0 001.11 0L21 8m-18 8h18a2 2 0 002-2V8a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer"
                    className="transition-colors"
                    style={{ color: colors.tealDeep }}
                    aria-label="LinkedIn"
                  >
                    <LinkedInIcon className="h-4 w-4 lg:h-5 lg:w-5" />
                  </a>
                  <a href={SPOTIFY_URL} target="_blank" rel="noopener noreferrer"
                    className="transition-colors"
                    style={{ color: colors.tealDeep }}
                    aria-label="Spotify"
                  >
                    <SpotifyIcon className="h-4 w-4 lg:h-5 lg:w-5" />
                  </a>
                </div>
              </div>
            </div>
            {/* Search icon */}
            <button
              type="button"
              onClick={openSearch}
              className="flex-shrink-0 transition-colors"
              style={{ color: headerActive ? colors.tealDeep : 'rgba(255,255,255,0.7)' }}
              aria-label="Buscar"
            >
              <svg className="h-4 w-4 lg:h-5 lg:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
            <HeaderProfileButton headerActive={headerActive} />
          </nav>

          <button type="button" onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-md p-2 md:hidden transition-colors"
            style={{ color: headerActive ? colors.tealDeep : 'rgba(255,255,255,0.7)' }}
            aria-label="Menú"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {mobileOpen && (
          /* `data-lenis-prevent` no es opcional: Lenis captura el scroll de la
             página entera, así que sin esto el panel NO scrollea y todo lo que
             pase de `max-h` queda cortado — que es por qué la fila de iconos de
             redes se veía tajeada por abajo. Ver la regla
             `.lenis.lenis-smooth [data-lenis-prevent]` en `index.css`. */
          <div
            data-lenis-prevent
            className={`border-t px-4 pb-6 md:hidden transition-colors duration-500 max-h-[75vh] overflow-y-auto overscroll-contain ${
              headerActive ? 'border-gray-200 bg-white' : 'border-white/10'
            }`}
            style={{ backgroundColor: headerActive ? colors.white : colors.blueDark }}
          >
            <nav className="flex flex-col gap-3 pt-3">
              {NAV_LINKS.map((item) => (
                item.kind === 'link'
                  ? renderNavLink(item, 'block w-full text-center')
                  : renderMobileDropdown(item)
              ))}
              <div className="w-full">
                {/* `variant="full"`: en el panel mobile el perfil es un ítem más
                    del nav (avatar + nombre completo), no el círculo de
                    iniciales del header de escritorio, que acá quedaba como una
                    bolita suelta en una esquina. */}
                <HeaderProfileButton headerActive={headerActive} variant="full" onNavigate={() => setMobileOpen(false)} />
              </div>
              <div className="mt-2 grid grid-cols-5 gap-2">
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 items-center justify-center rounded-lg transition-colors"
                  style={{ color: headerActive ? colors.tealDeep : 'rgba(255,255,255,0.7)' }}
                  aria-label="Instagram"
                >
                  <InstagramIcon className="h-5 w-5" />
                </a>
                <button
                  type="button"
                  onClick={() => handleHashNavigate('/#footer')}
                  className="flex h-10 items-center justify-center rounded-lg transition-colors"
                  style={{ color: headerActive ? colors.tealDeep : 'rgba(255,255,255,0.7)' }}
                  aria-label="Teléfono"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.129a11.042 11.042 0 005.516 5.516l1.129-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.95V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleHashNavigate('/#footer')}
                  className="flex h-10 items-center justify-center rounded-lg transition-colors"
                  style={{ color: headerActive ? colors.tealDeep : 'rgba(255,255,255,0.7)' }}
                  aria-label="Correo"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l8.485 5.657a1 1 0 001.11 0L21 8m-18 8h18a2 2 0 002-2V8a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                </button>
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 items-center justify-center rounded-lg transition-colors"
                  style={{ color: headerActive ? colors.tealDeep : 'rgba(255,255,255,0.7)' }}
                  aria-label="LinkedIn"
                >
                  <LinkedInIcon className="h-5 w-5" />
                </a>
                <a
                  href={SPOTIFY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 items-center justify-center rounded-lg transition-colors"
                  style={{ color: headerActive ? colors.tealDeep : 'rgba(255,255,255,0.7)' }}
                  aria-label="Spotify"
                >
                  <SpotifyIcon className="h-5 w-5" />
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] sm:pt-[15vh]">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeSearch} />
          {/* Panel */}
          <div className="relative z-10 w-[90vw] max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden">
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
              <svg className="h-5 w-5 flex-shrink-0" style={{ color: colors.tealMid }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar sección..."
                className="flex-1 bg-transparent text-base outline-none placeholder:text-slate-400"
                style={{ color: colors.blueDark }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filteredSearch.length > 0) {
                    handleSearchNavigate(filteredSearch[0].href)
                  }
                }}
              />
              <button type="button" onClick={closeSearch} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto py-2">
              {filteredSearch.length === 0 ? (
                <p className="px-5 py-4 text-sm text-slate-400">No se encontraron resultados.</p>
              ) : (
                filteredSearch.map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => handleSearchNavigate(item.href)}
                    className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm transition-colors hover:text-white"
                    style={{ color: colors.blueDark }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.tealMid; e.currentTarget.style.color = colors.white }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = colors.blueDark }}
                  >
                    <svg className="h-4 w-4 flex-shrink-0 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                    {item.label}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <main>{children}</main>

      <WhatsAppFab />

      <footer id="footer" style={{ backgroundColor: colors.footerBg, color: colors.footerText }}>
        <div className={`${layout.container} py-10 md:py-14`}>
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:gap-10 sm:text-left">
            {/* cpeLogo.png es un lienzo 1080x1350 con la marca real de 558x206
                centrada — el 85% del alto es transparente. Por eso `h-8` lo
                dejaba en una mota: la caja medía 25px y la marca era una
                fracción de eso. Acá se recorta al bbox real (misma técnica que
                el circuito) en vez de agrandar la img y desbordarla como hace
                el header. */}
            <div className="relative aspect-[558/206] h-8 shrink-0 overflow-hidden sm:h-10">
              <img
                src="/cpeLogo.png"
                alt="CPE Logo"
                className="absolute left-[-47.13%] top-[-277.18%] h-[655.34%] w-[193.55%] max-w-none brightness-0 invert"
              />
            </div>

            {/* 2x2: mail y teléfono apilados en la columna izquierda, política de
                privacidad centrada contra ambos en la derecha. `grid-flow-col`
                es lo que llena por columna en vez de por fila. */}
            <ul className="grid grid-flow-col grid-cols-2 grid-rows-2 gap-x-10 gap-y-2 text-xs opacity-70 sm:text-sm">
              <li><a href="mailto:contacto@clinicaparaempresas.com" className="transition-colors hover:text-white">contacto@clinicaparaempresas.com</a></li>
              <li><a href="tel:+5493512180273" className="transition-colors hover:text-white">+54 9 351 218-0273</a></li>
              <li className="row-span-2 self-start"><Link to="/politica-de-privacidad" className="transition-colors hover:text-white">Política de privacidad</Link></li>
            </ul>

            <div className="flex flex-shrink-0 items-center gap-3">
              {SOCIAL_LINKS.map(({ key, href, label, Icon }) => (
                <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="opacity-70 transition-opacity hover:opacity-100" aria-label={label}>
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-3 border-t border-white/15 pt-2 text-center text-[11px] opacity-50">
            © {new Date().getFullYear()} Clínica para Empresas. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
