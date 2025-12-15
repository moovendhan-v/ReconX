import type { APIConfig } from '../types';

// Environment configuration
export const getAPIConfig = (): APIConfig => {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const timeout = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');
  const retryAttempts = parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || '3');
  const retryDelay = parseInt(import.meta.env.VITE_API_RETRY_DELAY || '1000');

  return {
    baseURL: `${baseURL}/api`,
    timeout,
    retryAttempts,
    retryDelay,
  };
};

// Validate environment configuration
export const validateAPIConfig = (config: APIConfig): void => {
  if (!config.baseURL) {
    throw new Error('API base URL is required');
  }

  if (config.timeout <= 0) {
    throw new Error('API timeout must be positive');
  }

  if (config.retryAttempts < 0) {
    throw new Error('Retry attempts must be non-negative');
  }

  if (config.retryDelay < 0) {
    throw new Error('Retry delay must be non-negative');
  }
};

// Default configuration
export const defaultAPIConfig = getAPIConfig();
validateAPIConfig(defaultAPIConfig);