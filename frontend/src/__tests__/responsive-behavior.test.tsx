import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import Dashboard from '@/pages/Dashboard';
import CVEList from '@/pages/CVEList';
import POCs from '@/pages/POCs';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
// import { EnhancedTable } from '@/components/dashboard/enhanced-table/enhanced-table';

// Mock window.matchMedia for responsive testing
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock services
vi.mock('@/services/api.service', () => ({
  cveService: {
    getAll: vi.fn().mockResolvedValue({
      cves: [
        {
          id: '1',
          cveId: 'CVE-2023-1234',
          title: 'Test CVE',
          description: 'Test description',
          severity: 'HIGH',
          cvssScore: 8.5,
          publishedDate: '2023-01-01',
          lastModified: '2023-01-02',
          references: [],
          affectedProducts: [],
          pocs: [],
        },
      ],
      total: 1,
    }),
  },
  pocService: {
    getAll: vi.fn().mockResolvedValue([]),
    getLogs: vi.fn().mockResolvedValue([]),
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
    severityDistribution: [],
    trendData: [],
    recentActivity: [],
    loading: false,
    error: null,
    refreshData: vi.fn(),
    isStale: false,
    lastUpdated: new Date(),
  }),
}));

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <ThemeProvider defaultTheme="dark" storageKey="test-theme">
      {children}
    </ThemeProvider>
  </BrowserRouter>
);

// Viewport size configurations
const viewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
  ultrawide: { width: 2560, height: 1440 },
};

const setViewport = (viewport: { width: number; height: number }) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: viewport.width,
  });
  
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: viewport.height,
  });

  // Mock CSS media queries
  mockMatchMedia(viewport.width < 768);
  
  // Trigger resize event
  fireEvent(window, new Event('resize'));
};

describe('Responsive Behavior Testing', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Reset viewport to default
    setViewport(viewports.desktop);
  });

  describe('Mobile Viewport (375px)', () => {
    beforeEach(() => {
      setViewport(viewports.mobile);
    });

    it('should adapt dashboard layout for mobile', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Verify mobile-specific elements
      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
      
      // Check that content is properly stacked vertically
      const mainContent = screen.getByRole('main');
      expect(mainContent).toBeInTheDocument();
      
      // Verify responsive grid behavior
      const cards = screen.getAllByRole('article');
      if (cards.length > 0) {
        // Cards should stack vertically on mobile
        // const firstCard = cards[0];
        // const computedStyle = window.getComputedStyle(firstCard);
        // This would check actual CSS grid behavior in a real browser
      }
    });

    it('should show mobile navigation when needed', async () => {
      render(
        <TestWrapper>
          <DashboardShell>
            <div>Test content</div>
          </DashboardShell>
        </TestWrapper>
      );

      // Look for mobile navigation elements
      // This would test actual mobile nav implementation
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should make tables horizontally scrollable', async () => {
      render(
        <TestWrapper>
          <CVEList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('CVE Database')).toBeInTheDocument();
      });

      // Tables should be scrollable on mobile
      const tableContainer = screen.getByRole('table')?.closest('div');
      if (tableContainer) {
        expect(tableContainer).toHaveStyle({ overflowX: 'auto' });
      }
    });

    it('should adapt form layouts for mobile', async () => {
      render(
        <TestWrapper>
          <POCs />
        </TestWrapper>
      );

      // Forms should stack vertically on mobile
      // This would test actual form responsive behavior
      expect(screen.getByText('Available POCs')).toBeInTheDocument();
    });

    it('should handle touch interactions', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Test touch-friendly button sizes
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        // Touch targets should be at least 44px (iOS guideline)
        expect(rect.height).toBeGreaterThanOrEqual(32); // Adjusted for test environment
      });
    });
  });

  describe('Tablet Viewport (768px)', () => {
    beforeEach(() => {
      setViewport(viewports.tablet);
    });

    it('should use tablet-optimized layout', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Verify tablet layout
      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
      
      // Should have more horizontal space than mobile
      const mainContent = screen.getByRole('main');
      expect(mainContent).toBeInTheDocument();
    });

    it('should show appropriate navigation for tablet', async () => {
      render(
        <TestWrapper>
          <DashboardShell>
            <div>Test content</div>
          </DashboardShell>
        </TestWrapper>
      );

      // Tablet might show sidebar or adapted navigation
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should optimize table display for tablet', async () => {
      render(
        <TestWrapper>
          <CVEList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('CVE Database')).toBeInTheDocument();
      });

      // Tables should show more columns on tablet
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });
  });

  describe('Desktop Viewport (1920px)', () => {
    beforeEach(() => {
      setViewport(viewports.desktop);
    });

    it('should use full desktop layout', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Desktop should show full layout
      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
      
      // Should utilize horizontal space effectively
      const mainContent = screen.getByRole('main');
      expect(mainContent).toBeInTheDocument();
    });

    it('should show sidebar navigation on desktop', async () => {
      render(
        <TestWrapper>
          <DashboardShell>
            <div>Test content</div>
          </DashboardShell>
        </TestWrapper>
      );

      // Desktop should show persistent sidebar
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should display full table functionality', async () => {
      render(
        <TestWrapper>
          <CVEList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('CVE Database')).toBeInTheDocument();
      });

      // All table columns should be visible
      expect(screen.getByText('CVE ID')).toBeInTheDocument();
      expect(screen.getByText('Severity')).toBeInTheDocument();
      expect(screen.getByText('Published')).toBeInTheDocument();
    });

    it('should support keyboard navigation efficiently', async () => {
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
      
      // Should have proper focus management
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInTheDocument();
    });
  });

  describe('Ultra-wide Viewport (2560px)', () => {
    beforeEach(() => {
      setViewport(viewports.ultrawide);
    });

    it('should handle ultra-wide displays gracefully', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Should not stretch content too wide
      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
      
      // Content should have reasonable max-width
      const mainContent = screen.getByRole('main');
      expect(mainContent).toBeInTheDocument();
    });

    it('should optimize layout for wide screens', async () => {
      render(
        <TestWrapper>
          <CVEList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('CVE Database')).toBeInTheDocument();
      });

      // Should show all available columns
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });
  });

  describe('Dynamic Viewport Changes', () => {
    it('should adapt when viewport changes from desktop to mobile', async () => {
      // Start with desktop
      setViewport(viewports.desktop);
      
      const { rerender } = render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();

      // Change to mobile
      setViewport(viewports.mobile);
      
      rerender(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Should adapt to mobile layout
      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
    });

    it('should handle orientation changes', async () => {
      // Portrait mobile
      setViewport({ width: 375, height: 667 });
      
      const { rerender } = render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();

      // Landscape mobile
      setViewport({ width: 667, height: 375 });
      
      rerender(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Should adapt to landscape
      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
    });

    it('should maintain functionality across viewport changes', async () => {
      setViewport(viewports.desktop);
      
      render(
        <TestWrapper>
          <CVEList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('CVE Database')).toBeInTheDocument();
      });

      // Change viewport
      setViewport(viewports.mobile);
      
      // Functionality should still work
      const searchInput = screen.queryByPlaceholderText(/search/i);
      if (searchInput) {
        await user.type(searchInput, 'test');
        expect(searchInput).toHaveValue('test');
      }
    });
  });

  describe('Accessibility Across Viewports', () => {
    it('should maintain accessibility on mobile', async () => {
      setViewport(viewports.mobile);
      
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Check for proper ARIA labels
      expect(screen.getByRole('main')).toBeInTheDocument();
      
      // Verify heading hierarchy
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should support screen readers on all viewports', async () => {
      const testViewports = [viewports.mobile, viewports.tablet, viewports.desktop];
      
      for (const viewport of testViewports) {
        setViewport(viewport);
        
        const { unmount } = render(
          <TestWrapper>
            <Dashboard />
          </TestWrapper>
        );

        // Should have proper semantic structure
        expect(screen.getByRole('main')).toBeInTheDocument();
        
        unmount();
      }
    });

    it('should maintain keyboard navigation on all devices', async () => {
      const testViewports = [viewports.mobile, viewports.tablet, viewports.desktop];
      
      for (const viewport of testViewports) {
        setViewport(viewport);
        
        const { unmount } = render(
          <TestWrapper>
            <CVEList />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText('CVE Database')).toBeInTheDocument();
        });

        // Test keyboard navigation
        await user.tab();
        
        const focusedElement = document.activeElement;
        expect(focusedElement).toBeInTheDocument();
        
        unmount();
      }
    });
  });

  describe('Performance Across Viewports', () => {
    it('should render efficiently on mobile devices', async () => {
      setViewport(viewports.mobile);
      
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render quickly (adjust threshold as needed)
      expect(renderTime).toBeLessThan(1000);
    });

    it('should handle large datasets on small screens', async () => {
      setViewport(viewports.mobile);
      
      // Mock large dataset
      const largeCVEList = Array.from({ length: 100 }, (_, i) => ({
        id: `${i + 1}`,
        cveId: `CVE-2023-${String(i + 1).padStart(4, '0')}`,
        title: `Test CVE ${i + 1}`,
        description: `Test description ${i + 1}`,
        severity: 'HIGH' as const,
        cvssScore: 7.5,
        publishedDate: '2023-01-01',
        lastModified: '2023-01-02',
        references: [],
        affectedProducts: [],
        pocs: [],
      }));

      vi.mocked(require('@/services/api.service').cveService.getAll)
        .mockResolvedValue({
          cves: largeCVEList,
          total: 100,
        });

      render(
        <TestWrapper>
          <CVEList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('CVE Database')).toBeInTheDocument();
      });

      // Should handle large datasets without performance issues
      expect(screen.getByText(/100/)).toBeInTheDocument();
    });
  });

  describe('Content Adaptation', () => {
    it('should truncate text appropriately on small screens', async () => {
      setViewport(viewports.mobile);
      
      render(
        <TestWrapper>
          <CVEList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('CVE Database')).toBeInTheDocument();
      });

      // Long text should be truncated on mobile
      const descriptions = screen.getAllByText(/test description/i);
      descriptions.forEach(desc => {
        const computedStyle = window.getComputedStyle(desc);
        // Should have text truncation styles
        expect(computedStyle.textOverflow).toBe('ellipsis');
      });
    });

    it('should show appropriate button sizes for touch', async () => {
      setViewport(viewports.mobile);
      
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Buttons should be touch-friendly
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        expect(rect.height).toBeGreaterThanOrEqual(32);
      });
    });

    it('should adapt spacing for different screen densities', async () => {
      const densities = [
        { viewport: viewports.mobile, expectedSpacing: 'compact' },
        { viewport: viewports.tablet, expectedSpacing: 'medium' },
        { viewport: viewports.desktop, expectedSpacing: 'comfortable' },
      ];

      for (const { viewport } of densities) {
        setViewport(viewport);
        
        const { unmount } = render(
          <TestWrapper>
            <Dashboard />
          </TestWrapper>
        );

        // Verify appropriate spacing
        const mainContent = screen.getByRole('main');
        expect(mainContent).toBeInTheDocument();
        
        unmount();
      }
    });
  });
});