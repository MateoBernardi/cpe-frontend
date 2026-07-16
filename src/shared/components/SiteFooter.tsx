import { Link } from 'react-router-dom'
import { colors, layout } from '../../theme'

interface SiteFooterProps {
  /** Where "Política de privacidad" points. In-app route for the main site; an absolute URL for the Foro sub-app. */
  privacyTo: string
  /** When true, render the privacy link as a plain <a> (cross-app navigation) instead of a react-router <Link>. */
  privacyExternal?: boolean
}

/**
 * Institutional site footer, shared by the main app and the Foro sub-app so both
 * stay identical. Only the privacy-policy link target differs per app.
 */
export default function SiteFooter({ privacyTo, privacyExternal }: SiteFooterProps) {
  return (
    <footer id="footer" style={{ backgroundColor: colors.footerBg, color: colors.footerText }}>
      <div className={`${layout.container} ${layout.sectionPadY}`}>
        <div className="grid gap-[3vh] sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <img src="/cpeLogo.png" alt="CPE Logo" className="h-64 w-auto brightness-0 invert" />
          </div>
          <div>
            <h4 className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-white">Contacto</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><a href="mailto:contacto@clinicaparaempresas.com" className="transition-colors hover:text-white">contacto@clinicaparaempresas.com</a></li>
              <li><a href="tel:+5493512180273" className="transition-colors hover:text-white">+54 9 351 218-0273</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-white">Legal</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li>
                {privacyExternal ? (
                  <a href={privacyTo} className="transition-colors hover:text-white">Política de privacidad</a>
                ) : (
                  <Link to={privacyTo} className="transition-colors hover:text-white">Política de privacidad</Link>
                )}
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-[4vh] border-t border-white/15 pt-[2vh] text-center text-xs opacity-50">
          © {new Date().getFullYear()} Clínica para Empresas. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
