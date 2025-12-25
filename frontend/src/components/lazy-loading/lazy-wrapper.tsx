import { Suspense, ComponentType, ReactNode } from 'react'

interface LazyWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  className?: string
}

export function LazyWrapper({ children, fallback, className }: LazyWrapperProps) {
  const defaultFallback = null; // No skeleton loading

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  )
}

// Higher-order component for lazy loading
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  fallback?: ReactNode
) {
  return function LazyComponent(props: P) {
    return (
      <LazyWrapper fallback={fallback}>
        <Component {...props} />
      </LazyWrapper>
    )
  }
}