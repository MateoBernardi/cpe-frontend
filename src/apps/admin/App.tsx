import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AdminRouter from './router'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
      retry: 1,
    },
  },
})

export default function AdminApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminRouter />
    </QueryClientProvider>
  )
}
