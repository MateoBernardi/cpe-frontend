import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  foroAuthClient,
  toForoApiError,
  getForoApiErrorMessage,
  getAuthErrorMessage,
  useForoAuth,
  foroKeys,
} from '@features/foro'
import { colors, fonts, foroPalette } from '@/theme'

const inputClass = 'w-full border px-3 py-2.5 text-[14.5px] bg-white focus:outline-none'
const labelClass = 'flex flex-col gap-1.5 text-[12.5px] font-semibold uppercase tracking-wide'

/**
 * `/verificar-email` — landing page for the link Better Auth emails after sign-up (and after a
 * resend). Better Auth arrives here in one of two shapes:
 * - No query at all: verification succeeded. `autoSignInAfterVerification` already set the session
 *   cookie as part of the redirect, so we just refetch the cached session and let the user continue.
 * - `?error=<CODE>` where CODE is `TOKEN_EXPIRED`, `INVALID_TOKEN` or `USER_NOT_FOUND`
 *   (`better-auth/dist/api/routes/email-verification.mjs`'s `redirectOnError`) — the token was bad,
 *   so we show the Spanish explanation and let the user request a fresh email.
 */
export default function VerificarEmailPage() {
  const [searchParams] = useSearchParams()
  const errorCode = searchParams.get('error')
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { openAuthDialog } = useForoAuth()

  const [email, setEmail] = useState('')
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [resendError, setResendError] = useState<string | null>(null)

  const handleContinue = async () => {
    // Pick up the session the redirect's auto-sign-in already established, so the header renders
    // the signed-in user without a full page reload.
    await qc.refetchQueries({ queryKey: foroKeys.session() })
    // Only prompt for credentials when the cookie did NOT survive the redirect (the SPA and the API
    // are on different origins, so a browser blocking third-party cookies can drop it). After a
    // successful auto-sign-in the user is already logged in, and unconditionally opening the
    // sign-in dialog — the way `RestablecerPasswordPage` does, where nothing signs the user in —
    // would ask them to log in to an account they're already using.
    if (!qc.getQueryData(foroKeys.session())) openAuthDialog('sign-in')
    navigate('/', { replace: true })
  }

  const handleResend = async (e: FormEvent) => {
    e.preventDefault()
    if (resendState === 'sending') return
    setResendState('sending')
    setResendError(null)
    try {
      // Not captcha-protected (`better-auth/dist/plugins/captcha/constants.mjs`'s
      // `defaultEndpoints` only lists `/sign-up/email`, `/sign-in/email`,
      // `/request-password-reset`), so no `TurnstileWidget` here — same reasoning as
      // `ForoAuthDialog.handleResendVerification`. It IS throttled server-side (3/h per address,
      // `src/lib/email-throttle.ts` in the backend), and that 429 already carries a Spanish message.
      const { error: sdkError } = await foroAuthClient.sendVerificationEmail({ email })
      if (sdkError) throw toForoApiError(sdkError, '/auth/send-verification-email')
      setResendState('sent')
    } catch (err) {
      setResendState('idle')
      setResendError(getForoApiErrorMessage(err))
    }
  }

  const errorMessage = errorCode ? getAuthErrorMessage(errorCode) : null

  return (
    <div className="min-h-screen bg-white pt-[22vh] pb-16">
      <div className="mx-auto max-w-[420px] px-4">
        <h1 className="text-xl font-bold sm:text-2xl" style={{ color: colors.blueDark, fontFamily: fonts.primary }}>
          Verificación de email
        </h1>

        {!errorCode && (
          <div className="mt-5 flex flex-col gap-4">
            <p className="text-sm text-gray-600">Tu cuenta quedó confirmada.</p>
            <button
              type="button"
              className="self-start px-[22px] py-3 text-sm font-semibold text-white transition-transform duration-150 hover:-translate-y-px"
              style={{ backgroundColor: colors.ctaPrimary }}
              onClick={handleContinue}
            >
              Continuar
            </button>
          </div>
        )}

        {errorCode && (
          <div className="mt-5 flex flex-col gap-4">
            <p className="text-sm text-gray-500">
              {errorMessage ?? 'No pudimos confirmar tu cuenta. Pedí un nuevo enlace de verificación.'}
            </p>

            <form className="flex flex-col gap-3.5" onSubmit={handleResend} aria-busy={resendState === 'sending'}>
              <label className={labelClass} style={{ color: colors.blueDark }}>
                Email
                <input
                  type="email"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </label>

              {resendError && (
                <p className="px-3 py-2 text-[13px]" style={{ backgroundColor: foroPalette.errorBg, color: foroPalette.errorText }} aria-live="polite">
                  {resendError}
                </p>
              )}

              <button
                type="submit"
                className="self-start px-[22px] py-3 text-sm font-semibold text-white transition-transform duration-150 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: colors.ctaPrimary }}
                disabled={resendState === 'sending' || resendState === 'sent'}
              >
                {resendState === 'sent' ? 'Correo reenviado' : resendState === 'sending' ? 'Reenviando…' : 'Reenviar correo de verificación'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
