import React from 'react'

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{error?: any}>> {
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
      return (
        <div>
          <h1>Error</h1>
          An unexpected error occured!
        </div>
      )
    }
    return this.props.children
  }
}
