import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { useForoAuth, type ForoAuthDialogMode } from '../auth'
import { foroAuthClient, toForoApiError } from '../api/foroAuthClient'
import { getForoApiErrorMessage } from '../api/foroApiRequest'
import { TurnstileWidget, type TurnstileWidgetHandle } from './TurnstileWidget'
import { colors, fonts, foroPalette } from '../../../theme'

// `normal-case` matters: the wrapping <label> is `uppercase`, and text-transform is
// inherited by inputs — without this the revealed password renders in capitals that
// don't match what was actually typed, which makes the reveal toggle a liar.
const inputClass = 'w-full border px-3 py-2.5 text-[14.5px] normal-case bg-white focus:outline-none'

/** Extra right padding so text never runs under the reveal toggle. */
const passwordInputClass = `${inputClass} pr-11`

const labelClass = 'flex flex-col gap-1.5 text-[12.5px] font-semibold uppercase tracking-wide'

/** Square-corner secondary/tertiary action, used outside the primary submit button. */
const linkButtonClass = 'self-start bg-transparent border-none p-0 text-[12.5px] font-semibold underline-offset-2 hover:underline cursor-pointer'

function EyeIcon({ crossed }: { crossed: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.75" />
      {crossed && <path d="m4 20 16-16" />}
    </svg>
  )
}

const tabButtonClass = (active: boolean) =>
  [
    'flex-1 border-none px-3 py-[9px] text-[13.5px] font-semibold cursor-pointer transition-colors',
    active ? 'bg-white shadow-sm' : 'bg-transparent',
  ].join(' ')

/**
 * Login/signup modal: email+password tabs (sign in / sign up) plus a
 * "Continuar con Google" social button. Also hosts the "forgot password"
 * request form and the post-signup "check your email" screen — both are
 * dialog *modes*, not separate routes, since they're reached from within
 * the same auth flow (`ForoAuthDialogMode` in `foroAuthContext.ts`).
 *
 * Controlled entirely via ForoAuthProvider's context (openAuthDialog()) —
 * a single instance is mounted app-wide in `App.tsx`.
 */
export function ForoAuthDialog() {
  const ctx = useForoAuth()
  const isOpen = ctx.isAuthDialogOpen
  const close = ctx.closeAuthDialog

  const [mode, setMode] = useState<ForoAuthDialogMode>(ctx.authDialogMode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Cloudflare Turnstile — tokens are single-use, see `resetCaptcha` below.
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileWidgetHandle>(null)

  // 'forgot' mode: request sent, waiting-for-email confirmation copy.
  const [forgotSent, setForgotSent] = useState(false)

  // 'check-email' mode: resend-verification button state.
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [resendError, setResendError] = useState<string | null>(null)

  const resetCaptcha = () => {
    setCaptchaToken(null)
    turnstileRef.current?.reset()
  }

  const resetForm = () => {
    setName(''); setEmail(''); setPassword(''); setConfirmPassword(''); setShowPassword(false); setError(null)
    setForgotSent(false); setResendState('idle'); setResendError(null)
    resetCaptcha()
  }

  const handleClose = () => {
    resetForm()
    close()
  }

  useEffect(() => {
    if (isOpen) {
      setMode(ctx.authDialogMode)
      setError(null)
      resetCaptcha()
    }
    // Only re-sync when the dialog transitions to open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    // Full close-and-reset, not a bare `close()` — the dialog is permanently
    // mounted (`App.tsx`), so an Escape-dismiss that skipped `resetForm()`
    // would leave `password`/`confirmPassword`/the captcha token lingering
    // in state until the next open.
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  if (!isOpen) return null

  // Switching tabs drops the confirmation and any stale mismatch error — otherwise a
  // "no coinciden" message from the sign-up tab would linger over the sign-in form.
  // Sign-in and sign-up are separate captcha-protected endpoints, so a token solved
  // on one tab is not valid on the other — reset it too.
  const switchMode = (next: ForoAuthDialogMode) => {
    setMode(next)
    setConfirmPassword('')
    setError(null)
    setForgotSent(false)
    resetCaptcha()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    // Synchronous re-entrancy guard: `disabled` only takes effect after React
    // commits, so a fast double-Enter/double-click can fire this twice before
    // the first `setSubmitting(true)` re-render lands.
    if (submitting) return
    setError(null)
    if (mode === 'sign-up' && password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (!captchaToken) return
    setSubmitting(true)
    try {
      if (mode === 'sign-up') {
        await ctx.signUpEmail(email, password, name, captchaToken)
        // No session yet — `requireEmailVerification` blocks sign-in until the link is
        // clicked. Keep the email around for the resend button, drop the passwords.
        setPassword(''); setConfirmPassword('')
        resetCaptcha()
        setMode('check-email')
      } else {
        await ctx.signInEmail(email, password, captchaToken)
        handleClose()
      }
    } catch (err) {
      setError(getForoApiErrorMessage(err))
      resetCaptcha()
    } finally {
      setSubmitting(false)
    }
  }

  const handleSocial = async (provider: 'google') => {
    if (submitting) return
    setError(null)
    setSubmitting(true)
    try {
      await ctx.signInSocial(provider)
    } catch (err) {
      setError(getForoApiErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleForgotSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setError(null)
    if (!captchaToken) return
    setSubmitting(true)
    try {
      const { error: sdkError } = await foroAuthClient.requestPasswordReset({
        email,
        redirectTo: '/restablecer-password',
        fetchOptions: { headers: { 'x-captcha-response': captchaToken } },
      })
      if (sdkError) throw toForoApiError(sdkError, '/auth/request-password-reset')
      setForgotSent(true)
    } catch (err) {
      setError(getForoApiErrorMessage(err))
      resetCaptcha()
    } finally {
      setSubmitting(false)
    }
  }

  const handleResendVerification = async () => {
    setResendState('sending')
    setResendError(null)
    try {
      const { error: sdkError } = await foroAuthClient.sendVerificationEmail({ email })
      if (sdkError) throw toForoApiError(sdkError, '/auth/send-verification-email')
      setResendState('sent')
    } catch (err) {
      setResendState('idle')
      setResendError(getForoApiErrorMessage(err))
    }
  }

  const dialogLabel =
    mode === 'sign-up' ? 'Crear cuenta'
    : mode === 'forgot' ? 'Recuperar contraseña'
    : mode === 'check-email' ? 'Revisá tu email'
    : 'Iniciar sesión'

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-5 backdrop-blur-[2px]"
      style={{ backgroundColor: foroPalette.scrim, fontFamily: fonts.primary }}
      onClick={handleClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-[420px] bg-white px-7 pb-7 pt-8 shadow-2xl"
        style={{ color: foroPalette.ink }}
        role="dialog"
        aria-modal="true"
        aria-label={dialogLabel}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border-none bg-transparent text-xl leading-none hover:[background-color:var(--foro-close-hover-bg)]"
          style={{ color: foroPalette.muted, '--foro-close-hover-bg': foroPalette.tealTint } as CSSProperties}
          onClick={handleClose}
          aria-label="Cerrar"
        >
          ×
        </button>

        {(mode === 'sign-in' || mode === 'sign-up') && (
          <>
            <div className="mb-[22px] flex gap-1 rounded-xl p-1" style={{ backgroundColor: foroPalette.surfaceAlt }}>
              <button type="button" className={tabButtonClass(mode === 'sign-in')} onClick={() => switchMode('sign-in')}>
                Iniciar sesión
              </button>
              <button type="button" className={tabButtonClass(mode === 'sign-up')} onClick={() => switchMode('sign-up')}>
                Crear cuenta
              </button>
            </div>

            <form className="flex flex-col gap-3.5" onSubmit={handleSubmit} aria-busy={submitting}>
              {mode === 'sign-up' && (
                <label className={labelClass} style={{ color: colors.blueDark }}>
                  Nombre
                  <input
                    type="text"
                    className={inputClass}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </label>
              )}
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
              <label className={labelClass} style={{ color: colors.blueDark }}>
                Contraseña
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={passwordInputClass}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3"
                    style={{ color: foroPalette.muted }}
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-pressed={showPassword}
                  >
                    <EyeIcon crossed={showPassword} />
                  </button>
                </div>
              </label>

              {mode === 'sign-up' && (
                <label className={labelClass} style={{ color: colors.blueDark }}>
                  Repetir contraseña
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={inputClass}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </label>
              )}

              <TurnstileWidget ref={turnstileRef} onVerify={setCaptchaToken} onExpire={() => setCaptchaToken(null)} />

              {mode === 'sign-in' && (
                <button type="button" className={linkButtonClass} style={{ color: colors.ctaPrimary }} onClick={() => switchMode('forgot')}>
                  ¿Olvidaste tu contraseña?
                </button>
              )}

              {error && (
                <p className="rounded-lg px-3 py-2 text-[13px]" style={{ backgroundColor: foroPalette.errorBg, color: foroPalette.errorText }} aria-live="polite">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="rounded-xl px-[22px] py-3 text-sm font-semibold text-white transition-transform duration-150 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: colors.ctaPrimary }}
                disabled={submitting || !captchaToken}
              >
                {mode === 'sign-up' ? 'Crear cuenta' : 'Iniciar sesión'}
              </button>
            </form>

            <div className="my-5 flex items-center gap-2.5 text-[11px] uppercase tracking-wide" style={{ color: foroPalette.mutedSoft }}>
              <span className="h-px flex-1" style={{ backgroundColor: foroPalette.line }} />
              <span>o continuar con</span>
              <span className="h-px flex-1" style={{ backgroundColor: foroPalette.line }} />
            </div>

            <button
              type="button"
              className="block w-full rounded-xl border px-[22px] py-3 text-sm font-semibold hover:[background-color:var(--foro-social-hover-bg)] disabled:cursor-not-allowed disabled:opacity-60"
              style={{ borderColor: colors.lightGray, color: colors.ctaPrimary, '--foro-social-hover-bg': foroPalette.tealTint } as CSSProperties}
              onClick={() => handleSocial('google')}
              disabled={submitting}
            >
              Continuar con Google
            </button>
          </>
        )}

        {mode === 'forgot' && (
          forgotSent ? (
            <div className="flex flex-col gap-4">
              <p className="text-[14px]" style={{ color: foroPalette.ink }}>
                Si el email está registrado, vas a recibir un enlace para restablecer tu contraseña.
              </p>
              <button type="button" className={linkButtonClass} style={{ color: colors.ctaPrimary }} onClick={() => switchMode('sign-in')}>
                Volver a iniciar sesión
              </button>
            </div>
          ) : (
            <form className="flex flex-col gap-3.5" onSubmit={handleForgotSubmit} aria-busy={submitting}>
              <p className="text-[13.5px]" style={{ color: foroPalette.muted }}>
                Ingresá tu email y te mandamos un enlace para elegir una nueva contraseña.
              </p>
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

              <TurnstileWidget ref={turnstileRef} onVerify={setCaptchaToken} onExpire={() => setCaptchaToken(null)} />

              {error && (
                <p className="rounded-lg px-3 py-2 text-[13px]" style={{ backgroundColor: foroPalette.errorBg, color: foroPalette.errorText }} aria-live="polite">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="rounded-xl px-[22px] py-3 text-sm font-semibold text-white transition-transform duration-150 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: colors.ctaPrimary }}
                disabled={submitting || !captchaToken}
              >
                Enviar instrucciones
              </button>

              <button type="button" className={linkButtonClass} style={{ color: foroPalette.muted }} onClick={() => switchMode('sign-in')}>
                Volver a iniciar sesión
              </button>
            </form>
          )
        )}

        {mode === 'check-email' && (
          <div className="flex flex-col gap-4">
            <p className="text-[14px]" style={{ color: foroPalette.ink }}>
              Revisá tu email <strong>{email}</strong> y hacé clic en el enlace de verificación para activar tu cuenta.
            </p>

            {resendError && (
              <p className="rounded-lg px-3 py-2 text-[13px]" style={{ backgroundColor: foroPalette.errorBg, color: foroPalette.errorText }} aria-live="polite">
                {resendError}
              </p>
            )}

            <button
              type="button"
              className="self-start px-[22px] py-3 text-sm font-semibold text-white transition-transform duration-150 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: colors.ctaPrimary }}
              onClick={handleResendVerification}
              disabled={resendState === 'sending' || resendState === 'sent'}
            >
              {resendState === 'sent' ? 'Correo reenviado' : resendState === 'sending' ? 'Reenviando…' : 'Reenviar correo de verificación'}
            </button>

            <button type="button" className={linkButtonClass} style={{ color: foroPalette.muted }} onClick={() => switchMode('sign-in')}>
              Volver a iniciar sesión
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

export default ForoAuthDialog
