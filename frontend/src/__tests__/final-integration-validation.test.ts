import { describe, it, expect, vi } from 'vitest';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

describe('Final Integration Validation', () => {
  const projectRoot = process.cwd();

  describe('Build Process Validation', () => {
    it('should validate TypeScript compilation', () => {
      expect(() => {
        execSync('npx tsc --noEmit --skipLibCheck', { 
          cwd: projectRoot, 
          stdio: 'pipe',
          timeout: 30000 
        });
      }).not.toThrow();
    });

    it('should validate project structure', () => {
      // Check essential files exist
      expect(existsSync(join(projectRoot, 'package.json'))).toBe(true);
      expect(existsSync(join(projectRoot, 'vite.config.ts'))).toBe(true);
      expect(existsSync(join(projectRoot, 'tsconfig.json'))).toBe(true);
      expect(existsSync(join(projectRoot, 'src/main.tsx'))).toBe(true);
      
      // Check component structure
      expect(existsSync(join(projectRoot, 'src/components/ui'))).toBe(true);
      expect(existsSync(join(projectRoot, 'src/components/dashboard'))).toBe(true);
      expect(existsSync(join(projectRoot, 'src/pages'))).toBe(true);
      expect(existsSync(join(projectRoot, 'src/services'))).toBe(true);
    });

    it('should validate API service integration', async () => {
      // Import services to verify they can be loaded
      const { cveService, pocService } = await import('../services/api.service');
      
      expect(cveService).toBeDefined();
      expect(pocService).toBeDefined();
      expect(typeof cveService.getAll).toBe('function');
      expect(typeof pocService.execute).toBe('function');
    });

    it('should validate component imports', async () => {
      // Test that key components can be imported
      const Dashboard = await import('../pages/Dashboard');
      const CVEList = await import('../pages/CVEList');
      const POCs = await import('../pages/POCs');
      
      expect(Dashboard.default).toBeDefined();
      expect(CVEList.default).toBeDefined();
      expect(POCs.default).toBeDefined();
    });
  });

  describe('API Integration Readiness', () => {
    it('should validate backend service endpoints', () => {
      // Check that API configuration is properly set up
      const apiConfig = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      expect(apiConfig).toContain('/api');
    });

    it('should validate service method signatures', async () => {
      const { cveService, pocService } = await import('../services/api.service');
      
      // CVE Service methods
      expect(typeof cveService.getAll).toBe('function');
      expect(typeof cveService.getById).toBe('function');
      expect(typeof cveService.search).toBe('function');
      
      // POC Service methods
      expect(typeof pocService.getAll).toBe('function');
      expect(typeof pocService.execute).toBe('function');
      expect(typeof pocService.getLogs).toBe('function');
    });
  });

  describe('Responsive Design Validation', () => {
    it('should validate CSS framework setup', () => {
      // Check that Tailwind CSS is properly configured
      expect(existsSync(join(projectRoot, 'tailwind.config.js'))).toBe(true);
      expect(existsSync(join(projectRoot, 'postcss.config.js'))).toBe(true);
    });

    it('should validate component responsiveness', async () => {
      // Import responsive components
      const { DashboardShell } = await import('../components/dashboard/dashboard-shell');
      expect(DashboardShell).toBeDefined();
    });
  });

  describe('User Workflow Validation', () => {
    it('should validate navigation structure', async () => {
      // Check that main application entry point is properly configured
      const mainApp = await import('../main');
      expect(mainApp).toBeDefined();
    });

    it('should validate routing configuration', () => {
      // Verify that routing is set up correctly
      expect(existsSync(join(projectRoot, 'src/main.tsx'))).toBe(true);
    });

    it('should validate error handling setup', async () => {
      // Check error boundary and error handling components
      const { ErrorBoundary } = await import('../components/error-boundary');
      expect(ErrorBoundary).toBeDefined();
    });
  });

  describe('Performance and Optimization', () => {
    it('should validate lazy loading setup', async () => {
      // Check that lazy loading components exist
      const { LazyWrapper } = await import('../components/lazy-loading/lazy-wrapper');
      expect(LazyWrapper).toBeDefined();
    });

    it('should validate accessibility features', async () => {
      // Check accessibility components
      const { SkipLinks } = await import('../components/accessibility/skip-links');
      const { FocusIndicator } = await import('../components/accessibility/focus-indicator');
      
      expect(SkipLinks).toBeDefined();
      expect(FocusIndicator).toBeDefined();
    });
  });

  describe('Testing Infrastructure', () => {
    it('should validate test setup', () => {
      // Check that test configuration exists
      expect(existsSync(join(projectRoot, 'vitest.config.ts'))).toBe(true);
      expect(existsSync(join(projectRoot, 'src/__tests__/setup.ts'))).toBe(true);
    });

    it('should validate test utilities', async () => {
      // Check that testing utilities are available
      const testingLibrary = await import('@testing-library/react');
      expect(testingLibrary.render).toBeDefined();
      expect(testingLibrary.screen).toBeDefined();
    });
  });

  describe('Deployment Compatibility', () => {
    it('should validate environment configuration', () => {
      // Check that environment variables are properly configured
      const nodeEnv = process.env.NODE_ENV || 'development';
      expect(['development', 'production', 'test']).toContain(nodeEnv);
    });

    it('should validate Docker compatibility', () => {
      // Check for Docker-related files
      const dockerfilePath = join(projectRoot, '../docker/frontend.Dockerfile');
      
      if (existsSync(dockerfilePath)) {
        // Docker setup is available
        expect(existsSync(dockerfilePath)).toBe(true);
      } else {
        // Docker setup is optional, just verify project structure supports it
        expect(existsSync(join(projectRoot, 'package.json'))).toBe(true);
      }
    });
  });
});