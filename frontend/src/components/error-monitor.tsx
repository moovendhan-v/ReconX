import { useState, useEffect } from 'react';
import { Bug, Trash2, Download, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { useErrorHandler } from '../hooks/use-error-handler';
import type { ErrorLogEntry } from '../lib/error-handler';

interface ErrorMonitorProps {
  className?: string;
}

export function ErrorMonitor({ className }: ErrorMonitorProps) {
  const { getErrorLogs, clearErrorLogs } = useErrorHandler();
  const [errors, setErrors] = useState<ErrorLogEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateErrors = () => {
      setErrors(getErrorLogs());
    };

    updateErrors();
    
    // Update errors every 5 seconds
    const interval = setInterval(updateErrors, 5000);
    
    return () => clearInterval(interval);
  }, [getErrorLogs]);

  const handleClearLogs = () => {
    clearErrorLogs();
    setErrors([]);
  };

  const handleDownloadLogs = () => {
    const logsData = JSON.stringify(errors, null, 2);
    const blob = new Blob([logsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reconx-error-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLevelColor = (level: ErrorLogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'info':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (errors.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            <CardTitle className="text-sm">Error Monitor</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {errors.length}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownloadLogs}
              disabled={errors.length === 0}
            >
              <Download className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearLogs}
              disabled={errors.length === 0}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <CardDescription className="text-xs">
          Recent application errors and warnings
        </CardDescription>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {errors.slice(-10).reverse().map((error, index) => (
                <div key={error.id} className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getLevelColor(error.level)} className="text-xs">
                          {error.level}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(error.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm font-medium truncate">
                        {error.message}
                      </p>
                      {error.context && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {error.context.component && (
                            <span>Component: {error.context.component}</span>
                          )}
                          {error.context.action && (
                            <span className="ml-2">Action: {error.context.action}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {index < errors.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
}

// Development-only error monitor that shows in the corner
export function DevErrorMonitor() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <ErrorMonitor />
    </div>
  );
}