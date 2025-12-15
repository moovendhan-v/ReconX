/**
 * API Integration Layer Usage Examples
 * 
 * This file demonstrates how to use the enhanced API services
 * in your React components and other parts of the application.
 */

import { cveService, pocService } from '../api.service';
import type { CVE, ExecuteRequest } from '../../types';

// Example 1: Fetching CVEs with filtering
export async function fetchCVEsExample() {
  try {
    // Get all CVEs with pagination
    const response = await cveService.getAll({
      page: 1,
      limit: 20,
      search: 'SQL injection',
      severity: 'HIGH'
    });

    console.log(`Found ${response.total} CVEs`);
    console.log('CVEs:', response.cves);

    return response;
  } catch (error) {
    console.error('Failed to fetch CVEs:', error);
    throw error;
  }
}

// Example 2: Getting CVE details with POCs
export async function fetchCVEDetailsExample(cveId: string) {
  try {
    const cveDetails = await cveService.getById(cveId);
    
    console.log('CVE Details:', cveDetails);
    console.log('Associated POCs:', cveDetails.pocs);

    return cveDetails;
  } catch (error) {
    console.error('Failed to fetch CVE details:', error);
    throw error;
  }
}

// Example 3: Creating a new CVE
export async function createCVEExample() {
  try {
    const newCVE: Partial<CVE> = {
      cveId: 'CVE-2024-1234',
      title: 'Example Vulnerability',
      description: 'This is an example vulnerability for demonstration',
      severity: 'MEDIUM',
      cvssScore: '6.5',
      affectedProducts: ['Example Product v1.0'],
      references: ['https://example.com/advisory']
    };

    const createdCVE = await cveService.create(newCVE);
    console.log('Created CVE:', createdCVE);

    return createdCVE;
  } catch (error) {
    console.error('Failed to create CVE:', error);
    throw error;
  }
}

// Example 4: Uploading a POC script
export async function uploadPOCExample(scriptFile: File, cveId: string) {
  try {
    const formData = pocService.createUploadFormData({
      script: scriptFile,
      cveId: cveId,
      name: 'Example POC Script',
      description: 'This is an example POC for demonstration',
      language: 'python',
      author: 'Security Researcher',
      usageExamples: 'python script.py --target http://example.com'
    });

    const uploadedPOC = await pocService.upload(formData);
    console.log('Uploaded POC:', uploadedPOC);

    return uploadedPOC;
  } catch (error) {
    console.error('Failed to upload POC:', error);
    throw error;
  }
}

// Example 5: Executing a POC
export async function executePOCExample(pocId: string, targetUrl: string) {
  try {
    const executeRequest: ExecuteRequest = {
      targetUrl: targetUrl,
      command: 'python script.py --target ' + targetUrl,
      additionalParams: {
        timeout: 30,
        verbose: true
      }
    };

    const executionResult = await pocService.execute(pocId, executeRequest);
    
    console.log('Execution Result:', executionResult);
    console.log('Output:', executionResult.result.output);
    console.log('Success:', executionResult.result.success);

    return executionResult;
  } catch (error) {
    console.error('Failed to execute POC:', error);
    throw error;
  }
}

// Example 6: Getting execution logs
export async function getExecutionLogsExample(pocId: string) {
  try {
    const logs = await pocService.getLogs(pocId, 10);
    
    console.log('Recent execution logs:', logs);
    
    // Get execution statistics
    const stats = await pocService.getExecutionStatistics(pocId);
    console.log('Execution statistics:', stats);

    return { logs, stats };
  } catch (error) {
    console.error('Failed to get execution logs:', error);
    throw error;
  }
}

// Example 7: Error handling with retry logic
export async function robustAPICallExample() {
  try {
    // The API service automatically handles retries for network errors
    const cves = await cveService.getAll({ limit: 5 });
    
    return cves;
  } catch (error) {
    // Handle different types of errors
    if (error instanceof Error) {
      if (error.name === 'APIException') {
        const apiError = error as any;
        console.error(`API Error ${apiError.status}: ${apiError.message}`);
        
        // Handle specific error codes
        switch (apiError.code) {
          case 'NETWORK_ERROR':
            console.log('Network issue - check connection');
            break;
          case 'HTTP_ERROR':
            console.log('Server error - try again later');
            break;
          default:
            console.log('Unknown error occurred');
        }
      }
    }
    
    throw error;
  }
}

// Example 8: Using advanced filtering and search
export async function advancedSearchExample() {
  try {
    // Search for specific CVEs
    const searchResults = await cveService.search('remote code execution');
    console.log('Search results:', searchResults);

    // Get CVEs by severity
    const criticalCVEs = await cveService.getBySeverity('CRITICAL');
    console.log('Critical CVEs:', criticalCVEs);

    // Get recent CVEs (last 7 days)
    const recentCVEs = await cveService.getRecent(7);
    console.log('Recent CVEs:', recentCVEs);

    // Get overall statistics
    const stats = await cveService.getStatistics();
    console.log('CVE Statistics:', stats);

    return {
      searchResults,
      criticalCVEs,
      recentCVEs,
      stats
    };
  } catch (error) {
    console.error('Advanced search failed:', error);
    throw error;
  }
}

// Example 9: React Hook usage pattern
export function useAPIServices() {
  return {
    // CVE operations
    fetchCVEs: (filters = {}) => cveService.getAll(filters),
    fetchCVE: (id: string) => cveService.getById(id),
    createCVE: (data: Partial<CVE>) => cveService.create(data),
    updateCVE: (id: string, data: Partial<CVE>) => cveService.update(id, data),
    deleteCVE: (id: string) => cveService.delete(id),
    
    // POC operations
    fetchPOCs: (filters = {}) => pocService.getAll(filters),
    fetchPOC: (id: string) => pocService.getById(id),
    uploadPOC: (formData: FormData) => pocService.upload(formData),
    executePOC: (id: string, request: ExecuteRequest) => pocService.execute(id, request),
    fetchLogs: (id: string, limit?: number) => pocService.getLogs(id, limit),
    deletePOC: (id: string) => pocService.delete(id),
    
    // Utility functions
    createPOCFormData: pocService.createUploadFormData.bind(pocService),
    getExecutionStats: pocService.getExecutionStatistics.bind(pocService),
  };
}