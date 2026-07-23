import { useState, useEffect, useRef, useCallback, type ReactNode, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { colors, layout } from '../../theme'

/** A plain nav entry — renders as an `<a>` when `external`, otherwise a react-router `<Link>`. */
export interface SiteHeaderLinkItem {
  type: 'link'
  key: string
  label: string
  href: string
  variant?: 'default' | 'cta'
  external?: boolean
  active?: boolean
}

/** A nav entry whose click is fully owned by the caller (e.g. hash-scrolling on the home page). */
export interface SiteHeaderActionItem {
  type: 'action'
  key: string
  label: string
  variant?: 'default' | 'cta'
  active?: boolean
  onSelect: () => void
}

/** A hover/tap dropdown (e.g. "Servicios") — its entries are always internal routes. */
export interface SiteHeaderDropdownItem {
  type: 'dropdown'
  key: string
  label: string
  items: { label: string; href: string }[]
}

export type SiteHeaderNavItem = SiteHeaderLinkItem | SiteHeaderActionItem | SiteHeaderDropdownItem

export interface SiteHeaderSearchItem {
  label: string
  onSelect: () => void
}

export interface SiteHeaderProps {
  /** Ordered nav entries rendered both in the desktop bar and the mobile drawer. */
  navItems: SiteHeaderNavItem[]
  /** Called when the CPE logo/wordmark is clicked. */
  onLogoClick: () => void
  /** Drives the command-palette search overlay; Enter selects the first match. */
  searchItems: SiteHeaderSearchItem[]
  /** Extra node rendered in the actions cluster (e.g. the foro's `<SubscribeButton/>`). */
  trailing?: ReactNode
  /** Forces the "scrolled" (white pill) visual state regardless of actual scroll position. */
  forceActive?: boolean
  /** Called when the phone/email icons in the socials cluster are clicked. */
  onContactClick?: () => void
}

function InstagramIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}

function LinkedInIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function PhoneIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.129a11.042 11.042 0 005.516 5.516l1.129-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.95V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )
}

function MailIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l8.485 5.657a1 1 0 001.11 0L21 8m-18 8h18a2 2 0 002-2V8a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z" />
    </svg>
  )
}

export default function SiteHeader({ navItems, onLogoClick, searchItems, trailing, forceActive, onContactClick }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdownKey, setOpenDropdownKey] = useState<string | null>(null)
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [scrolled, setScrolled] = useState(false)
  const [desktopSocialsOpen, setDesktopSocialsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  const headerActive = Boolean(forceActive) || scrolled

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const openSearch = useCallback(() => {
    setSearchQuery('')
    setSearchOpen(true)
    setTimeout(() => searchInputRef.current?.focus(), 50)
  }, [])

  const closeSearch = useCallback(() => {
    setSearchOpen(false)
    setSearchQuery('')
  }, [])

  useEffect(() => {
    if (!searchOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [searchOpen, closeSearch])

  const filteredSearch = searchItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSearchSelect = useCallback((item: SiteHeaderSearchItem) => {
    closeSearch()
    setMobileOpen(false)
    setOpenDropdownKey(null)
    item.onSelect()
  }, [closeSearch])

  const contactHandler = onContactClick ?? (() => {})

  const linkOrActionClassName = (item: SiteHeaderLinkItem | SiteHeaderActionItem, extraClassName?: string) => {
    const isCta = item.variant === 'cta'
    return [
      isCta
        ? 'whitespace-nowrap rounded-xl px-2 lg:px-2 xl:px-2 py-2 text-xs lg:text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5'
        : `nav-link md:text-xs lg:text-sm${item.active ? ' active' : ''}`,
      extraClassName,
    ].filter(Boolean).join(' ')
  }

  const renderNavItem = (item: SiteHeaderNavItem, extraClassName?: string) => {
    if (item.type === 'dropdown') {
      return renderDropdown(item, extraClassName)
    }

    const isCta = item.variant === 'cta'
    const className = linkOrActionClassName(item, extraClassName)
    const style = isCta
      ? { backgroundColor: colors.ctaPrimary, boxShadow: `0 4px 14px ${colors.ctaShadow}` }
      : undefined
    const onMouseEnter = isCta
      ? (e: MouseEvent<HTMLElement>) => { e.currentTarget.style.backgroundColor = colors.ctaPrimaryHover }
      : undefined
    const onMouseLeave = isCta
      ? (e: MouseEvent<HTMLElement>) => { e.currentTarget.style.backgroundColor = colors.ctaPrimary }
      : undefined

    if (item.type === 'action') {
      return (
        <button
          key={item.key}
          type="button"
          onClick={() => { setMobileOpen(false); setOpenDropdownKey(null); item.onSelect() }}
          className={className}
          style={style}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {item.label}
        </button>
      )
    }

    if (item.external) {
      return (
        <a
          key={item.key}
          href={item.href}
          onClick={() => setMobileOpen(false)}
          className={className}
          style={style}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {item.label}
        </a>
      )
    }

    return (
      <Link
        key={item.key}
        to={item.href}
        onClick={() => setMobileOpen(false)}
        className={className}
        style={style}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {item.label}
      </Link>
    )
  }

  const renderDropdown = (item: SiteHeaderDropdownItem, extraClassName?: string) => {
    const isOpen = openDropdownKey === item.key
    const isMobile = extraClassName != null

    if (isMobile) {
      return (
        <div key={item.key}>
          <button type="button" onClick={() => setOpenDropdownKey(isOpen ? null : item.key)}
            className="nav-link relative block w-full text-center">
            <span>{item.label}</span>
            <svg className={`absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isOpen && (
            <div className="mt-1 flex flex-col gap-1">
              {item.items.map((s) => (
                <Link
                  key={s.href}
                  to={s.href}
                  onClick={() => { setOpenDropdownKey(null); setMobileOpen(false) }}
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
      // flex: colapsa el wrapper a la altura exacta del botón — como inline content
      // el line box del div agregaba espacio arriba y desfasaba "Servicios" hacia
      // abajo respecto de los demás nav links.
      <div key={item.key} className="relative flex"
        onMouseEnter={() => { clearTimeout(dropdownTimeoutRef.current); setOpenDropdownKey(item.key) }}
        onMouseLeave={() => { dropdownTimeoutRef.current = setTimeout(() => setOpenDropdownKey(null), 300) }}
      >
        {/* Sin inline-flex/items-center: el trigger debe compartir la misma caja de
            línea que el resto de los .nav-link para que el texto no quede desfasado;
            el chevrón va inline con align-middle sobre esa misma línea. */}
        <button type="button" className="nav-link md:text-xs lg:text-sm" onClick={() => setOpenDropdownKey(isOpen ? null : item.key)}>
          {item.label}
          <svg className={`ml-1 inline-block h-3.5 w-3.5 align-[-0.2em] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div className="absolute left-1/2 top-full z-50 w-48 md:w-56 -translate-x-1/2 rounded-xl bg-white py-2 shadow-xl ring-1 ring-slate-200 before:absolute before:left-0 before:right-0 before:-top-4 before:h-4 before:content-[''] mt-1">
            {item.items.map((s) => (
              <Link
                key={s.href}
                to={s.href}
                onClick={() => setOpenDropdownKey(null)}
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

  return (
    <>
      <header className={`fixed z-50 transition-all duration-500 ease-in-out ${
        headerActive
          ? 'top-5 left-3 right-3 md:left-6 md:right-6 lg:left-16 lg:right-16 xl:left-32 xl:right-32 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg header-scrolled'
          : 'top-4 left-0 right-0 bg-transparent backdrop-blur-sm'
      }`}>
        <div className={`${layout.container} flex items-center justify-between py-3 sm:py-4`}>
          <button
            type="button"
            onClick={() => { setMobileOpen(false); setOpenDropdownKey(null); onLogoClick() }}
            className="-ml-1 flex flex-shrink-0 items-center overflow-visible sm:-ml-2"
            style={{ height: headerActive ? '2.5rem' : '3rem' }}
          >
            <img
              src="/cpeLogo.png"
              className={`w-auto transition-all duration-500 ${headerActive ? 'h-44 sm:h-52 md:h-60 lg:h-72' : 'h-60 sm:h-72 md:h-80 lg:h-96'}`}
              alt="CPE Logo"
            />
          </button>

          <nav className="desktop-nav hidden min-w-0 flex-1 items-center justify-end gap-2 lg:gap-4 xl:gap-8 md:flex">
            {navItems.map((item) => renderNavItem(item))}
            {trailing}
            <div className="relative hidden xl:block">
              <div className="flex items-center gap-1">
                {/* Teal también con el header arriba de todo — el hero claro no da
                    contraste para el blanco (mismo criterio que .desktop-nav) */}
                <a href="https://www.instagram.com/clinicaparaempresas" target="_blank" rel="noopener noreferrer"
                  className={`transition-colors ${desktopSocialsOpen ? 'hidden' : 'inline-flex'}`}
                  style={{ color: colors.tealDeep }}
                  aria-label="Instagram"
                >
                  <InstagramIcon className="h-4 w-4 lg:h-5 lg:w-5" />
                </a>
                <button
                  type="button"
                  onClick={() => setDesktopSocialsOpen((o) => !o)}
                  className="transition-colors"
                  style={{ color: colors.tealDeep }}
                  aria-label="Mostrar redes"
                >
                  <svg className={`h-4 w-4 transition-transform duration-200 ${desktopSocialsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <div className={`absolute right-0 top-full mt-2 rounded-xl bg-white p-2 shadow-lg ring-1 ring-slate-200 transition-all duration-200 ${desktopSocialsOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-1 opacity-0'}`}>
                <div className="flex flex-col items-center gap-2">
                  <a href="https://www.instagram.com/clinicaparaempresas" target="_blank" rel="noopener noreferrer"
                    className="transition-colors"
                    style={{ color: colors.tealDeep }}
                    aria-label="Instagram"
                  >
                    <InstagramIcon className="h-4 w-4 lg:h-5 lg:w-5" />
                  </a>
                  <button
                    type="button"
                    onClick={contactHandler}
                    className="transition-colors"
                    style={{ color: colors.tealDeep }}
                    aria-label="Teléfono"
                  >
                    <PhoneIcon className="h-4 w-4 lg:h-5 lg:w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={contactHandler}
                    className="transition-colors"
                    style={{ color: colors.tealDeep }}
                    aria-label="Correo"
                  >
                    <MailIcon className="h-4 w-4 lg:h-5 lg:w-5" />
                  </button>
                  <a href="https://www.linkedin.com/company/cl%C3%ADnica-para-empresas/" target="_blank" rel="noopener noreferrer"
                    className="transition-colors"
                    style={{ color: colors.tealDeep }}
                    aria-label="LinkedIn"
                  >
                    <LinkedInIcon className="h-4 w-4 lg:h-5 lg:w-5" />
                  </a>
                </div>
              </div>
            </div>
            {/* Search icon */}
            <button
              type="button"
              onClick={openSearch}
              className="flex-shrink-0 transition-colors"
              style={{ color: colors.tealDeep }}
              aria-label="Buscar"
            >
              <svg className="h-4 w-4 lg:h-5 lg:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
          </nav>

          {/* Teal también con el header arriba de todo — el hero claro no da
              contraste para el blanco (misma razón que .desktop-nav en index.css) */}
          <button type="button" onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-md p-2 md:hidden transition-colors"
            style={{ color: colors.tealDeep }}
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
              {navItems.map((item) => renderNavItem(item, 'block w-full text-center'))}
              {trailing && <div className="flex justify-center">{trailing}</div>}
              <div className="mt-2 grid grid-cols-4 gap-2">
                <a
                  href="https://www.instagram.com/clinicaparaempresas"
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
                  onClick={contactHandler}
                  className="flex h-10 items-center justify-center rounded-lg transition-colors"
                  style={{ color: headerActive ? colors.tealDeep : 'rgba(255,255,255,0.7)' }}
                  aria-label="Teléfono"
                >
                  <PhoneIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={contactHandler}
                  className="flex h-10 items-center justify-center rounded-lg transition-colors"
                  style={{ color: headerActive ? colors.tealDeep : 'rgba(255,255,255,0.7)' }}
                  aria-label="Correo"
                >
                  <MailIcon className="h-5 w-5" />
                </button>
                <a
                  href="https://www.linkedin.com/company/cl%C3%ADnica-para-empresas/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 items-center justify-center rounded-lg transition-colors"
                  style={{ color: headerActive ? colors.tealDeep : 'rgba(255,255,255,0.7)' }}
                  aria-label="LinkedIn"
                >
                  <LinkedInIcon className="h-5 w-5" />
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
                    handleSearchSelect(filteredSearch[0])
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
                    key={item.label}
                    type="button"
                    onClick={() => handleSearchSelect(item)}
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
    </>
  )
}
