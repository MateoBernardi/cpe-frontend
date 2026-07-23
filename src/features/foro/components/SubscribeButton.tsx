import { useState, type CSSProperties, type MouseEvent } from 'react'
import { useForoAuth } from '../auth'
import { colors, fonts } from '../../../theme'

export type SubscribeButtonVariant = 'teal' | 'navy' | 'ghost' | 'light'

export interface SubscribeButtonProps {
  className?: string
  variant?: SubscribeButtonVariant
  /** Label shown when the user is NOT authenticated. Default: "Suscribirme". */
  signedOutLabel?: string
  /** Label shown when the user IS authenticated. Default: "Cerrar sesión". */
  signedInLabel?: string
}

/**
 * Solid coloured-fill CTAs (`teal`/`navy`) keep `rounded-xl` — the design's
 * one remarked exception to the otherwise square-cornered Foro surfaces.
 * `ghost`/`light` are quiet variants and stay square.
 */
const VARIANT_CLASSNAMES: Record<SubscribeButtonVariant, string> = {
  teal: 'rounded-xl text-white',
  navy: 'rounded-xl text-white',
  ghost: '',
  light: 'border',
}

function variantStyle(variant: SubscribeButtonVariant): CSSProperties {
  switch (variant) {
    case 'teal':
      return { backgroundColor: colors.ctaPrimary }
    case 'navy':
      return { backgroundColor: colors.blueDark }
    case 'ghost':
      return { backgroundColor: `${colors.ctaPrimary}1a`, color: colors.ctaPrimary }
    case 'light':
      return { backgroundColor: colors.white, color: colors.ctaPrimary, borderColor: colors.lightGray }
  }
}

/**
 * The "intelligent subscription" button:
 * - not authenticated -> opens <ForoAuthDialog/> (via ForoAuthProvider's dialog state)
 * - authenticated -> shows "Cerrar sesión" and calls signOut()
 */
export function SubscribeButton({
  className,
  variant = 'teal',
  signedOutLabel = 'Suscribirme',
  signedInLabel = 'Cerrar sesión',
}: SubscribeButtonProps) {
  const { isAuthenticated, isLoading, signOut, openAuthDialog } = useForoAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!isAuthenticated) {
      openAuthDialog('sign-up')
      return
    }
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
      className={[
        'inline-flex items-center justify-center gap-2 px-[22px] py-3 text-sm font-semibold transition-transform duration-150 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0',
        VARIANT_CLASSNAMES[variant],
        className,
      ].filter(Boolean).join(' ')}
      style={{ fontFamily: fonts.primary, ...variantStyle(variant) }}
      onClick={handleClick}
      disabled={isLoading || isSigningOut}
    >
      {isAuthenticated ? signedInLabel : signedOutLabel}
    </button>
  )
}

export default SubscribeButton
