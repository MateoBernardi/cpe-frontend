import { useState, useEffect, useRef, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import WhatsAppFab from './WhatsAppFab'
import LoadingSpinner from './LoadingSpinner'
import { useSmoothScroll } from '@shared/hooks'

interface MainLayoutProps {
  children: ReactNode
}

/** Links con ancla al home | rutas propias */
const NAV_LINKS = [
  { label: 'Inicio', href: '/#hero' },
  { label: 'Nosotros', href: '/#about' },
  { label: 'Novedades', href: '/news' },
  { label: 'Contacto', href: '/contact' },
] as const

const SERVICE_LINKS = [
  { label: 'Intervención Directa', href: '/servicios/intervencion-directa' },
  { label: 'Selección de Personal', href: '/servicios/seleccion-de-personal' },
  { label: 'Acompañamiento', href: '/servicios/acompanamiento' },
] as const

export default function MainLayout({ children }: MainLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const servicesTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const [loading, setLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const lenisRef = useSmoothScroll()

  // On sub-pages (anything other than "/"), header always looks scrolled (white bg)
  const isHome = location.pathname === '/'
  const headerActive = !isHome || scrolled

  // Splash screen: logo 1.5s → fade out 0.8s
  useEffect(() => {
    const t1 = setTimeout(() => setFadeOut(true), 1500)
    const t2 = setTimeout(() => setLoading(false), 2300)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  // Shrink header on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scroll to hash after navigation (using Lenis when available)
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

  const renderNavLink = (l: (typeof NAV_LINKS)[number]) => {
    const isRoute = !l.href.startsWith('/#')
    if (isRoute) {
      return (
        <Link
          key={l.href}
          to={l.href}
          onClick={() => setMobileOpen(false)}
          className="nav-link"
        >
          {l.label}
        </Link>
      )
    }
    return (
      <a
        key={l.href}
        href={l.href}
        onClick={() => setMobileOpen(false)}
        className="nav-link"
      >
        {l.label}
      </a>
    )
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-950 text-white">
      {/* ── Splash overlay ── */}
      {loading && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center bg-black ${fadeOut ? 'page-overlay-exit' : ''}`}
        >
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* ── Fixed Header — shrinks on scroll ── */}
      <header className={`fixed z-50 transition-all duration-500 ease-in-out ${
        headerActive
          ? 'top-3 left-3 right-3 md:left-6 md:right-6 lg:left-16 lg:right-16 xl:left-32 xl:right-32 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg header-scrolled'
          : 'top-0 left-0 right-0 bg-transparent backdrop-blur-sm'
      }`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <a href="/#hero" className="flex-shrink-0">
            <img src="/cpeLoading.png" className={`w-auto transition-all duration-500 ${headerActive ? 'h-16 sm:h-20 lg:h-24' : 'h-40 sm:h-50'}`} alt="CPE Logo" />
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.slice(0, 2).map(renderNavLink)}

            {/* Servicios dropdown */}
            <div
              className="relative"
              onMouseEnter={() => { clearTimeout(servicesTimeoutRef.current); setServicesOpen(true) }}
              onMouseLeave={() => { servicesTimeoutRef.current = setTimeout(() => setServicesOpen(false), 300) }}
            >
              <button
                type="button"
                className="nav-link inline-flex items-center gap-1"
                onClick={() => setServicesOpen((o) => !o)}
              >
                Servicios
                <svg className={`h-3.5 w-3.5 transition-transform duration-200 ${servicesOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {servicesOpen && (
                <div className="absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 rounded-xl bg-white py-2 shadow-xl ring-1 ring-slate-200 before:absolute before:left-0 before:right-0 before:-top-4 before:h-4 before:content-[''] mt-1">
                  {SERVICE_LINKS.map((s) => (
                    <Link
                      key={s.href}
                      to={s.href}
                      onClick={() => setServicesOpen(false)}
                      className="block px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-teal-50 hover:text-teal-700"
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {NAV_LINKS.slice(2).map(renderNavLink)}

            {/* Instagram icon */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`transition-colors ${headerActive ? 'text-teal-600 hover:text-teal-800' : 'text-white/70 hover:text-white'}`}
              aria-label="Instagram"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
          </nav>

          {/* Mobile burger */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`rounded-md p-2 md:hidden transition-colors ${headerActive ? 'text-teal-700' : 'text-white/70'}`}
            aria-label="Menú"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className={`border-t px-4 pb-4 md:hidden transition-colors duration-500 ${
            headerActive ? 'border-gray-200 bg-white' : 'border-white/10 bg-slate-900'
          }`}>
            <nav className="flex flex-col gap-3 pt-3">
              {NAV_LINKS.slice(0, 2).map(renderNavLink)}

              {/* Servicios collapsible */}
              <div>
                <button
                  type="button"
                  onClick={() => setServicesOpen((o) => !o)}
                  className={`nav-link inline-flex w-full items-center justify-between`}
                >
                  Servicios
                  <svg className={`h-4 w-4 transition-transform duration-200 ${servicesOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {servicesOpen && (
                  <div className="mt-1 flex flex-col gap-1 pl-4">
                    {SERVICE_LINKS.map((s) => (
                      <Link
                        key={s.href}
                        to={s.href}
                        onClick={() => { setServicesOpen(false); setMobileOpen(false) }}
                        className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                          headerActive ? 'text-slate-600 hover:bg-teal-50 hover:text-teal-700' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        {s.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {NAV_LINKS.slice(2).map(renderNavLink)}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 text-sm transition-colors ${
                  headerActive ? 'text-teal-600 hover:text-teal-800' : 'text-white/70 hover:text-white'
                }`}
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
                Instagram
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* ── Main content ── */}
      <main>
        {children}
      </main>

      {/* ── WhatsApp FAB ── */}
      <WhatsAppFab />

      {/* ── Footer ── */}
      <footer className="bg-slate-950 text-slate-400 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
                  CPE
                </div>
                <span className="font-bold text-white">Clínica para Empresas</span>
              </div>
              <p className="text-sm leading-relaxed">
                Soluciones integrales de salud ocupacional para empresas.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-white">Contacto</h4>
              <ul className="space-y-2 text-sm">
                <li>info@clinicaparaempresas.com</li>
                <li>+54 11 1234-5678</li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-white">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="transition-colors hover:text-white">Política de privacidad</a></li>
                <li><a href="#" className="transition-colors hover:text-white">Términos y condiciones</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs">
            © {new Date().getFullYear()} Clínica para Empresas. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
