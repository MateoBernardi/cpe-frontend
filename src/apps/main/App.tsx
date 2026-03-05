import MainRouter from './router'
import ErrorBoundary from '@shared/components/ErrorBoundary'

export default function MainApp() {
  return (
    <ErrorBoundary>
      <MainRouter />
    </ErrorBoundary>
  )
}
