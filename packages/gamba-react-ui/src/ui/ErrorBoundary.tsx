import React from 'react'

interface Props extends React.PropsWithChildren {
  onError?: (error: Error) => void
  fallback?: React.ReactNode
}

export default class ErrorBoundary extends React.Component<Props> {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError && this.props.onError(error)
    this.setState({ hasError: true, error: errorInfo })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return null
    }
    return this.props.children
  }
}
