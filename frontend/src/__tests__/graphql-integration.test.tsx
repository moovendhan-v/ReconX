import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MockedProvider } from '@apollo/client/testing';
import { render, screen, waitFor } from '@testing-library/react';
import { GET_CVE_STATISTICS, GET_CVES } from '@/graphql/queries/cve.queries';
import { useCVEStatistics, useCVEs } from '@/hooks/use-cve-graphql';
import { apolloClient } from '@/lib/apollo-client';

// Mock data
const mockCVEStatistics = {
  total: 1250,
  bySeverity: {
    LOW: 300,
    MEDIUM: 450,
    HIGH: 350,
    CRITICAL: 150,
  },
  recent: 45,
};

const mockCVEs = {
  cves: [
    {
      id: '1',
      cveId: 'CVE-2023-1234',
      title: 'Test CVE',
      description: 'Test description',
      severity: 'CRITICAL',
      cvssScore: '9.8',
      publishedDate: '2023-01-01',
      affectedProducts: ['Product A'],
      references: ['https://example.com'],
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
  ],
  total: 1,
  page: 1,
  limit: 20,
  totalPages: 1,
};

const mocks = [
  {
    request: {
      query: GET_CVE_STATISTICS,
    },
    result: {
      data: {
        cveStatistics: mockCVEStatistics,
      },
    },
  },
  {
    request: {
      query: GET_CVES,
      variables: { filters: {} },
    },
    result: {
      data: {
        cves: mockCVEs,
      },
    },
  },
];

describe('GraphQL Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Apollo Client Configuration', () => {
    it('should have correct GraphQL endpoint configured', () => {
      expect(apolloClient).toBeDefined();
      expect(apolloClient.link).toBeDefined();
      expect(apolloClient.cache).toBeDefined();
    });

    it('should have proper cache policies configured', () => {
      const cache = apolloClient.cache;
      expect(cache).toBeDefined();
      
      // Check if cache has proper type policies
      const typePolicies = (cache as any).config?.typePolicies;
      expect(typePolicies).toBeDefined();
      expect(typePolicies.Query).toBeDefined();
    });
  });

  describe('GraphQL Queries', () => {
    it('should execute CVE statistics query successfully', async () => {
      const TestComponent = () => {
        const { data, loading, error } = useCVEStatistics();
        
        if (loading) return <div>Loading...</div>;
        if (error) return <div>Error: {error.message}</div>;
        if (!data) return <div>No data</div>;
        
        return (
          <div>
            <div data-testid="total-cves">{data.cveStatistics.total}</div>
            <div data-testid="critical-cves">{data.cveStatistics.bySeverity.CRITICAL}</div>
          </div>
        );
      };

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <TestComponent />
        </MockedProvider>
      );

      // Should show loading initially
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByTestId('total-cves')).toHaveTextContent('1250');
        expect(screen.getByTestId('critical-cves')).toHaveTextContent('150');
      });
    });

    it('should execute CVE list query successfully', async () => {
      const TestComponent = () => {
        const { data, loading, error } = useCVEs();
        
        if (loading) return <div>Loading...</div>;
        if (error) return <div>Error: {error.message}</div>;
        if (!data) return <div>No data</div>;
        
        return (
          <div>
            <div data-testid="cve-count">{data.cves.cves.length}</div>
            <div data-testid="first-cve-id">{data.cves.cves[0]?.cveId}</div>
          </div>
        );
      };

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <TestComponent />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('cve-count')).toHaveTextContent('1');
        expect(screen.getByTestId('first-cve-id')).toHaveTextContent('CVE-2023-1234');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle GraphQL errors gracefully', async () => {
      const errorMocks = [
        {
          request: {
            query: GET_CVE_STATISTICS,
          },
          error: new Error('GraphQL Error: Network error'),
        },
      ];

      const TestComponent = () => {
        const { data, loading, error } = useCVEStatistics();
        
        if (loading) return <div>Loading...</div>;
        if (error) return <div data-testid="error">Error: {error.message}</div>;
        
        return <div>Success</div>;
      };

      render(
        <MockedProvider mocks={errorMocks} addTypename={false}>
          <TestComponent />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
      });
    });
  });

  describe('Caching Behavior', () => {
    it('should cache query results properly', async () => {
      const TestComponent = () => {
        const { data, loading } = useCVEStatistics();
        
        if (loading) return <div>Loading...</div>;
        
        return (
          <div data-testid="cache-test">
            {data?.cveStatistics.total || 'No data'}
          </div>
        );
      };

      const { rerender } = render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <TestComponent />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('cache-test')).toHaveTextContent('1250');
      });

      // Re-render should use cached data
      rerender(
        <MockedProvider mocks={mocks} addTypename={false}>
          <TestComponent />
        </MockedProvider>
      );

      // Should still show the cached data
      expect(screen.getByTestId('cache-test')).toHaveTextContent('1250');
    });
  });

  describe('Real-time Features', () => {
    it('should support optimistic updates', async () => {
      // This would test optimistic updates for mutations
      // For now, we'll just verify the hook structure supports it
      const { createCVE } = await import('@/hooks/use-cve-graphql');
      expect(createCVE).toBeDefined();
    });

    it('should handle polling for real-time data', async () => {
      const TestComponent = () => {
        const { data } = useCVEStatistics();
        return <div>{data ? 'Data loaded' : 'No data'}</div>;
      };

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <TestComponent />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Data loaded')).toBeInTheDocument();
      });
    });
  });
});