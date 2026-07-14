import type { ReactNode } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { SubscribeButton } from '@features/foro'
import type { KnownPublicationTypeSlug } from '@features/foro'
import SiteHeader, { type SiteHeaderNavItem, type SiteHeaderSearchItem } from '@shared/components/SiteHeader'
import SiteFooter from '@shared/components/SiteFooter'

/** Institutional site (main app) base URL — the Foro links back to its privacy policy, which lives there. */
const MAIN_SITE_URL = (import.meta.env.VITE_MAIN_URL as string | undefined) ?? 'https://clinicaparaempresas.com'

interface ForoLayoutProps {
  children: ReactNode
}

const NAV_ITEMS: { label: string; slug: KnownPublicationTypeSlug | null }[] = [
  { label: 'Foro', slug: null },
  { label: 'Papers', slug: 'paper' },
  { label: 'Podcasts', slug: 'podcast' },
  { label: 'Novedades', slug: 'novedad' },
  { label: 'Discusión', slug: 'discusion' },
]

export function ForoLayout({ children }: ForoLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const activeSlug = location.pathname === '/' ? searchParams.get('tipo') : undefined

  const isActive = (slug: KnownPublicationTypeSlug | null) =>
    activeSlug === slug || (slug === null && (activeSlug == null || activeSlug === ''))

  const navItems: SiteHeaderNavItem[] = NAV_ITEMS.map((item) => ({
    type: 'link',
    key: item.slug ?? 'foro',
    label: item.label,
    href: item.slug ? `/?tipo=${item.slug}` : '/',
    active: isActive(item.slug),
  }))

  const searchItems: SiteHeaderSearchItem[] = NAV_ITEMS.map((item) => ({
    label: item.label,
    onSelect: () => navigate(item.slug ? `/?tipo=${item.slug}` : '/'),
  }))

  return (
    <>
      {/* Header and footer are the shared institutional chrome — they live OUTSIDE
          `.foro-scope` so the foro's scoped resets (e.g. `img { max-width:100% }`,
          which otherwise blows up the oversized main logo) don't distort them.
          Only the page content is foro-scoped. */}
      <SiteHeader
        navItems={navItems}
        onLogoClick={() => navigate('/')}
        searchItems={searchItems}
        trailing={<SubscribeButton />}
        // The foro home's hero sits on the light `--foro-bg` surface (not a
        // dark hero like the main site's), so a transparent header would be
        // low-contrast. Keep the white "scrolled" pill active everywhere.
        forceActive
        onContactClick={() => document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' })}
      />
      <div className="foro-scope foro-app">
        {/* SiteHeader is fixed/floating (like the main site's), so clear it the same way
            the main app's non-hero pages do — the foro has no dedicated hero offset. */}
        <main className="pt-[15vh]">{children}</main>
      </div>
      <SiteFooter privacyTo={`${MAIN_SITE_URL}/politica-de-privacidad`} privacyExternal />
    </>
  )
}
