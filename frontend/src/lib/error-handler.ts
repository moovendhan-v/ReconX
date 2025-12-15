import { toast } from '../hooks/use-toast';
import { APIException } from '../types';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  additionalData?: Record<string, any>;
}

export interface ErrorLogEntry {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context?: ErrorContext;
  userAgent: string;
  url: string;
}

class ErrorHandler {
  private errorQueue: ErrorLogEntry[] = [];
  private maxQueueSize = 50;
  private isOnline = navigator.onLine;

  constructor() {
    this.setupGlobalErrorHandlers();
    this.setupNetworkMonitoring();
  }

  private setupGlobalErrorHandlers() {
    // Handle unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError(new Error(event.message), {
        component: 'Global',
        action: 'JavaScript Error',
        additionalData: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        {
          component: 'Global',
          action: 'Unhandled Promise Rejection',
        }
      );
    });
  }

  private setupNetworkMonitoring() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createErrorLogEntry(
    error: Error,
    level: ErrorLogEntry['level'] = 'error',
    context?: ErrorContext
  ): ErrorLogEntry {
    return {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      level,
      message: error.message,
      stack: error.stack,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
  }

  private addToQueue(errorLog: ErrorLogEntry) {
    this.errorQueue.push(errorLog);
    
    // Maintain queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem('reconx_error_queue', JSON.stringify(this.errorQueue));
    } catch (e) {
      console.warn('Failed to store error queue in localStorage:', e);
    }

    // Try to flush if online
    if (this.isOnline) {
      this.flushErrorQueue();
    }
  }

  private async flushErrorQueue() {
    if (this.errorQueue.length === 0) return;

    try {
      // In a real application, you would send these to your error monitoring service
      // For now, we'll just log them and clear the queue
      console.group('Flushing Error Queue');
      this.errorQueue.forEach((error) => {
        console.error('Error Log:', error);
      });
      console.groupEnd();

      // Don't clear the queue in test environment to allow inspection
      if (process.env.NODE_ENV !== 'test') {
        this.errorQueue = [];
        localStorage.removeItem('reconx_error_queue');
      }
    } catch (e) {
      console.error('Failed to flush error queue:', e);
    }
  }

  public handleError(error: Error, context?: ErrorContext) {
    const errorLog = this.createErrorLogEntry(error, 'error', context);
    this.addToQueue(errorLog);

    // Show user-friendly error message
    this.showUserError(error, context);
  }

  public handleAPIError(error: APIException, context?: ErrorContext) {
    const errorLog = this.createErrorLogEntry(error, 'error', {
      ...context,
      additionalData: {
        ...context?.additionalData,
        status: error.status,
        code: error.code,
        details: error.details,
      },
    });
    
    this.addToQueue(errorLog);
    this.showAPIError(error, context);
  }

  public handleWarning(message: string, context?: ErrorContext) {
    const warning = new Error(message);
    const errorLog = this.createErrorLogEntry(warning, 'warning', context);
    this.addToQueue(errorLog);
  }

  public handleInfo(message: string, context?: ErrorContext) {
    const info = new Error(message);
    const errorLog = this.createErrorLogEntry(info, 'info', context);
    this.addToQueue(errorLog);
  }

  private showUserError(_error: Error, context?: ErrorContext) {
    const action = context?.action || 'operation';
    
    toast({
      variant: 'destructive',
      title: 'Error',
      description: `An error occurred during ${action}. Please try again.`,
    });
  }

  private showAPIError(error: APIException, _context?: ErrorContext) {
    let title = 'Network Error';
    let description = 'Please check your connection and try again.';

    if (error.status) {
      switch (Math.floor(error.status / 100)) {
        case 4:
          title = 'Request Error';
          if (error.status === 401) {
            description = 'You are not authorized to perform this action.';
          } else if (error.status === 403) {
            description = 'Access denied. You do not have permission.';
          } else if (error.status === 404) {
            description = 'The requested resource was not found.';
          } else if (error.status === 429) {
            description = 'Too many requests. Please wait and try again.';
          } else {
            description = error.message || 'Invalid request. Please check your input.';
          }
          break;
        case 5:
          title = 'Server Error';
          description = 'Server is experiencing issues. Please try again later.';
          break;
        default:
          description = error.message || description;
      }
    } else if (error.code === 'NETWORK_ERROR') {
      title = 'Connection Error';
      description = 'Unable to connect to the server. Please check your internet connection.';
    }

    toast({
      variant: 'destructive',
      title,
      description,
    });
  }

  public getErrorLogs(): ErrorLogEntry[] {
    return [...this.errorQueue];
  }

  public clearErrorLogs() {
    this.errorQueue = [];
    localStorage.removeItem('reconx_error_queue');
  }

  // Recovery methods
  public async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    context?: ErrorContext
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          this.handleError(lastError, {
            ...context,
            action: `${context?.action || 'Operation'} (Failed after ${maxRetries} attempts)`,
          });
          throw lastError;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }

    throw lastError!;
  }

  public createErrorRecoveryAction(
    label: string,
    action: () => void | Promise<void>
  ) {
    return {
      label,
      onClick: async () => {
        try {
          await action();
        } catch (error) {
          this.handleError(error as Error, {
            action: `Recovery Action: ${label}`,
          });
        }
      },
    };
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

// Utility functions for common error scenarios
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: ErrorContext
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof APIException) {
        errorHandler.handleAPIError(error, context);
      } else {
        errorHandler.handleError(error as Error, context);
      }
      throw error;
    }
  };
};

export const safeAsync = <T>(
  promise: Promise<T>,
  context?: ErrorContext
): Promise<[T | null, Error | null]> => {
  return promise
    .then((data) => [data, null] as [T, null])
    .catch((error) => {
      if (error instanceof APIException) {
        errorHandler.handleAPIError(error, context);
      } else {
        errorHandler.handleError(error as Error, context);
      }
      return [null, error] as [null, Error];
    });
};