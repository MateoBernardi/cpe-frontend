import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import FORO_ENV from '../api/foroApiConfig'
import { foroPalette } from '../../../theme'

const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

interface TurnstileRenderOptions {
  sitekey: string
  callback: (token: string) => void
  'error-callback'?: () => void
  'expired-callback'?: () => void
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string
  remove: (widgetId: string) => void
  reset: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

/**
 * Module-level, load-once promise for Cloudflare's script — there is no
 * shared script-loading utility elsewhere in the repo. Guarding it here
 * (rather than per-mount) is what makes it safe under React 18 StrictMode's
 * mount→unmount→remount: both effect invocations await the SAME promise
 * instead of injecting the `<script>` tag twice.
 */
let turnstileScriptPromise: Promise<void> | null = null

function loadTurnstileScript(): Promise<void> {
  if (turnstileScriptPromise) return turnstileScriptPromise
  turnstileScriptPromise = new Promise((resolve, reject) => {
    if (window.turnstile) {
      resolve()
      return
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${TURNSTILE_SCRIPT_URL}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('No se pudo cargar la verificación.')))
      return
    }
    const script = document.createElement('script')
    script.src = TURNSTILE_SCRIPT_URL
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('No se pudo cargar la verificación.'))
    document.head.appendChild(script)
  })
  return turnstileScriptPromise
}

export interface TurnstileWidgetHandle {
  /** Turnstile tokens are single-use — call this after every failed submit and before re-render of a fresh form. */
  reset: () => void
}

export interface TurnstileWidgetProps {
  onVerify: (token: string) => void
  /** Called when a solved token expires client-side (Cloudflare's own timeout), not on submit failure. */
  onExpire?: () => void
}

export const TurnstileWidget = forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(
  function TurnstileWidget({ onVerify, onExpire }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)
    const widgetIdRef = useRef<string | null>(null)
    const [loadError, setLoadError] = useState(false)

    // Sin site key no hay nada que renderizar: Cloudflare dispara su
    // `error-callback` con `sitekey: undefined` y el usuario ve un fallo que
    // parece de red. Es un error de configuración (falta `VITE_TURNSTILE_SITE_KEY`
    // en `.env` — ojo que Vite NO lee `.env.example`), así que se distingue:
    // recargar la página no lo arregla.
    const siteKey = FORO_ENV.TURNSTILE_SITE_KEY
    const isMisconfigured = !siteKey

    useImperativeHandle(ref, () => ({
      reset() {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current)
        }
      },
    }), [])

    useEffect(() => {
      if (isMisconfigured) {
        console.error(
          '[foro] Falta VITE_TURNSTILE_SITE_KEY en .env — el captcha no se puede renderizar. ' +
            'Vite no lee .env.example; copiá la variable a .env y reiniciá el dev server.',
        )
        return
      }

      let cancelled = false

      loadTurnstileScript()
        .then(() => {
          if (cancelled || widgetIdRef.current || !containerRef.current || !window.turnstile) return
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: onVerify,
            'error-callback': () => setLoadError(true),
            'expired-callback': () => onExpire?.(),
          })
        })
        .catch(() => setLoadError(true))

      return () => {
        cancelled = true
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current)
          widgetIdRef.current = null
        }
      }
      // onVerify/onExpire are event callbacks passed fresh each render; re-subscribing the
      // widget on every change would fight the single-render-per-mount contract above.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
      <div>
        <div ref={containerRef} />
        {isMisconfigured ? (
          <p className="text-[12.5px]" style={{ color: foroPalette.errorText }}>
            La verificación no está configurada. Avisale al equipo — recargar no lo soluciona.
          </p>
        ) : loadError ? (
          <p className="text-[12.5px]" style={{ color: foroPalette.errorText }}>
            No se pudo cargar la verificación. Recargá la página e intentá de nuevo.
          </p>
        ) : null}
      </div>
    )
  },
)

export default TurnstileWidget
