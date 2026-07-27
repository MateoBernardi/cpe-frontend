import { useEffect, useState, type CSSProperties, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { useForoAuth, type ForoAuthDialogMode } from '../auth'
import { getForoApiErrorMessage } from '../api/foroApiRequest'
import { colors, fonts, foroPalette } from '../../../theme'

export interface ForoAuthDialogProps {
  /** Override the open state instead of reading it from ForoAuthProvider's context. */
  open?: boolean
  onClose?: () => void
  defaultMode?: ForoAuthDialogMode
}

// `normal-case` matters: the wrapping <label> is `uppercase`, and text-transform is
// inherited by inputs — without this the revealed password renders in capitals that
// don't match what was actually typed, which makes the reveal toggle a liar.
const inputClass = 'w-full border px-3 py-2.5 text-[14.5px] normal-case bg-white focus:outline-none'

/** Extra right padding so text never runs under the reveal toggle. */
const passwordInputClass = `${inputClass} pr-11`

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
 * "Continuar con Google" social button.
 * Controlled via ForoAuthProvider's context (openAuthDialog()) by default,
 * or via `open`/`onClose` props for a fully controlled usage.
 */
export function ForoAuthDialog({ open, onClose, defaultMode }: ForoAuthDialogProps) {
  const ctx = useForoAuth()
  const isOpen = open ?? ctx.isAuthDialogOpen
  const close = onClose ?? ctx.closeAuthDialog

  const [mode, setMode] = useState<ForoAuthDialogMode>(defaultMode ?? ctx.authDialogMode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode ?? ctx.authDialogMode)
      setError(null)
    }
    // Only re-sync when the dialog transitions to open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, close])

  if (!isOpen) return null

  const resetForm = () => {
    setName(''); setEmail(''); setPassword(''); setConfirmPassword(''); setShowPassword(false); setError(null)
  }

  // Switching tabs drops the confirmation and any stale mismatch error — otherwise a
  // "no coinciden" message from the sign-up tab would linger over the sign-in form.
  const switchMode = (next: ForoAuthDialogMode) => {
    setMode(next)
    setConfirmPassword('')
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    close()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (mode === 'sign-up' && password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setSubmitting(true)
    try {
      if (mode === 'sign-up') {
        await ctx.signUpEmail(email, password, name)
      } else {
        await ctx.signInEmail(email, password)
      }
      handleClose()
    } catch (err) {
      setError(getForoApiErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleSocial = async (provider: 'google' | 'apple') => {
    setError(null)
    try {
      await ctx.signInSocial(provider)
    } catch (err) {
      setError(getForoApiErrorMessage(err))
    }
  }

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
        aria-label={mode === 'sign-up' ? 'Crear cuenta' : 'Iniciar sesión'}
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

        <div className="mb-[22px] flex gap-1 rounded-xl p-1" style={{ backgroundColor: foroPalette.surfaceAlt }}>
          <button type="button" className={tabButtonClass(mode === 'sign-in')} onClick={() => switchMode('sign-in')}>
            Iniciar sesión
          </button>
          <button type="button" className={tabButtonClass(mode === 'sign-up')} onClick={() => switchMode('sign-up')}>
            Crear cuenta
          </button>
        </div>

        <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
          {mode === 'sign-up' && (
            <label className="flex flex-col gap-1.5 text-[12.5px] font-semibold uppercase tracking-wide" style={{ color: colors.blueDark }}>
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
          <label className="flex flex-col gap-1.5 text-[12.5px] font-semibold uppercase tracking-wide" style={{ color: colors.blueDark }}>
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
          <label className="flex flex-col gap-1.5 text-[12.5px] font-semibold uppercase tracking-wide" style={{ color: colors.blueDark }}>
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
            <label className="flex flex-col gap-1.5 text-[12.5px] font-semibold uppercase tracking-wide" style={{ color: colors.blueDark }}>
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

          {error && (
            <p className="rounded-lg px-3 py-2 text-[13px]" style={{ backgroundColor: foroPalette.errorBg, color: foroPalette.errorText }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="rounded-xl px-[22px] py-3 text-sm font-semibold text-white transition-transform duration-150 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: colors.ctaPrimary }}
            disabled={submitting}
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
          className="block w-full rounded-xl border px-[22px] py-3 text-sm font-semibold hover:[background-color:var(--foro-social-hover-bg)]"
          style={{ borderColor: colors.lightGray, color: colors.ctaPrimary, '--foro-social-hover-bg': foroPalette.tealTint } as CSSProperties}
          onClick={() => handleSocial('google')}
        >
          Continuar con Google
        </button>
      </div>
    </div>,
    document.body,
  )
}

export default ForoAuthDialog
