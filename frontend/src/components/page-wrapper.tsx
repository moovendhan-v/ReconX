import React from 'react';
import { ErrorBoundary } from './error-boundary';
import { PageErrorFallback } from './error-fallback';
import { DevErrorMonitor } from './error-monitor';

interface PageWrapperProps {
  children: React.ReactNode;
  pageName?: string;
}

export function PageWrapper({ children, pageName }: PageWrapperProps) {
  return (
    <ErrorBoundary
      fallback={<PageErrorFallback />}
      onError={(error, errorInfo) => {
        console.error(`Error in page ${pageName}:`, error, errorInfo);
      }}
    >
      {children}
      <DevErrorMonitor />
    </ErrorBoundary>
  );
}

// Higher-order component for wrapping page components
export function withPageWrapper<P extends object>(
  Component: React.ComponentType<P>,
  pageName?: string
) {
  const WrappedComponent = (props: P) => (
    <PageWrapper pageName={pageName}>
      <Component {...props} />
    </PageWrapper>
  );

  WrappedComponent.displayName = `withPageWrapper(${Component.displayName || Component.name})`;
  return WrappedComponent;
}