import { useRef } from 'react'

/**
 * Genera una key de idempotencia apta para el header `Idempotency-Key`.
 * Debe matchear la validación del backend: `/^[A-Za-z0-9_-]{8,200}$/`.
 *
 * `crypto.randomUUID()` sólo existe en un contexto seguro (https://, o localhost)
 * — en dev sobre LAN vía `vite --host` (http:// desde otro dispositivo) el tipo de
 * TS dice que siempre está, pero en runtime es `undefined`. De ahí el chequeo y el
 * fallback, construido con el mismo charset que acepta el backend.
 */
export function newIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return fallbackIdempotencyKey()
}

function fallbackIdempotencyKey(): string {
  const chunk = () => Math.random().toString(36).slice(2)
  return `${Date.now().toString(36)}-${chunk()}${chunk()}`
}

/**
 * Stringify estable (claves ordenadas), para que `{a:1,b:2}` y `{b:2,a:1}`
 * fingerprinteen igual. Espeja el JSON canonicalizado que arma `hashRequestBody`
 * del backend (`src/lib/idempotency.ts`) — mismo razonamiento, del otro lado del cable.
 */
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  const entries = Object.keys(value as Record<string, unknown>)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`)
  return `{${entries.join(',')}}`
}

/**
 * Una key por "intención de submit". El problema entero de "no romper la
 * idempotencia cuando la misma pantalla crea dos veces" se reduce a esto: mismo
 * payload que se reintenta -> misma key (así un retry de red deduplica); payload
 * distinto, o un submit después de una creación exitosa -> key nueva (así una
 * repetición legítima en la misma pantalla montada sigue entrando). Esto espeja el
 * `request_hash` del backend del lado del cliente, así que los dos nunca pueden
 * discrepar y producir un 409 espurio.
 *
 * `keyFor(payload)` fingerprintea el payload: mismo fingerprint que la última
 * llamada -> devuelve la key cacheada; fingerprint distinto -> acuña una nueva.
 * `reset()` (se llama al tener éxito) limpia la caché, así que la PRÓXIMA llamada a
 * `keyFor`, aunque el payload sea idéntico, acuña una key nueva también — eso es lo
 * que permite postear el mismo comentario dos veces sin un 409 `IDEMPOTENCY_KEY_REUSED`
 * espurio.
 */
export function useIdempotencyKey(): { keyFor: (payload: unknown) => string; reset: () => void } {
  const fingerprintRef = useRef<string | null>(null)
  const keyRef = useRef<string | null>(null)

  const keyFor = (payload: unknown): string => {
    const fingerprint = stableStringify(payload)
    if (keyRef.current !== null && fingerprintRef.current === fingerprint) {
      return keyRef.current
    }
    const key = newIdempotencyKey()
    fingerprintRef.current = fingerprint
    keyRef.current = key
    return key
  }

  const reset = (): void => {
    fingerprintRef.current = null
    keyRef.current = null
  }

  return { keyFor, reset }
}
