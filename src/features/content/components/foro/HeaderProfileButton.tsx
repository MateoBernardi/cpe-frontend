import { useState } from 'react'
import { useForoAuth } from '@features/foro'
import { initialsOf } from './foroHelpers'
import { colors, foroPalette } from '../../../../theme'

/**
 * Header's trailing auth widget: loading shows a quiet disabled placeholder;
 * logged out shows a solid teal CTA that opens `<ForoAuthDialog>`; logged in
 * shows a quiet "avatar + first name" widget that signs the user out on click.
 */
export function HeaderProfileButton() {
  const { user, isAuthenticated, isLoading, openAuthDialog, signOut } = useForoAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

  if (isLoading) {
    return (
      <span
        className="inline-flex items-center rounded-xl px-[22px] py-3 text-sm font-semibold text-transparent select-none"
        style={{ backgroundColor: foroPalette.tealTint }}
        aria-hidden="true"
      >
        Suscribirme
      </span>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-xl px-[22px] py-3 text-sm font-semibold text-white transition-transform duration-150 hover:-translate-y-px"
        style={{ backgroundColor: colors.ctaPrimary }}
        onClick={() => openAuthDialog('sign-up')}
      >
        Suscribirme
      </button>
    )
  }

  const firstName = user.name.split(' ')[0]

  const handleClick = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-xl py-2 pl-2 pr-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
      style={{ backgroundColor: `${colors.ctaPrimary}1a`, color: colors.ctaPrimary }}
      onClick={handleClick}
      disabled={isSigningOut}
      title="Cerrar sesión"
    >
      <span
        className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-full font-sans text-[10px] font-semibold shrink-0"
        style={{ backgroundColor: foroPalette.tealTint, color: colors.tealDeep }}
      >
        {initialsOf(user.name)}
      </span>
      {firstName}
    </button>
  )
}

export default HeaderProfileButton
