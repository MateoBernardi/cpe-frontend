import { useState, type FormEvent } from 'react'
import { useForoAuth, useUpdateUser, getForoApiErrorMessage } from '@features/foro'
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

  if (!user) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFeedback(null)
    try {
      await updateUser.mutateAsync({ name })
      setFeedback('Nombre actualizado.')
    } catch (err) {
      setFeedback(getForoApiErrorMessage(err))
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
            style={{ borderColor: colors.inputBorder }}
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

        <button
          type="submit"
          disabled={updateUser.isPending || name.trim() === ''}
          className="self-start rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: colors.ctaPrimary }}
          onMouseEnter={(e) => { if (!updateUser.isPending) e.currentTarget.style.backgroundColor = colors.ctaPrimaryHover }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.ctaPrimary }}
        >
          {updateUser.isPending ? 'Guardando…' : 'Guardar cambios'}
        </button>
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
