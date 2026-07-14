import { useState, useCallback, useMemo, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { foroService } from '../services'
import { mapForoUserDTO } from '../mappers'
import type { ForoSocialProvider } from '../dtos'
import { foroKeys } from '../viewmodels/foroKeys'
import { ForoAuthContext, type ForoAuthContextValue, type ForoAuthDialogMode } from './foroAuthContext'

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

  const refetch = useCallback(() => { void query.refetch() }, [query])

  const signInEmail = useCallback(async (email: string, password: string) => {
    await foroService.signInEmail({ email, password })
    await qc.invalidateQueries({ queryKey: foroKeys.session() })
  }, [qc])

  const signUpEmail = useCallback(async (email: string, password: string, name: string) => {
    await foroService.signUpEmail({ email, password, name })
    await qc.invalidateQueries({ queryKey: foroKeys.session() })
  }, [qc])

  const signInSocial = useCallback(async (provider: ForoSocialProvider, callbackURL?: string) => {
    const res = await foroService.signInSocial({ provider, callbackURL })
    if (res?.url && typeof window !== 'undefined') {
      window.location.href = res.url
    }
  }, [])

  const signOut = useCallback(async () => {
    await foroService.signOut()
    await qc.invalidateQueries({ queryKey: foroKeys.session() })
  }, [qc])

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
    refetch,
    isAuthDialogOpen,
    authDialogMode,
    openAuthDialog,
    closeAuthDialog,
  }), [user, query.isLoading, signInEmail, signUpEmail, signInSocial, signOut, refetch, isAuthDialogOpen, authDialogMode, openAuthDialog, closeAuthDialog])

  return <ForoAuthContext.Provider value={value}>{children}</ForoAuthContext.Provider>
}
