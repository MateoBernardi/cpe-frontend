import type { ReactNode } from 'react'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'

interface QueryStateProps<T> {
  isLoading: boolean
  isError: boolean
  /** Message to show in the error branch — callers are expected to have
   * already inspected the error (e.g. via `getForoApiErrorMessage`) rather
   * than hardcoding a string that ignores what actually went wrong. */
  errorMessage: string
  onRetry?: () => void
  data: T[] | null | undefined
  emptyMessage: string
  loadingSize?: 'sm' | 'md' | 'lg'
  children: (data: T[]) => ReactNode
}

/**
 * The `isLoading / isError / empty / data` four-branch sequence repeated
 * across the profile panels (`GuardadosPanel`, `InteraccionesPanel`,
 * `MisPublicacionesPanel`). Orchestrates the existing `LoadingSpinner` /
 * `ErrorMessage` atoms — does not replace or reimplement them.
 */
export default function QueryState<T>({
  isLoading,
  isError,
  errorMessage,
  onRetry,
  data,
  emptyMessage,
  loadingSize = 'md',
  children,
}: QueryStateProps<T>) {
  if (isLoading) {
    return <LoadingSpinner size={loadingSize} className="py-12" />
  }

  if (isError) {
    return <ErrorMessage message={errorMessage} onRetry={onRetry} />
  }

  if (!data || data.length === 0) {
    return <p className="py-8 text-sm text-gray-500">{emptyMessage}</p>
  }

  return <>{children(data)}</>
}
