import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import WhatsAppFab from './WhatsAppFab'
import LoadingSpinner from './LoadingSpinner'
import { useSmoothScroll } from '@shared/hooks'
import { colors, layout } from '../../theme'

interface MainLayoutProps {
  children: ReactNode
}

const NAV_LINKS = [
  { label: 'Inicio', href: '/#hero' },
  { label: 'Nosotros', href: '/#about' },
  { label: 'Novedades', href: '/news' },
  { label: 'Contacto', href: '/#footer' },
  { label: 'Solicitar presupuesto', href: '/contact' },
] as const

const SERVICE_LINKS = [
  { label: 'Intervención Directa', href: '/servicios/intervencion-directa' },
  { label: 'Acompañamiento', href: '/servicios/acompanamiento' },
  { label: 'Selección de Personal', href: '/servicios/seleccion-de-personal' },
  { label: 'Consultoría para Empresario', href: '/servicios/clinica-para-empresarios' },
  { label: 'Traspaso Generacional', href: '/servicios/traspaso-generacional' },
] as const

const SEARCH_ITEMS = [
  ...NAV_LINKS.map((l) => ({ label: l.label, href: l.href })),
  ...SERVICE_LINKS.map((l) => ({ label: l.label, href: l.href })),
]

export default function MainLayout({ children }: MainLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const servicesTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [loading, setLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const lenisRef = useSmoothScroll()

  const isHome = location.pathname === '/'
  const headerActive = !isHome || scrolled

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
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1))
      if (el) {
        setTimeout(() => {
          if (lenisRef.current) {
            lenisRef.current.scrollTo(el, { offset: 0 })
          } else {
            el.scrollIntoView({ behavior: 'smooth' })
          }
        }, 100)
      }
    }
  }, [location, lenisRef])

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

  const handleSearchNavigate = useCallback((href: string) => {
    closeSearch()
    setMobileOpen(false)
    if (href.startsWith('/#')) {
      // Hash link on home
      if (location.pathname === '/') {
        const el = document.getElementById(href.slice(2))
        if (el) {
          if (lenisRef.current) lenisRef.current.scrollTo(el, { offset: 0 })
          else el.scrollIntoView({ behavior: 'smooth' })
        }
      } else {
        navigate(href)
      }
    } else {
      navigate(href)
    }
  }, [closeSearch, navigate, location.pathname, lenisRef])

  // Close search on Escape
  useEffect(() => {
    if (!searchOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [searchOpen, closeSearch])

  const renderNavLink = (l: (typeof NAV_LINKS)[number]) => {
    const isRoute = !l.href.startsWith('/#')
    if (isRoute) {
      return (
        <Link key={l.href} to={l.href} onClick={() => setMobileOpen(false)} className="nav-link md:text-xs lg:text-sm">
          {l.label}
        </Link>
      )
    }
    return (
      <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="nav-link md:text-xs lg:text-sm">
        {l.label}
      </a>
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
          <a href="/#hero" className="flex-shrink-0 flex items-center overflow-visible" style={{ height: headerActive ? '2.5rem' : '3rem' }}>
            <img
              src="/cpeLogo.png"
              className={`w-auto transition-all duration-500 ${headerActive ? 'h-44 sm:h-52 md:h-60 lg:h-72' : 'h-60 sm:h-72 md:h-80 lg:h-96'}`}
              alt="CPE Logo"
            />
          </a>

          <nav className="hidden min-w-0 flex-1 items-center justify-end gap-2 lg:gap-4 xl:gap-8 md:flex">
            {NAV_LINKS.slice(0, 2).map(renderNavLink)}
            <div className="relative"
              onMouseEnter={() => { clearTimeout(servicesTimeoutRef.current); setServicesOpen(true) }}
              onMouseLeave={() => { servicesTimeoutRef.current = setTimeout(() => setServicesOpen(false), 300) }}
            >
              <button type="button" className="nav-link inline-flex items-center gap-1 md:text-xs lg:text-sm" onClick={() => setServicesOpen((o) => !o)}>
                Servicios
                <svg className={`h-3.5 w-3.5 transition-transform duration-200 ${servicesOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {servicesOpen && (
                <div className="absolute left-1/2 top-full z-50 w-48 md:w-56 -translate-x-1/2 rounded-xl bg-white py-2 shadow-xl ring-1 ring-slate-200 before:absolute before:left-0 before:right-0 before:-top-4 before:h-4 before:content-[''] mt-1">
                  {SERVICE_LINKS.map((s) => (
                    <Link key={s.href} to={s.href} onClick={() => setServicesOpen(false)}
                      className="block px-4 py-2.5 text-sm transition-colors hover:text-white"
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
            {NAV_LINKS.slice(2, 4).map(renderNavLink)}
            <Link
              to="/contact"
              onClick={() => setMobileOpen(false)}
              className="whitespace-nowrap rounded-xl px-2.5 lg:px-3 xl:px-4 py-2 text-xs lg:text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: colors.ctaPrimary, boxShadow: `0 4px 14px ${colors.ctaShadow}` }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.ctaPrimaryHover }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.ctaPrimary }}
            >
              Solicitar presupuesto
            </Link>
            <a href="https://www.instagram.com/clinicaparaempresas" target="_blank" rel="noopener noreferrer"
              className="hidden transition-colors xl:inline-flex"
              style={{ color: headerActive ? colors.tealDeep : 'rgba(255,255,255,0.7)' }}
              aria-label="Instagram"
            >
              <svg className="h-4 w-4 lg:h-5 lg:w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            <a href="https://www.linkedin.com/company/cl%C3%ADnica-para-empresas/" target="_blank" rel="noopener noreferrer"
              className="hidden transition-colors xl:inline-flex"
              style={{ color: headerActive ? colors.tealDeep : 'rgba(255,255,255,0.7)' }}
              aria-label="LinkedIn"
            >
              <svg className="h-4 w-4 lg:h-5 lg:w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
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
          <div className={`border-t px-4 pb-4 md:hidden transition-colors duration-500 max-h-[70vh] overflow-y-auto ${
            headerActive ? 'border-gray-200 bg-white' : 'border-white/10'
          }`}
          style={{ backgroundColor: headerActive ? colors.white : colors.blueDark }}
          >
            <nav className="flex flex-col gap-3 pt-3">
              {NAV_LINKS.slice(0, 2).map(renderNavLink)}
              <div>
                <button type="button" onClick={() => setServicesOpen((o) => !o)}
                  className="nav-link inline-flex w-full items-center justify-between">
                  Servicios
                  <svg className={`h-4 w-4 transition-transform duration-200 ${servicesOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {servicesOpen && (
                  <div className="mt-1 flex flex-col gap-1 pl-4">
                    {SERVICE_LINKS.map((s) => (
                      <Link key={s.href} to={s.href} onClick={() => { setServicesOpen(false); setMobileOpen(false) }}
                        className="block rounded-lg px-3 py-2 text-sm transition-colors"
                        style={{ color: headerActive ? colors.blueDark : 'rgba(255,255,255,0.6)' }}
                      >
                        {s.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              {NAV_LINKS.slice(2, 4).map(renderNavLink)}
              <Link
                to="/contact"
                onClick={() => setMobileOpen(false)}
                className="mt-2 inline-block rounded-xl px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md transition-all"
                style={{ backgroundColor: colors.ctaPrimary, boxShadow: `0 4px 14px ${colors.ctaShadow}` }}
              >
                Solicitar presupuesto
              </Link>
              <div className="flex items-center gap-4">
                <a href="https://www.instagram.com/clinicaparaempresas" target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-sm transition-colors"
                  style={{ color: headerActive ? colors.tealDeep : 'rgba(255,255,255,0.7)' }}
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                  Instagram
                </a>
                <a href="https://www.linkedin.com/company/cl%C3%ADnica-para-empresas/" target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-sm transition-colors"
                  style={{ color: headerActive ? colors.tealDeep : 'rgba(255,255,255,0.7)' }}
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
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
        <div className={`${layout.container} ${layout.sectionPadY}`}>
          <div className="grid gap-[3vh] sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <img src="/cpeLogo.png" alt="CPE Logo" className="h-64 w-auto brightness-0 invert" />
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-white">Contacto</h4>
              <ul className="space-y-2 text-sm opacity-70">
                <li><a href="mailto:contacto@clinicaparaempresas.com" className="transition-colors hover:text-white">contacto@clinicaparaempresas.com</a></li>
                <li><a href="tel:+5493512180273" className="transition-colors hover:text-white">+54 9 351 218-0273</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-white">Legal</h4>
              <ul className="space-y-2 text-sm opacity-70">
                <li><Link to="/politica-de-privacidad" className="transition-colors hover:text-white">Política de privacidad</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-[4vh] border-t border-white/15 pt-[2vh] text-center text-xs opacity-50">
            © {new Date().getFullYear()} Clínica para Empresas. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
