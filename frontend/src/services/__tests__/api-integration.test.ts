import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cveService, pocService } from '../api.service';
import { APIException } from '../../types';

// Mock axios to avoid actual network calls
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      request: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}));

describe('API Integration Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CVE Service', () => {
    it('should have all required methods', () => {
      expect(cveService.getAll).toBeDefined();
      expect(cveService.getById).toBeDefined();
      expect(cveService.create).toBeDefined();
      expect(cveService.update).toBeDefined();
      expect(cveService.delete).toBeDefined();
      expect(cveService.search).toBeDefined();
    });

    it('should validate CVE ID format', async () => {
      await expect(cveService.getById('')).rejects.toThrow('CVE ID is required');
      await expect(cveService.getById(123 as any)).rejects.toThrow('must be a string');
    });

    it('should validate search query', async () => {
      await expect(cveService.search('')).rejects.toThrow('Search query is required');
      await expect(cveService.search(null as any)).rejects.toThrow('must be a string');
    });
  });

  describe('POC Service', () => {
    it('should have all required methods', () => {
      expect(pocService.getAll).toBeDefined();
      expect(pocService.getById).toBeDefined();
      expect(pocService.upload).toBeDefined();
      expect(pocService.execute).toBeDefined();
      expect(pocService.getLogs).toBeDefined();
      expect(pocService.delete).toBeDefined();
    });

    it('should validate POC ID format', async () => {
      await expect(pocService.getById('')).rejects.toThrow('POC ID is required');
      await expect(pocService.getById(123 as any)).rejects.toThrow('must be a string');
    });

    it('should validate execution request', async () => {
      const invalidRequest = { targetUrl: '', command: '' };
      await expect(pocService.execute('test-id', invalidRequest)).rejects.toThrow();
    });

    it('should validate logs limit', async () => {
      await expect(pocService.getLogs('test-id', 0)).rejects.toThrow('between 1 and 1000');
      await expect(pocService.getLogs('test-id', 1001)).rejects.toThrow('between 1 and 1000');
    });
  });

  describe('Error Handling', () => {
    it('should create APIException with proper properties', () => {
      const error = new APIException('Test error', 404, 'NOT_FOUND', { detail: 'test' });
      
      expect(error.message).toBe('Test error');
      expect(error.status).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.details).toEqual({ detail: 'test' });
      expect(error.name).toBe('APIException');
    });
  });

  describe('Form Data Helper', () => {
    it('should create proper FormData for POC upload', () => {
      const file = new File(['test content'], 'test.py', { type: 'text/plain' });
      const pocData = {
        script: file,
        cveId: 'CVE-2023-1234',
        name: 'Test POC',
        description: 'Test description',
        language: 'python',
        author: 'Test Author',
      };

      const formData = pocService.createUploadFormData(pocData);
      
      expect(formData.get('script')).toBe(file);
      expect(formData.get('cveId')).toBe('CVE-2023-1234');
      expect(formData.get('name')).toBe('Test POC');
      expect(formData.get('description')).toBe('Test description');
      expect(formData.get('language')).toBe('python');
      expect(formData.get('author')).toBe('Test Author');
    });
  });
});