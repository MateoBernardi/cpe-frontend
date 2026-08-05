import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { foroAuthClient, toForoApiError, getForoApiErrorMessage, useForoAuth } from '@features/foro'
import { colors, fonts, foroPalette } from '@/theme'

const inputClass = 'w-full border px-3 py-2.5 text-[14.5px] bg-white focus:outline-none'
const labelClass = 'flex flex-col gap-1.5 text-[12.5px] font-semibold uppercase tracking-wide'

/**
 * `/restablecer-password?token=…` — landing page for the link sent by
 * `requestPasswordReset` (see `ForoAuthDialog`'s 'forgot' mode). Unlike the
 * *request*, this step is NOT captcha-protected — Better Auth only guards
 * `/request-password-reset`, not `/reset-password` (the token itself is the
 * proof of ownership).
 */
export default function RestablecerPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const { openAuthDialog } = useForoAuth()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!token) return
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setSubmitting(true)
    try {
      const { error: sdkError } = await foroAuthClient.resetPassword({ newPassword, token })
      if (sdkError) throw toForoApiError(sdkError, '/auth/reset-password')
      setDone(true)
    } catch (err) {
      setError(getForoApiErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleContinue = () => {
    openAuthDialog('sign-in')
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-white pt-[22vh] pb-16">
      <div className="mx-auto max-w-[420px] px-4">
        <h1 className="text-xl font-bold sm:text-2xl" style={{ color: colors.blueDark, fontFamily: fonts.primary }}>
          Restablecer contraseña
        </h1>

        {!token && (
          <p className="mt-3 text-sm text-gray-500">
            El enlace no es válido o expiró. Solicitá uno nuevo desde &quot;¿Olvidaste tu contraseña?&quot; al iniciar sesión.
          </p>
        )}

        {token && done && (
          <div className="mt-5 flex flex-col gap-4">
            <p className="text-sm text-gray-600">Tu contraseña se actualizó correctamente.</p>
            <button
              type="button"
              className="self-start px-[22px] py-3 text-sm font-semibold text-white transition-transform duration-150 hover:-translate-y-px"
              style={{ backgroundColor: colors.ctaPrimary }}
              onClick={handleContinue}
            >
              Iniciar sesión
            </button>
          </div>
        )}

        {token && !done && (
          <form className="mt-5 flex flex-col gap-3.5" onSubmit={handleSubmit} aria-busy={submitting}>
            <label className={labelClass} style={{ color: colors.blueDark }}>
              Nueva contraseña
              <input
                type="password"
                className={inputClass}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </label>
            <label className={labelClass} style={{ color: colors.blueDark }}>
              Repetir contraseña
              <input
                type="password"
                className={inputClass}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </label>

            {error && (
              <p className="px-3 py-2 text-[13px]" style={{ backgroundColor: foroPalette.errorBg, color: foroPalette.errorText }} aria-live="polite">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="px-[22px] py-3 text-sm font-semibold text-white transition-transform duration-150 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: colors.ctaPrimary }}
              disabled={submitting}
            >
              {submitting ? 'Guardando…' : 'Guardar nueva contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
