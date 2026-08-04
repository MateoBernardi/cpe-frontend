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
 * - `better-auth/dist/api/routes/callback.mjs` (los `redirectOnError` del callback de OAuth)
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

  // --- Fallos del callback de OAuth ---
  // Estos NO son códigos de `BASE_ERROR_CODES` y no llegan como `{message, code}` de una respuesta:
  // Better Auth aborta el callback con un REDIRECT del navegador y el código viaja en `?error=`
  // (`redirectOnError`, `better-auth/dist/oauth2/errors.mjs`). Por eso van en minúscula y con
  // guión bajo — el callback los arma con `result.error.split(' ').join('_')`. Ningún `catch` del
  // formulario los ve; los lee `ForoAuthDialog` desde la URL al montar.
  // `account_not_linked` NO es una acusación al que entra: quien completó el login con Google ya
  // probó ser dueño de esa casilla. Lo que falta confirmar es la cuenta local, así que el mensaje
  // pide sólo eso. `ForoAuthDialog` además lo desvía a la pantalla `check-email`, que trae el botón
  // de reenvío — no se le pide a nadie que vuelva a nuestro formulario si ya se logueó con Google.
  account_not_linked:
    'Tu cuenta todavía no está confirmada. Revisá tu correo (mirá también la carpeta de spam) y hacé clic en el enlace de verificación para activarla.',
  access_denied: 'Cancelaste el ingreso con Google.',
  email_not_found: 'Google no nos compartió tu dirección de correo. Probá creando la cuenta con email y contraseña.',
  unable_to_link_account: 'No pudimos vincular tu cuenta de Google. Intentá de nuevo.',
  unable_to_create_user: 'No pudimos crear tu cuenta. Intentá de nuevo en un rato.',
  unable_to_create_session: 'No pudimos iniciar tu sesión. Intentá de nuevo.',
  unable_to_get_user_info: 'No pudimos obtener tus datos de Google. Intentá de nuevo.',
  invalid_code: 'El ingreso con Google venció antes de completarse. Intentá de nuevo.',
  no_code: 'El ingreso con Google venció antes de completarse. Intentá de nuevo.',
  // `state_mismatch` es el más frecuente de todos en la práctica: cubre el state vencido, la cookie
  // que el navegador no guardó y el bloqueo de cookies de terceros (`parseState`, `state.mjs`).
  state_mismatch: 'El ingreso con Google venció o tu navegador bloqueó las cookies necesarias. Intentá de nuevo.',
  state_not_found: 'El ingreso con Google venció antes de completarse. Intentá de nuevo.',
  invalid_callback_request: 'El ingreso con Google venció antes de completarse. Intentá de nuevo.',
  no_callback_url: 'No pudimos volver a la página desde la que iniciaste sesión. Intentá de nuevo.',
  oauth_provider_not_found: 'El ingreso con Google no está disponible en este momento.',
  internal_server_error: 'Tuvimos un problema al procesar el ingreso con Google. Intentá de nuevo en un rato.',
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
