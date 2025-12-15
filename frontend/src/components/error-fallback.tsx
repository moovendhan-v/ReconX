
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  context?: string;
  showDetails?: boolean;
}

export function ErrorFallback({ 
  error, 
  resetError, 
  context = 'application',
  showDetails = false 
}: ErrorFallbackProps) {
  const handleReportError = () => {
    // In a real application, this would open a bug report form
    // or send the error to your error tracking service
    const errorData = {
      message: error?.message,
      stack: error?.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    console.log('Error report data:', errorData);
    
    // You could also copy to clipboard or open email client
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(errorData, null, 2));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Oops! Something went wrong</CardTitle>
          <CardDescription>
            An error occurred in the {context}. Don't worry, we've been notified and will fix this soon.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && showDetails && (
            <Alert variant="destructive">
              <Bug className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <div className="font-semibold mb-1">Error Details:</div>
                <div className="font-mono text-xs bg-muted p-2 rounded">
                  {error.message}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-2">
            {resetError && (
              <Button onClick={resetError} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/dashboard'} 
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={handleReportError}
              className="w-full text-sm"
            >
              <Bug className="mr-2 h-4 w-4" />
              Report This Issue
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <Badge variant="outline" className="text-xs">
              Error ID: {Date.now().toString(36)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Specific error fallbacks for different contexts
export function APIErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <ErrorFallback 
      error={error} 
      resetError={resetError} 
      context="API connection" 
      showDetails={process.env.NODE_ENV === 'development'}
    />
  );
}

export function ComponentErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <ErrorFallback 
      error={error} 
      resetError={resetError} 
      context="component" 
      showDetails={process.env.NODE_ENV === 'development'}
    />
  );
}

export function PageErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <ErrorFallback 
      error={error} 
      resetError={resetError} 
      context="page" 
      showDetails={process.env.NODE_ENV === 'development'}
    />
  );
}