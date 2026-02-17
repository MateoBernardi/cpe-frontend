import { useState, type ReactNode } from 'react'
import WhatsAppFab from './WhatsAppFab'

interface MainLayoutProps {
  children: ReactNode
}

const NAV_LINKS = [
  { label: 'Inicio', href: '#hero' },
  { label: 'Nosotros', href: '#about' },
  { label: 'Novedades', href: '#news' },
  { label: 'Servicios', href: '#info_primary' },
] as const

export default function MainLayout({ children }: MainLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ── Fixed Header ── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/60 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo */}
          <a href="#hero" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
              CPE
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Clínica para Empresas
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#contact_form"
              className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
            >
              Contáctanos
            </a>
          </nav>

          {/* Mobile burger */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-md p-2 text-slate-600 md:hidden"
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
          <div className="border-t border-slate-200 bg-white px-4 pb-4 md:hidden">
            <nav className="flex flex-col gap-3 pt-3">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#contact_form"
                onClick={() => setMobileOpen(false)}
                className="mt-1 rounded-lg bg-teal-600 px-5 py-2.5 text-center text-sm font-semibold text-white"
              >
                Contáctanos
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* ── Main content (offset for fixed header) ── */}
      <main>
        {children}
      </main>

      {/* ── WhatsApp FAB ── */}
      <WhatsAppFab />

      {/* ── Footer ── */}
      <footer className="bg-slate-900 text-slate-400">
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

            {/* Links */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-white">Navegación</h4>
              <ul className="space-y-2 text-sm">
                {NAV_LINKS.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="transition-colors hover:text-white">{l.label}</a>
                  </li>
                ))}
              </ul>
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

          <div className="mt-10 border-t border-slate-800 pt-6 text-center text-xs">
            © {new Date().getFullYear()} Clínica para Empresas. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
