import { createContext, useContext } from 'react'
import type { ForoUser, ForoRole } from '../models'
import type { ForoSocialProvider } from '../dtos'

export type ForoAuthDialogMode = 'sign-in' | 'sign-up' | 'check-email' | 'forgot'

export interface ForoAuthContextValue {
  /** Contract-required surface */
  user: ForoUser | null
  role: ForoRole | null
  isAuthenticated: boolean
  isLoading: boolean
  signInEmail: (email: string, password: string, captchaToken: string) => Promise<void>
  signUpEmail: (email: string, password: string, name: string, captchaToken: string) => Promise<void>
  signInSocial: (provider: ForoSocialProvider) => Promise<void>
  signOut: () => Promise<void>

  /** Additive: controls for <ForoAuthDialog/> so it can be mounted once per app. */
  isAuthDialogOpen: boolean
  authDialogMode: ForoAuthDialogMode
  openAuthDialog: (mode?: ForoAuthDialogMode) => void
  closeAuthDialog: () => void
}

export const ForoAuthContext = createContext<ForoAuthContextValue | null>(null)

export function useForoAuth(): ForoAuthContextValue {
  const ctx = useContext(ForoAuthContext)
  if (!ctx) {
    throw new Error('useForoAuth debe usarse dentro de un <ForoAuthProvider>.')
  }
  return ctx
}
