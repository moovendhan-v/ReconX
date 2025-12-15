import { describe, it, expect, beforeEach, vi } from 'vitest';
import { errorHandler } from '../error-handler';
import { APIException } from '../../types';

describe('Error Handler', () => {
  beforeEach(() => {
    errorHandler.clearErrorLogs();
    vi.clearAllMocks();
  });

  it('should log errors to the error queue', () => {
    const testError = new Error('Test error');
    
    errorHandler.handleError(testError, {
      component: 'TestComponent',
      action: 'Test Action',
    });

    const logs = errorHandler.getErrorLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].message).toBe('Test error');
    expect(logs[0].context?.component).toBe('TestComponent');
    expect(logs[0].context?.action).toBe('Test Action');
  });

  it('should handle API errors with status codes', () => {
    const apiError = new APIException('API Error', 404, 'NOT_FOUND');
    
    errorHandler.handleAPIError(apiError, {
      component: 'APIComponent',
      action: 'API Call',
    });

    const logs = errorHandler.getErrorLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].message).toBe('API Error');
    expect(logs[0].context?.additionalData?.status).toBe(404);
    expect(logs[0].context?.additionalData?.code).toBe('NOT_FOUND');
  });

  it('should handle warnings and info messages', () => {
    errorHandler.handleWarning('Test warning', { component: 'TestComponent' });
    errorHandler.handleInfo('Test info', { component: 'TestComponent' });

    const logs = errorHandler.getErrorLogs();
    expect(logs).toHaveLength(2);
    expect(logs[0].level).toBe('warning');
    expect(logs[1].level).toBe('info');
  });

  it('should clear error logs', () => {
    errorHandler.handleError(new Error('Test error'));
    expect(errorHandler.getErrorLogs()).toHaveLength(1);

    errorHandler.clearErrorLogs();
    expect(errorHandler.getErrorLogs()).toHaveLength(0);
  });

  it('should retry operations with exponential backoff', async () => {
    let attempts = 0;
    const operation = vi.fn().mockImplementation(() => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Temporary error');
      }
      return Promise.resolve('success');
    });

    const result = await errorHandler.retryOperation(operation, 3, 10);

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('should fail after max retries', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('Persistent error'));

    await expect(
      errorHandler.retryOperation(operation, 2, 10)
    ).rejects.toThrow('Persistent error');

    expect(operation).toHaveBeenCalledTimes(2); // Initial + 1 retry (maxRetries = 2)
  });

  it('should create recovery actions', () => {
    const mockAction = vi.fn();
    const recoveryAction = errorHandler.createErrorRecoveryAction('Test Action', mockAction);

    expect(recoveryAction.label).toBe('Test Action');
    expect(typeof recoveryAction.onClick).toBe('function');
  });

  it('should generate unique error IDs', () => {
    const error1 = new Error('Error 1');
    const error2 = new Error('Error 2');

    errorHandler.handleError(error1);
    errorHandler.handleError(error2);

    const logs = errorHandler.getErrorLogs();
    expect(logs).toHaveLength(2);
    expect(logs[0].id).not.toBe(logs[1].id);
  });

  it('should include timestamp and context in error logs', () => {
    const testError = new Error('Test error');
    const context = {
      component: 'TestComponent',
      action: 'Test Action',
      additionalData: { key: 'value' },
    };

    errorHandler.handleError(testError, context);

    const logs = errorHandler.getErrorLogs();
    const log = logs[0];

    expect(log.timestamp).toBeDefined();
    expect(log.userAgent).toBeDefined();
    expect(log.url).toBeDefined();
    expect(log.context).toEqual(context);
  });
});