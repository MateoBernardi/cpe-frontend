import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApiError } from '@shared/api'
import { ForoApiError, ForoAuthProvider, ForoAuthDialog, ModerationNoticeDialog } from '@features/foro'
import { ExternalLinkGuardProvider } from '@features/content/components/foro'
import MainRouter from './router'
import ErrorBoundary from '@shared/components/ErrorBoundary'

function isRateLimited(error: unknown): error is ApiError | ForoApiError {
  return (error instanceof ApiError || error instanceof ForoApiError) && error.status === 429
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30,
      gcTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: (failureCount, error) => {
        if (isRateLimited(error)) {
          return failureCount < 3
        }
        return false
      },
      retryDelay: (attempt, error) => {
        if (isRateLimited(error)) {
          if (error.retryAfterMs != null) return error.retryAfterMs
          return Math.min(1000 * (2 ** (attempt - 1)), 4000)
        }
        return 0
      },
    },
  },
})

export default function MainApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <ForoAuthProvider>
          {/* Un solo interstitial de salida para toda la app, igual que el
              diálogo de auth — ver `externalLinkGuard.tsx`. */}
          <ExternalLinkGuardProvider>
            <MainRouter />
            <ForoAuthDialog />
            <ModerationNoticeDialog />
          </ExternalLinkGuardProvider>
        </ForoAuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}
