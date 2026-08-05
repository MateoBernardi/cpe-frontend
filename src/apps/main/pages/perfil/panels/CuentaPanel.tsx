import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useForoAuth, useUpdateUser, getForoApiErrorMessage } from '@features/foro'
import { ActionButton, type ActionButtonStatus } from '@features/content/components/foro'
import { colors } from '@/theme'

/**
 * Display-name editor + read-only email + sign-out. There is no separate
 * username column in the Foro backend — better-auth's `name` field IS the
 * user's editable identity.
 */
export default function CuentaPanel() {
  const { user, signOut } = useForoAuth()
  const updateUser = useUpdateUser()
  const [name, setName] = useState(user?.name ?? '')
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  // This screen doesn't navigate away on save, so the button's success state
  // has to time out on its own or it would read as "saved" forever.
  const [saveStatus, setSaveStatus] = useState<ActionButtonStatus>('idle')
  const successTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(successTimeout.current), [])

  if (!user) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFeedback(null)
    try {
      await updateUser.mutateAsync({ name })
      setFeedback('Nombre actualizado.')
      setSaveStatus('success')
      clearTimeout(successTimeout.current)
      successTimeout.current = setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (err) {
      setFeedback(getForoApiErrorMessage(err))
      setSaveStatus('idle')
    }
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <div className="flex max-w-lg flex-col gap-10">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-[12.5px] font-semibold uppercase tracking-wide" style={{ color: colors.blueDark }}>
          Nombre
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border px-3 py-2.5 text-[14.5px]"
            // Explicit color: `MainLayout`'s root sets `color: white` and form
            // controls inherit it, so without this the field is white-on-white.
            style={{ borderColor: colors.inputBorder, color: colors.blueDark }}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-[12.5px] font-semibold uppercase tracking-wide" style={{ color: colors.blueDark }}>
          Email
          <input
            type="email"
            value={user.email}
            disabled
            readOnly
            className="w-full cursor-not-allowed rounded-lg border bg-gray-50 px-3 py-2.5 text-[14.5px] text-gray-500"
            style={{ borderColor: colors.lightGray }}
          />
        </label>

        {feedback && (
          <p className="text-sm" style={{ color: colors.tealDeep }}>{feedback}</p>
        )}

        <ActionButton
          type="submit"
          className="self-start shadow-md"
          status={updateUser.isPending ? 'pending' : saveStatus}
          disabled={name.trim() === ''}
          pendingLabel="Guardando…"
          successLabel="Guardado"
        >
          Guardar cambios
        </ActionButton>
      </form>

      <div className="border-t pt-6" style={{ borderColor: colors.lightGray }}>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          style={{ color: colors.ctaPrimary }}
        >
          {isSigningOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
        </button>
      </div>
    </div>
  )
}
