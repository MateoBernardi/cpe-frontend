import { Component, type ErrorInfo, type ReactNode } from 'react'
import ErrorFallbackPage from './ErrorFallbackPage'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * React Error Boundary.
 * Catches render errors in any descendant component and shows a branded
 * fallback page with contact information and a retry button.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  // React passes the error here, but only the flag is needed — the value is
  // logged in componentDidCatch. Declaring no parameter keeps the linter happy.
  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log to console in dev — could be replaced with a remote logger
    console.error('[ErrorBoundary] Caught rendering error:', error, info)
  }

  handleRetry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallbackPage onRetry={this.handleRetry} />
    }
    return this.props.children
  }
}
