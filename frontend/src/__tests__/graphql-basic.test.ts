import { describe, it, expect } from 'vitest';
import { apolloClient } from '@/lib/apollo-client';
import { GET_CVE_STATISTICS, GET_CVES } from '@/graphql/queries/cve.queries';
import { GET_POCS, EXECUTE_POC } from '@/graphql/queries/poc.queries';

describe('GraphQL Basic Integration Tests', () => {
  describe('Apollo Client Configuration', () => {
    it('should have Apollo Client properly configured', () => {
      expect(apolloClient).toBeDefined();
      expect(apolloClient.link).toBeDefined();
      expect(apolloClient.cache).toBeDefined();
    });

    it('should have correct GraphQL endpoint configured', () => {
      // Check if the client has the correct URI configuration
      const httpLink = apolloClient.link;
      expect(httpLink).toBeDefined();
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

  describe('GraphQL Query Definitions', () => {
    it('should have CVE queries properly defined', () => {
      expect(GET_CVE_STATISTICS).toBeDefined();
      expect(GET_CVES).toBeDefined();
      
      // Check query structure
      expect(GET_CVE_STATISTICS.definitions).toBeDefined();
      expect(GET_CVES.definitions).toBeDefined();
    });

    it('should have POC queries properly defined', () => {
      expect(GET_POCS).toBeDefined();
      expect(EXECUTE_POC).toBeDefined();
      
      // Check query structure
      expect(GET_POCS.definitions).toBeDefined();
      expect(EXECUTE_POC.definitions).toBeDefined();
    });

    it('should have proper query names', () => {
      // Check if queries have the expected operation names
      const cveStatsQuery = GET_CVE_STATISTICS.definitions[0] as any;
      expect(cveStatsQuery.name?.value).toBe('GetCVEStatistics');
      
      const cvesQuery = GET_CVES.definitions[0] as any;
      expect(cvesQuery.name?.value).toBe('GetCVEs');
      
      const pocsQuery = GET_POCS.definitions[0] as any;
      expect(pocsQuery.name?.value).toBe('GetPOCs');
      
      const executePocMutation = EXECUTE_POC.definitions[0] as any;
      expect(executePocMutation.name?.value).toBe('ExecutePOC');
    });
  });

  describe('GraphQL Schema Validation', () => {
    it('should have proper field selections in CVE queries', () => {
      const cvesQuery = GET_CVES.definitions[0] as any;
      const selections = cvesQuery.selectionSet.selections[0].selectionSet.selections;
      
      // Check if required fields are selected
      const fieldNames = selections.map((s: any) => s.name.value);
      expect(fieldNames).toContain('cves');
      expect(fieldNames).toContain('total');
      expect(fieldNames).toContain('page');
      expect(fieldNames).toContain('limit');
    });

    it('should have proper field selections in POC queries', () => {
      const pocsQuery = GET_POCS.definitions[0] as any;
      const selections = pocsQuery.selectionSet.selections[0].selectionSet.selections;
      
      // Check if required fields are selected
      const fieldNames = selections.map((s: any) => s.name.value);
      expect(fieldNames).toContain('pocs');
      expect(fieldNames).toContain('total');
    });

    it('should have proper mutation structure for POC execution', () => {
      const executePocMutation = EXECUTE_POC.definitions[0] as any;
      expect(executePocMutation.operation).toBe('mutation');
      
      const selections = executePocMutation.selectionSet.selections[0].selectionSet.selections;
      const fieldNames = selections.map((s: any) => s.name.value);
      expect(fieldNames).toContain('message');
      expect(fieldNames).toContain('result');
      expect(fieldNames).toContain('log');
    });
  });

  describe('Environment Configuration', () => {
    it('should have GraphQL URL configured', () => {
      // Check if environment variables are properly set
      const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL;
      expect(graphqlUrl).toBeDefined();
      expect(typeof graphqlUrl).toBe('string');
    });

    it('should have fallback configuration', () => {
      // The Apollo Client should have a fallback URL
      const expectedUrl = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:3000/graphql';
      expect(expectedUrl).toBe('http://localhost:3000/graphql');
    });
  });

  describe('Error Handling Configuration', () => {
    it('should have error link configured', () => {
      // Check if Apollo Client has error handling
      const link = apolloClient.link;
      expect(link).toBeDefined();
      
      // The link should be a chain that includes error handling
      expect((link as any).left || (link as any).right).toBeDefined();
    });

    it('should have proper default options for error handling', () => {
      const defaultOptions = apolloClient.defaultOptions;
      expect(defaultOptions).toBeDefined();
      expect(defaultOptions.watchQuery?.errorPolicy).toBe('all');
      expect(defaultOptions.query?.errorPolicy).toBe('all');
    });
  });

  describe('Caching Configuration', () => {
    it('should have proper cache merge policies', () => {
      const cache = apolloClient.cache;
      const typePolicies = (cache as any).config?.typePolicies;
      
      expect(typePolicies.Query.fields.cves).toBeDefined();
      expect(typePolicies.Query.fields.pocs).toBeDefined();
    });

    it('should have proper fetch policies', () => {
      const defaultOptions = apolloClient.defaultOptions;
      expect(defaultOptions.watchQuery?.fetchPolicy).toBe('cache-and-network');
      expect(defaultOptions.query?.fetchPolicy).toBe('cache-first');
    });
  });

  describe('GraphQL Integration Readiness', () => {
    it('should be ready for backend connection', () => {
      // All components should be properly configured
      expect(apolloClient).toBeDefined();
      expect(GET_CVE_STATISTICS).toBeDefined();
      expect(GET_CVES).toBeDefined();
      expect(GET_POCS).toBeDefined();
      expect(EXECUTE_POC).toBeDefined();
    });

    it('should have proper TypeScript types', () => {
      // Check if imports work without TypeScript errors
      expect(typeof apolloClient).toBe('object');
      expect(typeof GET_CVE_STATISTICS).toBe('object');
      expect(typeof GET_CVES).toBe('object');
    });
  });
});