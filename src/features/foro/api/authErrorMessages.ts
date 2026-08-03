/**
 * Better Auth / Turnstile error-code → Spanish sentence.
 *
 * Better Auth and its captcha plugin respond in English (`{message, code}`), unlike our own API
 * which already answers in Spanish. `code` is the stable part of the wire contract
 * (`APIError.from(status, {message, code})` — `@better-auth/core/dist/error/index.mjs`), so we
 * translate by code, not by matching `message` text.
 *
 * Codes verified against:
 * - `@better-auth/core/dist/error/codes.mjs` (`BASE_ERROR_CODES`)
 * - `better-auth/dist/plugins/captcha/error-codes.mjs` (`EXTERNAL_ERROR_CODES`)
 */

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  EMAIL_NOT_VERIFIED:
    'Todavía no confirmaste tu cuenta. Te enviamos un correo a tu dirección — revisalo (mirá también spam) y hacé clic en el enlace para activarla.',
  INVALID_EMAIL_OR_PASSWORD: 'El email o la contraseña no son correctos.',
  USER_ALREADY_EXISTS: 'Ya existe una cuenta con ese email. Iniciá sesión o recuperá tu contraseña.',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    'Ya existe una cuenta con ese email. Iniciá sesión o recuperá tu contraseña.',
  INVALID_EMAIL: 'El email no tiene un formato válido.',
  PASSWORD_TOO_SHORT: 'La contraseña es demasiado corta. Usá al menos 8 caracteres.',
  PASSWORD_TOO_LONG: 'La contraseña es demasiado larga. Usá como máximo 128 caracteres.',
  TOKEN_EXPIRED: 'El enlace venció o no es válido. Pedí uno nuevo.',
  INVALID_TOKEN: 'El enlace venció o no es válido. Pedí uno nuevo.',
  EMAIL_ALREADY_VERIFIED: 'Tu cuenta ya está confirmada. Podés iniciar sesión.',
  USER_NOT_FOUND: 'No encontramos una cuenta con ese email.',
  SESSION_EXPIRED: 'Tu sesión venció. Iniciá sesión de nuevo.',
  CREDENTIAL_ACCOUNT_NOT_FOUND: 'Esa cuenta se creó con Google. Entrá con "Continuar con Google".',
  SOCIAL_ACCOUNT_ALREADY_LINKED: 'Esa cuenta de Google ya está vinculada a otro usuario.',
  FAILED_TO_GET_USER_INFO: 'No pudimos obtener tus datos de Google. Intentá de nuevo.',
  // Turnstile (captcha plugin)
  VERIFICATION_FAILED: 'No pudimos verificar que no sos un robot. Resolvé la verificación de nuevo.',
  MISSING_RESPONSE: 'Falta completar la verificación anti-robot.',
  UNKNOWN_ERROR: 'La verificación anti-robot falló. Recargá la página e intentá otra vez.',
}

/**
 * Looks up a Spanish sentence for a Better Auth / Turnstile error `code`. Returns `null` when the
 * code is unknown (or absent) so callers can fall back to their own generic status-based message —
 * this table is deliberately not exhaustive of every code Better Auth defines, only the ones that
 * can reach an end user through this app's flows (email+password auth, Google social, Turnstile).
 *
 * No status argument: every code above is unambiguous on its own, and none of them collide with the
 * codes our own API emits (`NOT_FOUND`, `FORBIDDEN`, `VALIDATION_ERROR`, `CONTENT_REJECTED`,
 * `RATE_LIMITED`, …), which already arrive with a Spanish `error` string of their own.
 */
export function getAuthErrorMessage(code: string | null | undefined): string | null {
  if (!code) return null
  return AUTH_ERROR_MESSAGES[code] ?? null
}
