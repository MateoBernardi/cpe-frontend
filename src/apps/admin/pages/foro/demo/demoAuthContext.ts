// DEMO ONLY — delete this folder and swap useDemoAuth() → useForoAuth() when real auth ships.
import { createContext, useContext } from 'react'
import type { ForoUser, ForoRole } from '@features/foro'

export type DemoAuthState = 'logged-out' | 'visitor' | 'publisher'

export const DEMO_USERS: Record<'visitor' | 'publisher', ForoUser> = {
  visitor: { id: 'demo-visitor-1', name: 'Valentina Ríos', email: 'valentina.rios@example.com', role: 'visitor' },
  publisher: { id: 'demo-publisher-1', name: 'Martín Aguirre', email: 'martin.aguirre@example.com', role: 'publisher' },
}

export interface DemoAuthContextValue {
  /** Field names mirror useForoAuth() for a mechanical later swap. */
  user: ForoUser | null
  role: ForoRole | null
  isAuthenticated: boolean
  /** Demo-only additions — not part of the real contract. */
  demoState: DemoAuthState
  setDemoState: (state: DemoAuthState) => void
  signOutDemo: () => void
}

export const DemoAuthContext = createContext<DemoAuthContextValue | null>(null)

export function useDemoAuth(): DemoAuthContextValue {
  const ctx = useContext(DemoAuthContext)
  if (!ctx) {
    throw new Error('useDemoAuth debe usarse dentro de un <DemoAuthProvider>.')
  }
  return ctx
}
