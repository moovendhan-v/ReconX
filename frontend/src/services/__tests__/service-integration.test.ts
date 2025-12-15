import { describe, it, expect } from 'vitest';
import { getAPIConfig, validateAPIConfig } from '../api.config';
import { BaseAPIService } from '../base-api.service';

describe('Service Integration Tests', () => {
  describe('API Configuration', () => {
    it('should load configuration from environment', () => {
      const config = getAPIConfig();
      
      expect(config.baseURL).toBeDefined();
      expect(config.timeout).toBeGreaterThan(0);
      expect(config.retryAttempts).toBeGreaterThanOrEqual(0);
      expect(config.retryDelay).toBeGreaterThanOrEqual(0);
    });

    it('should validate configuration correctly', () => {
      const validConfig = {
        baseURL: 'http://localhost:3000/api',
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
      };

      expect(() => validateAPIConfig(validConfig)).not.toThrow();

      const invalidConfig = {
        baseURL: '',
        timeout: -1,
        retryAttempts: -1,
        retryDelay: -1,
      };

      expect(() => validateAPIConfig(invalidConfig)).toThrow();
    });
  });

  describe('Base API Service', () => {
    it('should create service instance with default config', () => {
      const service = new BaseAPIService();
      
      expect(service.baseURL).toBeDefined();
      expect(service.baseURL).toContain('/api');
    });

    it('should have all HTTP methods available', () => {
      const service = new BaseAPIService();
      
      expect(service.get).toBeDefined();
      expect(service.post).toBeDefined();
      expect(service.put).toBeDefined();
      expect(service.patch).toBeDefined();
      expect(service.deleteRequest).toBeDefined();
      expect(service.request).toBeDefined();
      expect(service.healthCheck).toBeDefined();
    });
  });

  describe('Service Method Signatures', () => {
    it('should have correct CVE service method signatures', async () => {
      const { cveService } = await import('../cve.service');
      
      // Test method existence and basic signature validation
      expect(typeof cveService.getAll).toBe('function');
      expect(typeof cveService.getById).toBe('function');
      expect(typeof cveService.create).toBe('function');
      expect(typeof cveService.update).toBe('function');
      expect(typeof cveService.delete).toBe('function');
      expect(typeof cveService.search).toBe('function');
      expect(typeof cveService.getBySeverity).toBe('function');
      expect(typeof cveService.getRecent).toBe('function');
      expect(typeof cveService.getStatistics).toBe('function');
    });

    it('should have correct POC service method signatures', async () => {
      const { pocService } = await import('../poc.service');
      
      // Test method existence and basic signature validation
      expect(typeof pocService.getAll).toBe('function');
      expect(typeof pocService.getById).toBe('function');
      expect(typeof pocService.upload).toBe('function');
      expect(typeof pocService.execute).toBe('function');
      expect(typeof pocService.getLogs).toBe('function');
      expect(typeof pocService.delete).toBe('function');
      expect(typeof pocService.getByCVE).toBe('function');
      expect(typeof pocService.getByLanguage).toBe('function');
      expect(typeof pocService.getByAuthor).toBe('function');
      expect(typeof pocService.getRecentExecutions).toBe('function');
      expect(typeof pocService.getExecutionStatistics).toBe('function');
      expect(typeof pocService.createUploadFormData).toBe('function');
    });
  });

  describe('Type Safety', () => {
    it('should export all required types', async () => {
      const types = await import('../../types');
      
      // Verify key types are exported
      expect(types.APIException).toBeDefined();
      expect(typeof types.APIException).toBe('function');
    });

    it('should have proper service interfaces', async () => {
      const { cveService, pocService } = await import('../api.service');
      
      // Verify services implement expected interface
      expect(cveService.baseURL).toBeDefined();
      expect(pocService.baseURL).toBeDefined();
    });
  });
});