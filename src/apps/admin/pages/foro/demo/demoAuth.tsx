// DEMO ONLY — delete this folder and swap useDemoAuth() → useForoAuth() when real auth ships.
import { useEffect, useState, type ReactNode } from 'react'
import { DEMO_USERS, DemoAuthContext, type DemoAuthState } from './demoAuthContext'

const STORAGE_KEY = 'FORO_DEMO_AUTH_STATE'

function readInitialState(): DemoAuthState {
  if (typeof window === 'undefined') return 'logged-out'
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === 'visitor' || raw === 'publisher' || raw === 'logged-out') return raw
    return 'logged-out'
  } catch {
    return 'logged-out'
  }
}

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [demoState, setDemoStateRaw] = useState<DemoAuthState>(readInitialState)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, demoState)
    } catch {
      // ignore (private browsing / storage disabled) — demo state just won't persist
    }
  }, [demoState])

  const setDemoState = (state: DemoAuthState) => setDemoStateRaw(state)
  const signOutDemo = () => setDemoStateRaw('logged-out')

  const user = demoState === 'logged-out' ? null : DEMO_USERS[demoState]
  const role = user?.role ?? null

  return (
    <DemoAuthContext.Provider
      value={{ user, role, isAuthenticated: demoState !== 'logged-out', demoState, setDemoState, signOutDemo }}
    >
      {children}
    </DemoAuthContext.Provider>
  )
}
