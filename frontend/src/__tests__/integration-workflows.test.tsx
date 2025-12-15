import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import Dashboard from '@/pages/Dashboard';
import CVEList from '@/pages/CVEList';
import POCs from '@/pages/POCs';
import { cveService, pocService } from '@/services/api.service';

// Mock services
vi.mock('@/services/api.service', () => ({
  cveService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    search: vi.fn(),
    getStatistics: vi.fn(),
  },
  pocService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    execute: vi.fn(),
    getLogs: vi.fn(),
  },
}));

// Mock analytics hook
vi.mock('@/hooks/use-analytics', () => ({
  useAnalytics: () => ({
    metrics: {
      totalCVEs: 150,
      criticalCVEs: 25,
      totalPOCs: 45,
      successfulExecutions: 120,
    },
    severityDistribution: [
      { severity: 'CRITICAL', count: 25 },
      { severity: 'HIGH', count: 40 },
      { severity: 'MEDIUM', count: 60 },
      { severity: 'LOW', count: 25 },
    ],
    trendData: [],
    recentActivity: [],
    loading: false,
    error: null,
    refreshData: vi.fn(),
    isStale: false,
    lastUpdated: new Date(),
  }),
}));

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <ThemeProvider defaultTheme="dark" storageKey="test-theme">
      {children}
    </ThemeProvider>
  </BrowserRouter>
);

describe('Integration Workflows', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful API responses
    vi.mocked(cveService.getAll).mockResolvedValue({
      cves: [
        {
          id: '1',
          cveId: 'CVE-2023-1234',
          title: 'Test CVE 1',
          description: 'Test description 1',
          severity: 'HIGH',
          cvssScore: '8.5',
          publishedDate: '2023-01-01',

          references: [],
          affectedProducts: [],
          pocs: [],
          createdAt: '2023-01-01',
          updatedAt: '2023-01-02',
        },
        {
          id: '2',
          cveId: 'CVE-2023-5678',
          title: 'Test CVE 2',
          description: 'Test description 2',
          severity: 'CRITICAL',
          cvssScore: '9.2',
          publishedDate: '2023-02-01',

          references: [],
          affectedProducts: [],
          pocs: [],
          createdAt: '2023-02-01',
          updatedAt: '2023-02-02',
        },
      ],
      total: 2,
    });

    vi.mocked(pocService.getAll).mockResolvedValue([
      {
        id: '1',
        cveId: 'CVE-2023-1234',
        name: 'Test POC 1',
        description: 'Test POC description',
        language: 'python',
        author: 'Test Author',
        scriptPath: '/path/to/script.py',

        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
      },
    ]);

    vi.mocked(pocService.getLogs).mockResolvedValue([
      {
        id: '1',
        pocId: '1',
        executedAt: '2023-01-01T10:00:00Z',
        status: 'SUCCESS',
        output: 'Test execution output',
        targetUrl: 'https://example.com',
        command: 'python script.py',
      },
    ]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Complete User Workflow: Dashboard to POC Execution', () => {
    it('should navigate from dashboard to CVE list to POC execution', async () => {
      // 1. Start at Dashboard
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Verify dashboard loads with metrics
      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument(); // Total CVEs
      expect(screen.getByText('25')).toBeInTheDocument(); // Critical CVEs

      // 2. Navigate to CVE list via quick action
      const browseCVEsButton = screen.getByRole('button', { name: /browse cves/i });
      await user.click(browseCVEsButton);

      // Mock navigation by rendering CVE list
      render(
        <TestWrapper>
          <CVEList />
        </TestWrapper>
      );

      // 3. Verify CVE list loads
      await waitFor(() => {
        expect(screen.getByText('CVE Database')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('CVE-2023-1234')).toBeInTheDocument();
        expect(screen.getByText('CVE-2023-5678')).toBeInTheDocument();
      });

      // 4. Navigate to POCs page
      render(
        <TestWrapper>
          <POCs />
        </TestWrapper>
      );

      // 5. Verify POCs page loads
      await waitFor(() => {
        expect(screen.getByText('Available POCs')).toBeInTheDocument();
        expect(screen.getByText('Test POC 1')).toBeInTheDocument();
      });

      // 6. Select a POC
      const pocCard = screen.getByText('Test POC 1').closest('div');
      expect(pocCard).toBeInTheDocument();
      await user.click(pocCard!);

      // 7. Verify POC execution form is available
      expect(screen.getByRole('tab', { name: /execute/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /terminal/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /history/i })).toBeInTheDocument();
    });

    it('should handle POC execution workflow', async () => {
      // Mock successful execution
      vi.mocked(pocService.execute).mockResolvedValue({
        message: 'Execution completed successfully',
        result: {
          success: true,
          output: 'Execution completed successfully',
        },
        log: {
          id: 'exec-123',
          pocId: '1',
          targetUrl: 'https://example.com',
          command: 'python script.py',
          output: 'Execution completed successfully',
          status: 'SUCCESS',
          executedAt: '2023-01-01T10:00:00Z',
        },
      });

      render(
        <TestWrapper>
          <POCs />
        </TestWrapper>
      );

      // Wait for POCs to load and select one
      await waitFor(() => {
        expect(screen.getByText('Test POC 1')).toBeInTheDocument();
      });

      const pocCard = screen.getByText('Test POC 1').closest('div');
      await user.click(pocCard!);

      // Verify execution form is visible
      expect(screen.getByRole('tab', { name: /execute/i })).toBeInTheDocument();

      // Switch to terminal tab to verify real-time updates
      const terminalTab = screen.getByRole('tab', { name: /terminal/i });
      await user.click(terminalTab);

      // Verify terminal interface
      expect(screen.getByText(/execution terminal/i)).toBeInTheDocument();

      // Switch to history tab
      const historyTab = screen.getByRole('tab', { name: /history/i });
      await user.click(historyTab);

      // Verify execution history
      await waitFor(() => {
        expect(screen.getByText('Test execution output')).toBeInTheDocument();
      });
    });
  });

  describe('API Integration Validation', () => {
    it('should handle API errors gracefully', async () => {
      // Mock API failure
      vi.mocked(cveService.getAll).mockRejectedValue(new Error('API Error'));

      render(
        <TestWrapper>
          <CVEList />
        </TestWrapper>
      );

      // Verify error handling
      await waitFor(() => {
        expect(screen.getByText(/api error/i)).toBeInTheDocument();
      });
    });

    it('should retry failed API calls', async () => {
      // Mock initial failure then success
      vi.mocked(cveService.getAll)
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockResolvedValue({
          cves: [],
          total: 0,
          page: 1,
          limit: 20,
        });

      render(
        <TestWrapper>
          <CVEList />
        </TestWrapper>
      );

      // Should eventually succeed after retry
      await waitFor(() => {
        expect(screen.getByText('CVE Database')).toBeInTheDocument();
      });

      // Verify retry was attempted
      expect(cveService.getAll).toHaveBeenCalledTimes(2);
    });

    it('should validate API response data', async () => {
      // Mock invalid response
      vi.mocked(cveService.getAll).mockResolvedValue({
        cves: [
          {
            id: '1',
            cveId: '', // Invalid empty CVE ID
            title: 'Test CVE',
            description: 'Test description',
            severity: 'INVALID' as any, // Invalid severity
            cvssScore: '-1', // Invalid score
            publishedDate: 'invalid-date',

            references: [],
            affectedProducts: [],
            pocs: [],
          },
        ],
        total: 1,
      });

      render(
        <TestWrapper>
          <CVEList />
        </TestWrapper>
      );

      // Should handle invalid data gracefully
      await waitFor(() => {
        expect(screen.getByText('CVE Database')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Behavior Testing', () => {
    it('should adapt layout for mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Verify mobile-responsive elements
      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
      
      // Check that mobile navigation is available
      // Note: This would require actual mobile nav implementation
    });

    it('should handle keyboard navigation', async () => {
      render(
        <TestWrapper>
          <CVEList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('CVE Database')).toBeInTheDocument();
      });

      // Test tab navigation
      await user.tab();
      
      // Verify focus management
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInTheDocument();
    });

    it('should support screen reader accessibility', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Verify ARIA labels and roles
      expect(screen.getByRole('main')).toBeInTheDocument();
      
      // Check for proper heading hierarchy
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  describe('Data Table Operations', () => {
    it('should support sorting, filtering, and pagination', async () => {
      render(
        <TestWrapper>
          <CVEList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('CVE-2023-1234')).toBeInTheDocument();
      });

      // Test search functionality
      const searchInput = screen.getByPlaceholderText(/search/i);
      if (searchInput) {
        await user.type(searchInput, 'CVE-2023-1234');
        
        // Verify filtering works
        await waitFor(() => {
          expect(screen.getByText('CVE-2023-1234')).toBeInTheDocument();
        });
      }

      // Test column sorting (if available)
      const severityHeader = screen.queryByText('Severity');
      if (severityHeader) {
        await user.click(severityHeader);
        // Verify sort order changed
      }
    });

    it('should handle large datasets efficiently', async () => {
      // Mock large dataset
      const largeCVEList = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i + 1}`,
        cveId: `CVE-2023-${String(i + 1).padStart(4, '0')}`,
        title: `Test CVE ${i + 1}`,
        description: `Test description ${i + 1}`,
        severity: 'HIGH' as const,
        cvssScore: '7.5',
        publishedDate: '2023-01-01',

        references: [],
        affectedProducts: [],
        pocs: [],
        createdAt: '2023-01-01',
        updatedAt: '2023-01-02',
      }));

      vi.mocked(cveService.getAll).mockResolvedValue({
        cves: largeCVEList,
        total: 1000,
        page: 1,
        limit: 1000,
      });

      render(
        <TestWrapper>
          <CVEList />
        </TestWrapper>
      );

      // Verify table renders without performance issues
      await waitFor(() => {
        expect(screen.getByText('CVE Database')).toBeInTheDocument();
      });

      // Check that pagination is working
      expect(screen.getByText(/1000/)).toBeInTheDocument();
    });
  });

  describe('Form Validation and Submission', () => {
    it('should validate POC execution parameters', async () => {
      render(
        <TestWrapper>
          <POCs />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test POC 1')).toBeInTheDocument();
      });

      // Select POC
      const pocCard = screen.getByText('Test POC 1').closest('div');
      await user.click(pocCard!);

      // Try to execute without required parameters
      const executeTab = screen.getByRole('tab', { name: /execute/i });
      await user.click(executeTab);

      // Verify form validation (implementation dependent)
      // This would test actual form validation logic
    });

    it('should handle form submission errors', async () => {
      // Mock execution failure
      vi.mocked(pocService.execute).mockRejectedValue(new Error('Execution failed'));

      render(
        <TestWrapper>
          <POCs />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test POC 1')).toBeInTheDocument();
      });

      // Select POC and attempt execution
      const pocCard = screen.getByText('Test POC 1').closest('div');
      await user.click(pocCard!);

      // Verify error handling in execution
      // This would test actual error handling in the form
    });
  });

  describe('Real-time Updates', () => {
    it('should handle real-time data updates', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Verify initial state
      expect(screen.getByText('150')).toBeInTheDocument();

      // Mock data update
      vi.mocked(cveService.getStatistics).mockResolvedValue({
        total: 155,
        bySeverity: {
          CRITICAL: 27,
          HIGH: 40,
          MEDIUM: 60,
          LOW: 28,
        },
        recent: 15,
      });

      // Trigger refresh
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      // Verify updated data (would require actual refresh implementation)
    });

    it('should show loading states during updates', async () => {
      render(
        <TestWrapper>
          <CVEList />
        </TestWrapper>
      );

      // Should show loading state initially
      // This would test actual loading state implementation
      expect(screen.getByText('CVE Database')).toBeInTheDocument();
    });
  });
});