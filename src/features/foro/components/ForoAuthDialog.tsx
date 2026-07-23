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

const inputClass = 'w-full border px-3 py-2.5 text-[14.5px] bg-white focus:outline-none'

const tabButtonClass = (active: boolean) =>
  [
    'flex-1 border-none px-3 py-[9px] text-[13.5px] font-semibold cursor-pointer transition-colors',
    active ? 'bg-white shadow-sm' : 'bg-transparent',
  ].join(' ')

/**
 * Login/signup modal: email+password tabs (sign in / sign up) plus
 * "Continuar con Google" / "Continuar con Apple" social buttons.
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
    setName(''); setEmail(''); setPassword(''); setError(null)
  }

  const handleClose = () => {
    resetForm()
    close()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
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
          <button type="button" className={tabButtonClass(mode === 'sign-in')} onClick={() => setMode('sign-in')}>
            Iniciar sesión
          </button>
          <button type="button" className={tabButtonClass(mode === 'sign-up')} onClick={() => setMode('sign-up')}>
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
            <input
              type="password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
            />
          </label>

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

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            className="rounded-xl border px-[22px] py-3 text-sm font-semibold hover:[background-color:var(--foro-social-hover-bg)]"
            style={{ borderColor: colors.lightGray, color: colors.ctaPrimary, '--foro-social-hover-bg': foroPalette.tealTint } as CSSProperties}
            onClick={() => handleSocial('google')}
          >
            Continuar con Google
          </button>
          <button
            type="button"
            className="rounded-xl border px-[22px] py-3 text-sm font-semibold hover:[background-color:var(--foro-social-hover-bg)]"
            style={{ borderColor: colors.lightGray, color: colors.ctaPrimary, '--foro-social-hover-bg': foroPalette.tealTint } as CSSProperties}
            onClick={() => handleSocial('apple')}
          >
            Continuar con Apple
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default ForoAuthDialog
