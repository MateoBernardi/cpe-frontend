import { createContext, useCallback, useContext, useMemo, useState, type AnchorHTMLAttributes, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { isTrustedExternalHost, displayHost } from './externalLinkAllowlist'
import { isSafeHttpUrl } from './foroHelpers'
import { colors, fonts, foroPalette } from '../../../../theme'

interface ExternalLinkGuardValue {
  /** Abre el interstitial para `url`. Sólo lo usa `<SafeExternalLink>`. */
  confirm: (url: string) => void
}

const ExternalLinkGuardContext = createContext<ExternalLinkGuardValue | null>(null)

/**
 * Interstitial de salida del sitio.
 *
 * Un único diálogo montado en `App.tsx` (mismo idiom que `<ForoAuthDialog>`)
 * en vez de uno por link: los links externos aparecen en listas y tarjetas,
 * y montar un portal por cada uno sería puro overhead para algo que se ve de
 * a uno por vez.
 */
export function ExternalLinkGuardProvider({ children }: { children: ReactNode }) {
  const [pendingUrl, setPendingUrl] = useState<string | null>(null)

  const confirm = useCallback((url: string) => setPendingUrl(url), [])
  const value = useMemo(() => ({ confirm }), [confirm])

  const close = () => setPendingUrl(null)

  const proceed = () => {
    if (!pendingUrl) return
    // `noopener` no es opcional: sin él la pestaña destino recibe
    // `window.opener` y puede redirigir la nuestra (tabnabbing).
    window.open(pendingUrl, '_blank', 'noopener,noreferrer')
    setPendingUrl(null)
  }

  return (
    <ExternalLinkGuardContext.Provider value={value}>
      {children}
      {pendingUrl && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-5 backdrop-blur-[2px]"
          style={{ backgroundColor: foroPalette.scrim, fontFamily: fonts.primary }}
          onClick={close}
          role="presentation"
        >
          <div
            className="relative w-full max-w-[420px] rounded-2xl bg-white px-5 pb-6 pt-7 shadow-2xl sm:px-7"
            style={{ color: foroPalette.ink }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="external-link-guard-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="external-link-guard-title" className="text-lg font-bold" style={{ color: colors.blueDark }}>
              Estás saliendo del sitio
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed" style={{ color: foroPalette.muted }}>
              Este enlace te lleva a <strong style={{ color: colors.blueDark }}>{displayHost(pendingUrl)}</strong>, un
              sitio que no administramos nosotros.
            </p>
            {/* La URL completa, no sólo el host: es lo único que le permite a
                alguien detectar un destino que no esperaba. `break-all` porque
                una URL larga sin espacios desborda el modal. */}
            <p className="mt-3 break-all rounded-lg px-3 py-2 text-xs" style={{ backgroundColor: colors.lightGray, color: foroPalette.muted }}>
              {pendingUrl}
            </p>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={close}
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={proceed}
                className="rounded-xl px-5 py-2 text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: colors.ctaPrimary }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.ctaPrimaryHover }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.ctaPrimary }}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </ExternalLinkGuardContext.Provider>
  )
}

type SafeExternalLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'target' | 'rel'> & {
  href: string
  children: ReactNode
}

/**
 * `<a target="_blank">` que primero pasa por el interstitial cuando el destino
 * no está en la allowlist (`externalLinkAllowlist.ts`).
 *
 * Sigue siendo un `<a href>` real, no un `<button>`: hover del navegador con
 * la URL, "abrir en pestaña nueva" del menú contextual y ctrl/cmd+click siguen
 * funcionando. El interstitial se aplica sobre el click primario común, que es
 * el que hay que interceptar; un ctrl+click deliberado no se toca.
 *
 * Sin provider (por ejemplo dentro de un preview aislado) degrada a un link
 * normal en vez de romper — el guard es UX, nunca un requisito para navegar.
 */
export function SafeExternalLink({ href, children, onClick, ...rest }: SafeExternalLinkProps) {
  const ctx = useContext(ExternalLinkGuardContext)

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented) return
    // Modificadores / click del medio: el usuario ya eligió cómo abrirlo.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    if (!ctx) return
    if (!isSafeHttpUrl(href) || isTrustedExternalHost(href)) return
    e.preventDefault()
    ctx.confirm(href)
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}
