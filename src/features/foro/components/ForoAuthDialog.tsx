import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { useForoAuth, type ForoAuthDialogMode } from '../auth'
import { getForoApiErrorMessage } from '../api/foroApiRequest'
import '../styles/tokens.css'

export interface ForoAuthDialogProps {
  /** Override the open state instead of reading it from ForoAuthProvider's context. */
  open?: boolean
  onClose?: () => void
  defaultMode?: ForoAuthDialogMode
}

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
    <div className="foro-scope foro-dialog-overlay" onClick={handleClose} role="presentation">
      <div
        className="foro-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'sign-up' ? 'Crear cuenta' : 'Iniciar sesión'}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="foro-dialog-close" onClick={handleClose} aria-label="Cerrar">×</button>

        <div className="foro-dialog-tabs">
          <button type="button" className={mode === 'sign-in' ? 'active' : ''} onClick={() => setMode('sign-in')}>
            Iniciar sesión
          </button>
          <button type="button" className={mode === 'sign-up' ? 'active' : ''} onClick={() => setMode('sign-up')}>
            Crear cuenta
          </button>
        </div>

        <form className="foro-dialog-form" onSubmit={handleSubmit}>
          {mode === 'sign-up' && (
            <label>
              Nombre
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </label>
          )}
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
            />
          </label>

          {error && <p className="foro-dialog-error">{error}</p>}

          <button type="submit" className="foro-btn foro-btn-teal" disabled={submitting}>
            {mode === 'sign-up' ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="foro-dialog-divider"><span>o continuar con</span></div>

        <div className="foro-dialog-socials">
          <button type="button" className="foro-btn foro-btn-light" onClick={() => handleSocial('google')}>
            Continuar con Google
          </button>
          <button type="button" className="foro-btn foro-btn-light" onClick={() => handleSocial('apple')}>
            Continuar con Apple
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default ForoAuthDialog
