'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary para capturar errores en componentes hijos
 * 
 * @example
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Error capturado:', error)
    console.error('[ErrorBoundary] Componente:', errorInfo.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Algo salió mal</h2>
              <p className="text-muted-foreground mb-4">
                {this.state.error?.message || 'Ha ocurrido un error inesperado'}
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={this.handleRetry}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar
                </Button>
                <Button onClick={this.handleReload}>
                  Recargar página
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Componente de error simple para usar como fallback
 */
export function ErrorFallback({ 
  message = 'Ha ocurrido un error',
  onRetry 
}: { 
  message?: string
  onRetry?: () => void 
}) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
        <p className="text-muted-foreground">{message}</p>
        {onRetry && (
          <Button variant="link" onClick={onRetry} className="mt-2">
            Reintentar
          </Button>
        )}
      </div>
    </div>
  )
}

/**
 * HOC para envolver componentes con ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }
}
