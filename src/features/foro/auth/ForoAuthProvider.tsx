import { useState, useCallback, useMemo, useEffect, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { foroService } from '../services'
import { mapForoUserDTO } from '../mappers'
import type { ForoSocialProvider } from '../dtos'
import { FORO_UNAUTHENTICATED_EVENT } from '../api/foroApiRequest'
import { foroKeys } from '../viewmodels/foroKeys'
import { ForoAuthContext, type ForoAuthContextValue, type ForoAuthDialogMode } from './foroAuthContext'

function isSafeHttpsUrl(url: string): boolean {
  try {
    return new URL(url).protocol === 'https:'
  } catch {
    return false
  }
}

export function ForoAuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient()
  const [isAuthDialogOpen, setAuthDialogOpen] = useState(false)
  const [authDialogMode, setAuthDialogMode] = useState<ForoAuthDialogMode>('sign-up')

  const query = useQuery({
    queryKey: foroKeys.session(),
    queryFn: async ({ signal }) => {
      const res = await foroService.getSession(signal)
      return res ? mapForoUserDTO(res.user) : null
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: false,
  })

  // Cross-account cache leak fix: on any auth transition, wipe every cached
  // foro query (not just the session) before refetching. `foroKeys.ts`'s
  // per-user dimensions (Part 4a) stop the leak by construction; this is the
  // belt-and-braces backstop for any key that forgets to carry a `userId`.
  const resetForoCache = useCallback(async () => {
    qc.removeQueries({ queryKey: foroKeys.all })
    await qc.refetchQueries({ queryKey: foroKeys.session() })
  }, [qc])

  // An expired/invalidated cookie surfaces as a 401 from either `foroApiRequest`
  // or the SDK adapter (`toForoApiError`) on ANY foro call, not just the
  // session query itself — a stale write-while-signed-out could otherwise
  // leave the header showing a signed-in user while every mutation 401s.
  useEffect(() => {
    const handler = () => { qc.setQueryData(foroKeys.session(), null) }
    window.addEventListener(FORO_UNAUTHENTICATED_EVENT, handler)
    return () => window.removeEventListener(FORO_UNAUTHENTICATED_EVENT, handler)
  }, [qc])

  const signInEmail = useCallback(async (email: string, password: string, captchaToken: string) => {
    await foroService.signInEmail({ email, password }, captchaToken)
    await resetForoCache()
  }, [resetForoCache])

  const signUpEmail = useCallback(async (email: string, password: string, name: string, captchaToken: string) => {
    // Sign-up requires email verification (`requireEmailVerification: true`), so this
    // normally resolves with no session yet — the cache reset just keeps things
    // honest in case the backend ever does auto-sign-in a caller in.
    await foroService.signUpEmail({ email, password, name }, captchaToken)
    await resetForoCache()
  }, [resetForoCache])

  const signInSocial = useCallback(async (provider: ForoSocialProvider) => {
    const res = await foroService.signInSocial({ provider })
    await resetForoCache()
    // Better Auth validates the redirect against `trustedOrigins` server-side, but
    // guard the scheme here too so a regression upstream can't smuggle a
    // `javascript:`/`data:` URL into `window.location.href`.
    if (res?.url && typeof window !== 'undefined' && isSafeHttpsUrl(res.url)) {
      window.location.href = res.url
    }
  }, [resetForoCache])

  const signOut = useCallback(async () => {
    await foroService.signOut()
    // Set-then-reset: if the follow-up get-session (inside resetForoCache) fails
    // (offline/5xx), the UI must still read as signed out rather than keeping
    // whatever stale user was cached before — `retry: false` on the session
    // query means there is no automatic recovery from that failure.
    qc.setQueryData(foroKeys.session(), null)
    await resetForoCache()
  }, [qc, resetForoCache])

  const openAuthDialog = useCallback((mode: ForoAuthDialogMode = 'sign-up') => {
    setAuthDialogMode(mode)
    setAuthDialogOpen(true)
  }, [])

  const closeAuthDialog = useCallback(() => setAuthDialogOpen(false), [])

  const user = query.data ?? null

  const value = useMemo<ForoAuthContextValue>(() => ({
    user,
    role: user?.role ?? null,
    isAuthenticated: user != null,
    isLoading: query.isLoading,
    signInEmail,
    signUpEmail,
    signInSocial,
    signOut,
    isAuthDialogOpen,
    authDialogMode,
    openAuthDialog,
    closeAuthDialog,
  }), [user, query.isLoading, signInEmail, signUpEmail, signInSocial, signOut, isAuthDialogOpen, authDialogMode, openAuthDialog, closeAuthDialog])

  return <ForoAuthContext.Provider value={value}>{children}</ForoAuthContext.Provider>
}
