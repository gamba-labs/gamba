import React from 'react'

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{error?: JSX.Element}>> {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ hasError: true, error: errorInfo })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.error) {
        return <>{this.props.error}</>
      }
      return null
    }
    return this.props.children
  }
}
