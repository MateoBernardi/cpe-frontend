import { useState, type MouseEvent } from 'react'
import { useForoAuth } from '../auth'
import '../styles/tokens.css'

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
 * The "intelligent subscription" button:
 * - not authenticated -> opens <ForoAuthDialog/> (via ForoAuthProvider's dialog state)
 * - authenticated -> shows "Cerrar sesión" and calls signOut()
 *
 * Wrapped in `.foro-scope` so it can be dropped into the institutional
 * main/admin chrome without leaking Foro's typography/reset globally.
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

  const variantClass = `foro-btn-${variant}`

  return (
    <span className="foro-scope" style={{ display: 'inline-flex' }}>
      <button
        type="button"
        className={['foro-btn', variantClass, 'foro-btn-subscribe', className].filter(Boolean).join(' ')}
        onClick={handleClick}
        disabled={isLoading || isSigningOut}
      >
        {isAuthenticated ? signedInLabel : signedOutLabel}
      </button>
    </span>
  )
}

export default SubscribeButton
