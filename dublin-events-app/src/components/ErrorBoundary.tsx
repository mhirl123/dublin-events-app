'use client'

import React, { ReactNode, ReactElement } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactElement
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo)

    // Send to monitoring (Sentry, etc.)
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      // Error reporting would go here
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#fafbfc] to-[#f3f4f6]">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h1>
              <p className="text-gray-600 mb-6">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="btn btn-primary"
              >
                Try Again
              </button>
              <p className="text-xs text-gray-400 mt-4">
                Error ID: {Math.random().toString(36).substr(2, 9)}
              </p>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
