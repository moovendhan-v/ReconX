import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import type { APIService, APIConfig, RequestOptions } from '../types';
import { APIException } from '../types';
import { defaultAPIConfig } from './api.config';
import { errorHandler } from '../lib/error-handler';

export class BaseAPIService implements APIService {
  private axiosInstance: AxiosInstance;
  public readonly baseURL: string;
  private readonly config: APIConfig;

  constructor(config: APIConfig = defaultAPIConfig) {
    this.config = config;
    this.baseURL = config.baseURL;
    
    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add timestamp for debugging
        (config as any).metadata = { startTime: Date.now() };
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Log response time for monitoring
        const duration = Date.now() - (response.config as any).metadata?.startTime;
        if (duration > 5000) {
          console.warn(`Slow API response: ${response.config.url} took ${duration}ms`);
        }
        return response;
      },
      (error) => this.handleResponseError(error)
    );
  }

  private handleResponseError(error: AxiosError): Promise<never> {
    const apiError = this.createAPIException(error);
    
    // Log the error to our error handling system
    errorHandler.handleAPIError(apiError, {
      component: 'BaseAPIService',
      action: 'API Request',
      additionalData: {
        url: error.config?.url,
        method: error.config?.method,
      },
    });
    
    return Promise.reject(apiError);
  }

  private createAPIException(error: AxiosError): APIException {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const message = (data as any)?.error || (data as any)?.message || error.message;
      return new APIException(message, status, 'HTTP_ERROR', data);
    } else if (error.request) {
      // Request was made but no response received
      return new APIException(
        'Network error: Unable to reach server',
        0,
        'NETWORK_ERROR',
        error.request
      );
    } else {
      // Something else happened
      return new APIException(error.message, 0, 'REQUEST_ERROR');
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async retryRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    retries: number = this.config.retryAttempts
  ): Promise<T> {
    let lastError: APIException;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await requestFn();
        return response.data;
      } catch (error) {
        lastError = error as APIException;

        // Don't retry on client errors (4xx) except for specific cases
        if (lastError.status && lastError.status >= 400 && lastError.status < 500) {
          if (lastError.status !== 408 && lastError.status !== 429) {
            throw lastError;
          }
        }

        // Don't retry on the last attempt
        if (attempt === retries) {
          throw lastError;
        }

        // Calculate delay with exponential backoff
        const delay = this.config.retryDelay * Math.pow(2, attempt);
        console.warn(`API request failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${delay}ms...`);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  public async request<T>(
    endpoint: string,
    options: RequestOptions & AxiosRequestConfig = {}
  ): Promise<T> {
    const { retries = this.config.retryAttempts, ...axiosOptions } = options;

    const requestFn = () => this.axiosInstance.request<T>({
      url: endpoint,
      ...axiosOptions,
    });

    return this.retryRequest(requestFn, retries);
  }

  public async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', data });
  }

  public async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', data });
  }

  public async deleteRequest<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  public async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', data });
  }

  // Health check method
  public async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health', { timeout: 5000, retries: 0 });
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const baseAPIService = new BaseAPIService();