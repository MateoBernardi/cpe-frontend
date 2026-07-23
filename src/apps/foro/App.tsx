import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ForoAuthProvider, ForoAuthDialog, ForoApiError } from '@features/foro'
import ErrorBoundary from '@shared/components/ErrorBoundary'
import ForoRouter from './router'
import { DemoAuthProvider } from './demo/demoAuth'
import './foro.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30,
      gcTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: (failureCount, error) => {
        if (error instanceof ForoApiError && error.status === 429) {
          return failureCount < 3
        }
        return false
      },
      retryDelay: (attempt, error) => {
        if (error instanceof ForoApiError && error.status === 429) {
          if (error.retryAfterMs != null) return error.retryAfterMs
          return Math.min(1000 * (2 ** (attempt - 1)), 4000)
        }
        return 0
      },
    },
  },
})

/**
 * In dev the foro SPA is co-hosted at `/foro.html` (see vite.config.ts's
 * `foroDeepLinkFallback` plugin, which rewrites `/foro.html/*` sub-paths back
 * to it so refreshes survive). In prod it's served at a subdomain ROOT
 * (`VITE_FORO_URL`), so the router must have no basename there. Deriving the
 * basename from the actual pathname (rather than an env flag) keeps both
 * `npm run dev` and `npm run preview`/prod correct without extra config.
 */
const FORO_BASENAME =
  window.location.pathname === '/foro.html' || window.location.pathname.startsWith('/foro.html/')
    ? '/foro.html'
    : '/'

export default function ForoApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <ForoAuthProvider>
        <ErrorBoundary>
          <BrowserRouter basename={FORO_BASENAME}>
            {/* DEMO ONLY — single wrapping element, easy to remove when real auth ships. */}
            <DemoAuthProvider>
              <ForoRouter />
            </DemoAuthProvider>
          </BrowserRouter>
          <ForoAuthDialog />
        </ErrorBoundary>
      </ForoAuthProvider>
    </QueryClientProvider>
  )
}
