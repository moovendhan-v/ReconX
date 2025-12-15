import { useCallback } from 'react';
import { errorHandler, ErrorContext, withErrorHandling, safeAsync } from '../lib/error-handler';
import { APIException } from '../types';

export function useErrorHandler() {
  const handleError = useCallback((error: Error, context?: ErrorContext) => {
    errorHandler.handleError(error, context);
  }, []);

  const handleAPIError = useCallback((error: APIException, context?: ErrorContext) => {
    errorHandler.handleAPIError(error, context);
  }, []);

  const handleWarning = useCallback((message: string, context?: ErrorContext) => {
    errorHandler.handleWarning(message, context);
  }, []);

  const handleInfo = useCallback((message: string, context?: ErrorContext) => {
    errorHandler.handleInfo(message, context);
  }, []);

  const retryOperation = useCallback(
    <T>(
      operation: () => Promise<T>,
      maxRetries?: number,
      delay?: number,
      context?: ErrorContext
    ) => {
      return errorHandler.retryOperation(operation, maxRetries, delay, context);
    },
    []
  );

  const createRecoveryAction = useCallback(
    (label: string, action: () => void | Promise<void>) => {
      return errorHandler.createErrorRecoveryAction(label, action);
    },
    []
  );

  const withErrorHandlingWrapper = useCallback(
    <T extends any[], R>(fn: (...args: T) => Promise<R>, context?: ErrorContext) => {
      return withErrorHandling(fn, context);
    },
    []
  );

  const safeAsyncWrapper = useCallback(
    <T>(promise: Promise<T>, context?: ErrorContext) => {
      return safeAsync(promise, context);
    },
    []
  );

  const getErrorLogs = useCallback(() => {
    return errorHandler.getErrorLogs();
  }, []);

  const clearErrorLogs = useCallback(() => {
    errorHandler.clearErrorLogs();
  }, []);

  return {
    handleError,
    handleAPIError,
    handleWarning,
    handleInfo,
    retryOperation,
    createRecoveryAction,
    withErrorHandling: withErrorHandlingWrapper,
    safeAsync: safeAsyncWrapper,
    getErrorLogs,
    clearErrorLogs,
  };
}

// Hook for handling async operations with automatic error handling
export function useAsyncOperation() {
  const { handleError, handleAPIError, safeAsync } = useErrorHandler();

  const executeAsync = useCallback(
    async <T>(
      operation: () => Promise<T>,
      context?: ErrorContext
    ): Promise<T | null> => {
      const [result] = await safeAsync(operation(), context);
      return result;
    },
    [safeAsync]
  );

  const executeWithRetry = useCallback(
    async <T>(
      operation: () => Promise<T>,
      options?: {
        maxRetries?: number;
        delay?: number;
        context?: ErrorContext;
      }
    ): Promise<T | null> => {
      try {
        return await errorHandler.retryOperation(
          operation,
          options?.maxRetries,
          options?.delay,
          options?.context
        );
      } catch (error) {
        return null;
      }
    },
    []
  );

  return {
    executeAsync,
    executeWithRetry,
    handleError,
    handleAPIError,
  };
}