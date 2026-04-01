import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApiError } from '@shared/api'
import MainRouter from './router'
import ErrorBoundary from '@shared/components/ErrorBoundary'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30,
      gcTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status === 429) {
          return failureCount < 3
        }
        return false
      },
      retryDelay: (attempt, error) => {
        if (error instanceof ApiError && error.status === 429) {
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
        <MainRouter />
      </ErrorBoundary>
    </QueryClientProvider>
  )
}
